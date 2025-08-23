import { createContext, useContext, useEffect, useState } from 'react'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  async function signup(email, password, fullName, role) {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update profile with display name
      await updateProfile(user, {
        displayName: fullName
      })

      // Configure action code settings for better email delivery
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
        iOS: {
          bundleId: 'com.clinicmanagement.app'
        },
        android: {
          packageName: 'com.clinicmanagement.app',
          installApp: true,
          minimumVersion: '12'
        },
        dynamicLinkDomain: import.meta.env.VITE_FIREBASE_DYNAMIC_LINK_DOMAIN || undefined
      }

      // Send email verification with improved settings
      await sendEmailVerification(user, actionCodeSettings)

      // Store user data in Firestore
      await setDoc(doc(db, 'staffData', user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: fullName,
        role: role,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        verificationEmailSent: new Date().toISOString()
      })

      return user
    } catch (error) {
      throw error
    }
  }

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update last login time
      if (user.uid) {
        await updateDoc(doc(db, 'staffData', user.uid), {
          lastLogin: new Date().toISOString()
        })
      }

      return user
    } catch (error) {
      throw error
    }
  }

  async function logout() {
    try {
      await signOut(auth)
    } catch (error) {
      throw error
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      throw error
    }
  }

  async function resendVerificationEmail() {
    try {
      if (currentUser) {
        await sendEmailVerification(currentUser)
      }
    } catch (error) {
      throw error
    }
  }

  async function fetchUserRole(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'staffData', uid))
      if (userDoc.exists()) {
        return userDoc.data().role
      }
      return null
    } catch (error) {
      console.error('Error fetching user role:', error)
      return null
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user)
        // Fetch user role from Firestore
        const role = await fetchUserRole(user.uid)
        setUserRole(role)
      } else {
        setCurrentUser(null)
        setUserRole(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userRole,
    signup,
    login,
    logout,
    resetPassword,
    resendVerificationEmail,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
