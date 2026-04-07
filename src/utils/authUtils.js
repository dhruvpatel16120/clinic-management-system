import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { buildClinicId, createTrialWindow } from './tenantScope'

function buildActionCodeSettings() {
  return {
    url: `${window.location.origin}/login`,
    handleCodeInApp: true,
    iOS: {
      bundleId: 'com.clinicnova.app'
    },
    android: {
      packageName: 'com.clinicnova.app',
      installApp: true,
      minimumVersion: '12'
    },
    dynamicLinkDomain: import.meta.env.VITE_FIREBASE_DYNAMIC_LINK_DOMAIN || undefined
  }
}

async function resolveClinicDocumentId(clinicName, clinicCity) {
  const baseClinicId = buildClinicId(clinicName, clinicCity)
  let candidateId = baseClinicId
  let sequence = 1

  while (true) {
    const clinicRef = doc(db, 'clinics', candidateId)
    const clinicSnap = await getDoc(clinicRef)

    if (!clinicSnap.exists()) {
      return candidateId
    }

    sequence += 1
    candidateId = `${baseClinicId}-${sequence}`.slice(0, 56)
  }
}

export async function createUserWithRole({
  email,
  password,
  fullName,
  role,
  clinicName,
  clinicCity,
  clinicState,
  plan = 'growth',
  businessType = 'general-clinic',
  clinicCountry = 'India',
  isClinicOwner = true
}) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user
  const createdAt = new Date().toISOString()
  const clinicId = await resolveClinicDocumentId(clinicName, clinicCity)

  await updateProfile(user, {
    displayName: fullName
  })

  const clinicProfile = {
    id: clinicId,
    slug: clinicId,
    name: clinicName,
    city: clinicCity,
    state: clinicState,
    country: clinicCountry,
    businessType,
    subscriptionPlan: plan,
    status: 'trial',
    ownerUid: user.uid,
    ownerName: fullName,
    ownerEmail: email,
    jurisdiction: 'India',
    operatingCity: clinicCity,
    billingCurrency: 'INR',
    queueDisplayMode: 'staff-only',
    trialEndsAt: createTrialWindow(),
    createdAt,
    updatedAt: createdAt
  }

  await setDoc(doc(db, 'clinics', clinicId), clinicProfile)

  await setDoc(doc(db, 'staffData', user.uid), {
    uid: user.uid,
    email: user.email,
    fullName,
    role,
    emailVerified: false,
    clinicId,
    clinicName,
    clinicCity,
    clinicState,
    clinicCountry,
    businessType,
    subscriptionPlan: plan,
    workspaceStatus: 'trial',
    isClinicOwner,
    complianceStatus: 'setup_pending',
    dataResidency: 'india-ready',
    createdAt,
    lastLogin: null,
    verificationEmailSent: createdAt,
    termsAcceptedAt: createdAt,
    privacyAcceptedAt: createdAt
  })

  await sendEmailVerification(user, buildActionCodeSettings())

  return {
    user,
    clinicId
  }
}

export async function signInUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  if (user.uid) {
    const userDocRef = doc(db, 'staffData', user.uid)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      await updateDoc(userDocRef, {
        lastLogin: new Date().toISOString(),
        emailVerified: user.emailVerified
      })
    } else {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        fullName: user.displayName || 'Unknown User',
        role: 'doctor',
        emailVerified: user.emailVerified,
        clinicId: null,
        workspaceStatus: 'migration_required',
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
  return await sendEmailVerification(user, buildActionCodeSettings())
}

export async function fetchUserProfileFromFirestore(uid) {
  try {
    const userDoc = await getDoc(doc(db, 'staffData', uid))
    if (userDoc.exists()) {
      return {
        uid,
        ...userDoc.data()
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function fetchUserRoleFromFirestore(uid) {
  const profile = await fetchUserProfileFromFirestore(uid)
  return profile?.role || null
}

export async function fetchClinicFromFirestore(clinicId) {
  if (!clinicId) {
    return null
  }

  try {
    const clinicDoc = await getDoc(doc(db, 'clinics', clinicId))
    if (clinicDoc.exists()) {
      return {
        id: clinicDoc.id,
        ...clinicDoc.data()
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching clinic profile:', error)
    return null
  }
}
