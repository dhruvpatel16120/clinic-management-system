import { createContext, useEffect, useState } from 'react'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'
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
    return await createUserWithRole(payload)
  }

  async function login(email, password) {
    return await signInUser(email, password)
  }

  async function logout() {
    await signOut(auth)
  }

  async function resetPassword(email) {
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
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
