import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

export async function createUserWithRole(email, password, fullName, role) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  await updateProfile(user, {
    displayName: fullName
  })

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

  await sendEmailVerification(user, actionCodeSettings)

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
}

export async function signInUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  if (user.uid) {
    // Check if the user document exists in Firestore
    const userDocRef = doc(db, 'staffData', user.uid)
    const userDoc = await getDoc(userDocRef)
    
    if (userDoc.exists()) {
      // Update existing document
      await updateDoc(userDocRef, {
        lastLogin: new Date().toISOString()
      })
    } else {
      // Create new document if it doesn't exist (fallback for users created before Firestore integration)
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        fullName: user.displayName || 'Unknown',
        role: 'doctor', // Default role - user can update this later
        emailVerified: user.emailVerified,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        verificationEmailSent: null
      })
    }
  }

  return user
}

export async function resetUserPassword(email) {
  return await sendPasswordResetEmail(auth, email)
}

export async function resendUserVerificationEmail(user) {
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
  
  return await sendEmailVerification(user, actionCodeSettings)
}

export async function fetchUserRoleFromFirestore(uid) {
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


