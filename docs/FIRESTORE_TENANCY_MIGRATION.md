# Firestore Tenancy Migration Guide

The updated app expects every clinic-facing record to carry a `clinicId`. Old demo data without `clinicId` will not be safe or production-ready.

## Collections That Must Be Backfilled

- `staffData`
- `appointments`
- `prescriptions`
- `medicines`
- `invoices`
- `payments`

## Required Migration Order

1. create the clinic workspace document in `clinics/{clinicId}`
2. update every staff member in `staffData` with the same `clinicId`
3. backfill all operational records with that `clinicId`
4. only then deploy strict Firestore rules in production

## Minimum Fields By Collection

### `clinics/{clinicId}`

- `id`
- `slug`
- `name`
- `city`
- `state`
- `subscriptionPlan`
- `status`
- `ownerUid`

### `staffData/{uid}`

- `clinicId`
- `clinicName`
- `role`
- `isClinicOwner`
- `workspaceStatus`

### Business Records

Each of these now needs at least:

- `clinicId`
- existing business fields already used by the page

For new appointments, also keep:

- `doctorId`
- `doctorName`
- `createdBy`

## Production Safety Check

Before using real clinic data:

1. sign up two separate clinic workspaces
2. create sample appointments and invoices in each
3. verify one clinic user cannot see the other clinic’s records
4. verify list queries still work after indexes finish building

## Important Note

Do not re-enable any public queue or public record route until you build a separate sanitized collection for display-only data. The main `appointments` documents contain sensitive clinic information and should remain staff-only.
