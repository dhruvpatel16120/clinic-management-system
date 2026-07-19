import { createContext, useEffect, useState } from 'react'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'
import {
  createUserWithRole,
  signInUser,
  resetUserPassword,
  resendUserVerificationEmail,
  fetchUserRoleFromFirestore
} from '../utils/authUtils'

const AuthContext = createContext()

export { AuthContext }
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  async function signup(email, password, fullName, role) {
    return await createUserWithRole(email, password, fullName, role)
  }

  async function login(email, password) {
    return await signInUser(email, password)
  }

  async function logout() {
    if (auth) {
      await signOut(auth)
    }
  }

  async function resetPassword(email) {
    const cleanEmail = email.toLowerCase().trim()
    const limitKey = `forgot_password_attempts_${cleanEmail}`
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    
    const attemptsStr = localStorage.getItem(limitKey) || '[]'
    let attempts = []
    try {
      attempts = JSON.parse(attemptsStr)
    } catch (e) {
      attempts = []
    }
    
    attempts = attempts.filter(timestamp => now - timestamp < oneHour)
    
    if (attempts.length >= 3) {
      throw new Error('Too many password reset requests. Please wait at least an hour before trying again.')
    }
    
    const result = await resetUserPassword(email)
    
    attempts.push(now)
    localStorage.setItem(limitKey, JSON.stringify(attempts))
    
    return result
  }

  async function resendVerificationEmail() {
    if (currentUser) {
      const limitKey = `resend_verification_attempts_${currentUser.uid}`
      const now = Date.now()
      const oneHour = 60 * 60 * 1000
      
      const attemptsStr = localStorage.getItem(limitKey) || '[]'
      let attempts = []
      try {
        attempts = JSON.parse(attemptsStr)
      } catch (e) {
        attempts = []
      }
      
      attempts = attempts.filter(timestamp => now - timestamp < oneHour)
      
      if (attempts.length >= 3) {
        throw new Error('Too many verification email requests. Please wait at least an hour before trying again.')
      }
      
      const result = await resendUserVerificationEmail(currentUser)
      
      attempts.push(now)
      localStorage.setItem(limitKey, JSON.stringify(attempts))
      
      return result
    }
  }



  async function fetchUserRole(uid) {
    try {
      return await fetchUserRoleFromFirestore(uid)
    } catch (error) {
      console.error('Error fetching user role:', error)
      return null
    }
  }

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user)
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
