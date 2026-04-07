# SaaS Launch Playbook

## Product Positioning

ClinicNova should be sold as a B2B clinic operations SaaS, not as a custom software project. The cleanest positioning for Saharanpur and nearby districts is:

- independent single-doctor clinics
- dental clinics
- specialist OPD centers
- diagnostics or small multi-doctor facilities

Do not launch as a telemedicine platform or e-pharmacy yet. That would add separate regulatory complexity.

## Recommended Pricing

Start with three plans and keep onboarding human:

| Plan | Price | Best for |
| --- | --- | --- |
| Starter | INR 2,499/month | 1 doctor clinic, 2-4 staff |
| Growth | INR 5,999/month | Busy OPD, multiple desks, more reporting |
| Multi-Location | Custom annual contract | Chains, groups, or diagnostics |

Pricing notes:

- offer a 14-day free trial
- push annual prepay with 10-15% discount
- keep setup or migration help as a paid add-on
- do not compete only on low price; compete on clinic onboarding and support

## Best Initial GTM for Saharanpur

Start local first:

1. pilot with 2-3 clinics in Saharanpur
2. sit with front-desk staff and watch real workflow
3. close one paid conversion before expanding to nearby cities
4. collect testimonials, screenshots, and case studies from real clinics

Good channels:

- direct outreach to local clinics
- doctor and receptionist referrals
- local CA and medical equipment vendor referrals
- WhatsApp demo booking plus in-person onboarding

## Business Model You Should Use

Use a recurring subscription model with optional services:

- monthly or annual SaaS fee
- one-time data migration/setup fee
- premium onboarding for multi-staff clinics
- enterprise contract for chains or diagnostics groups

Avoid these early:

- revenue share
- marketplace commissions
- per-patient billing

They complicate trust, taxes, and pricing conversations unnecessarily.

## What This Codebase Now Supports

- clinic workspace creation at signup
- tenant-scoped app data using `clinicId`
- receptionist and doctor workflows inside one clinic workspace
- billing, invoices, payments, and prescriptions under a workspace
- India-focused SaaS landing page and legal hub

## What Still Needs Manual Work

- create a fresh Firebase production project
- deploy the new Firestore rules and indexes
- migrate old data with `clinicId`
- set up your domain, support email, and payment gateway
- finalize legal docs with a lawyer and CA

## Suggested 30-Day Execution Plan

### Week 1

- finalize brand, domain, and production Firebase project
- form entity with MCA
- deploy updated rules and indexes
- prepare privacy policy, SaaS terms, and DPA draft

### Week 2

- migrate sample/legacy data into clinic-scoped records
- onboard one local pilot clinic
- capture actual workflow gaps from receptionist and doctor usage

### Week 3

- add payment gateway and invoice numbering policy
- improve export/reporting based on pilot feedback
- produce Hindi/English sales one-pager if needed

### Week 4

- convert first pilot to paid account
- collect testimonial and case study
- start outreach to nearby clinics in western Uttar Pradesh
