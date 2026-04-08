import { createContext, useEffect, useState } from 'react'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, firebaseEnabled } from '../firebase/config'
import {
  createUserWithRole,
  signInUser,
  resetUserPassword,
  resendUserVerificationEmail,
  fetchUserProfileFromFirestore,
  fetchClinicFromFirestore
} from '../utils/authUtils'

const AuthContext = createContext()

export { AuthContext }

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [clinic, setClinic] = useState(null)
  const [loading, setLoading] = useState(true)

  async function signup(payload) {
    if (!firebaseEnabled) {
      throw new Error('Firebase is not configured for live workspace creation yet.')
    }

    return await createUserWithRole(payload)
  }

  async function login(email, password) {
    if (!firebaseEnabled) {
      throw new Error('Firebase is not configured for live sign-in yet.')
    }

    return await signInUser(email, password)
  }

  async function logout() {
    if (!auth) {
      return null
    }

    await signOut(auth)
  }

  async function resetPassword(email) {
    if (!firebaseEnabled) {
      throw new Error('Firebase is not configured for password resets yet.')
    }

    return await resetUserPassword(email)
  }

  async function resendVerificationEmail() {
    if (currentUser) {
      return await resendUserVerificationEmail(currentUser)
    }

    return null
  }

  async function refreshProfile(uid) {
    const profile = await fetchUserProfileFromFirestore(uid)
    setUserProfile(profile)
    setUserRole(profile?.role || null)

    if (profile?.clinicId) {
      const clinicProfile = await fetchClinicFromFirestore(profile.clinicId)
      setClinic(clinicProfile)
    } else {
      setClinic(null)
    }

    return profile
  }

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true)

      if (user) {
        setCurrentUser(user)
        await refreshProfile(user.uid)
      } else {
        setCurrentUser(null)
        setUserRole(null)
        setUserProfile(null)
        setClinic(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userRole,
    userProfile,
    clinic,
    clinicId: clinic?.id || userProfile?.clinicId || null,
    signup,
    login,
    logout,
    resetPassword,
    resendVerificationEmail,
    refreshProfile,
    loading,
    firebaseEnabled
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
