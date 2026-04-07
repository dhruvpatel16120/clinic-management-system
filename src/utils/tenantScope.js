import { collection, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'

export const DEFAULT_TRIAL_DAYS = 14

export function slugifyWorkspaceName(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export function buildClinicId(clinicName = '', city = '') {
  const base = slugifyWorkspaceName(`${clinicName}-${city}`) || `clinic-${Date.now()}`
  return base.slice(0, 56)
}

export function buildClinicScopedQuery(collectionName, clinicId, ...constraints) {
  if (!clinicId) {
    throw new Error(`Cannot query ${collectionName} without a clinic workspace`)
  }

  return query(
    collection(db, collectionName),
    where('clinicId', '==', clinicId),
    ...constraints
  )
}

export function withClinicScope(payload, clinicId, extras = {}) {
  return {
    ...payload,
    clinicId,
    ...extras
  }
}

export function isClinicScopedRecord(record, clinicId) {
  return Boolean(record?.clinicId) && record.clinicId === clinicId
}

export function createTrialWindow(days = DEFAULT_TRIAL_DAYS) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + days)
  return expiresAt.toISOString()
}
