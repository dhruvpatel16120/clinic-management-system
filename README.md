# ClinicNova

ClinicNova is a tenant-aware clinic operations SaaS built from the original clinic management system repository. This version is positioned for paid clinic subscriptions in India and now includes:

- clinic workspace creation during signup
- clinic-scoped Firestore reads and writes
- India-focused pricing and launch messaging
- Saharanpur/UP launch documentation and compliance notes
- safer Firestore rules and indexes for multi-tenant rollout

## What Changed

The original project was a single-clinic style demo app. This SaaS conversion adds a basic workspace model on top of the React + Firebase stack so the product can be sold as a B2B clinic software subscription rather than a one-off deployment.

Key product changes:

- landing page rewritten as a SaaS homepage
- legal and launch guidance page added at `/legal`
- signup now creates a `clinics/{clinicId}` workspace and ties the first staff account to it
- app queries now scope appointments, medicines, prescriptions, invoices, and payments by `clinicId`
- public queue display is intentionally treated as staff-only until a sanitized kiosk feed is built

## Launch Docs

Read these before taking real clinic data or charging customers:

- [SaaS launch playbook](./docs/SAAS_LAUNCH_PLAYBOOK_INDIA.md)
- [Legal and compliance checklist](./docs/LEGAL_COMPLIANCE_SAHARANPUR.md)
- [Firestore tenancy migration guide](./docs/FIRESTORE_TENANCY_MIGRATION.md)

## Environment

Copy `env.example.txt` to `.env` and update the Firebase values.

```bash
cp env.example.txt .env
```

Important values:

```env
VITE_APP_NAME=ClinicNova
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Firestore Rollout

Before production:

1. deploy the updated Firestore rules in [firestore-rules.txt](./firestore-rules.txt)
2. deploy the updated composite indexes in [firestore-indexes.json](./firestore-indexes.json)
3. backfill `clinicId` into legacy records using the migration guide
4. test with two separate clinic workspaces to confirm isolation

## Business Note

This repo now gives you a workable product foundation, but not final legal approval. Before onboarding paying clinics, you still need:

- entity setup through MCA
- GST and invoicing review with a CA
- Privacy Policy, Terms of Service, and DPA review with a lawyer
- an incident response process for healthcare data

## License

The upstream repository is MIT licensed. Preserve the copyright and license notice when you commercialize or distribute this code.
