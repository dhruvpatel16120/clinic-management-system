export const productName = import.meta.env.VITE_APP_NAME || 'ClinicFlow Cloud'

export const productTagline =
  'Clinic operations SaaS for independent practices and fast-growing clinics in India.'

export const pricingPlans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'INR 2,499',
    period: '/month',
    description: 'Best for one-doctor clinics moving off paper registers and WhatsApp follow-ups.',
    highlights: [
      '1 clinic workspace',
      'Up to 4 staff accounts',
      'Appointments, prescriptions, billing',
      'Email support and onboarding checklist'
    ]
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 'INR 5,999',
    period: '/month',
    description: 'Best for busy OPD clinics that need better front-desk coordination and reporting.',
    highlights: [
      'Up to 12 staff accounts',
      'Queue management and payment tracking',
      'Priority setup support',
      'Basic compliance and audit exports'
    ]
  },
  {
    id: 'multi-location',
    name: 'Multi-Location',
    price: 'Custom',
    period: '',
    description: 'For chains, diagnostic groups, and operator-led rollouts across multiple facilities.',
    highlights: [
      'Multiple clinic workspaces',
      'Centralized owner oversight',
      'Custom onboarding and migration help',
      'Dedicated SLA and legal review support'
    ]
  }
]

export const trustPillars = [
  {
    title: 'India-ready onboarding',
    body: 'Built for clinics that need a fast path from local operations to a subscription software workflow.'
  },
  {
    title: 'Workspace-based access',
    body: 'Each clinic gets its own workspace boundary so staff should not see other clinics’ records.'
  },
  {
    title: 'Compliance-first rollout',
    body: 'The app now carries launch guidance for DPDP, contracts, cyber incident handling, and clinic accountability.'
  }
]

export const launchChecklist = [
  'Register your business entity before taking recurring B2B payments.',
  'Publish Privacy Policy, Terms of Service, and a clinic-facing data processing addendum.',
  'Use tenant-scoped Firestore data and migrate all legacy records before production go-live.',
  'Keep the public queue display staff-only until you ship a sanitized kiosk feed.',
  'Appoint an incident contact and define a CERT-In response workflow.'
]

export const legalReferenceLinks = [
  {
    label: 'DPDP Rules, 2025 notification',
    href: 'https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf'
  },
  {
    label: 'Draft DPDP Rules notice',
    href: 'https://www.meity.gov.in/writereaddata/files/Notice-%20Draft%20Digital%20Personal%20Data%20Protection%20Rules%2C2025.pdf'
  },
  {
    label: 'CERT-In Cyber Security Directions FAQs',
    href: 'https://www.cert-in.org.in/PDF/FAQs_on_CyberSecurityDirections_May2022.pdf'
  },
  {
    label: 'MCA SPICe+ incorporation guide',
    href: 'https://www.mca.gov.in/content/dam/mca/videos/audio_pdfs/Video_SPICeplus_AudioText.pdf'
  },
  {
    label: 'UP Startup Policy 2020 (First Amendment 2022)',
    href: 'https://startinup.up.gov.in/wp-content/uploads/2023/01/Startup-Policy-english_091122.pdf'
  },
  {
    label: 'CBIC sectoral GST FAQs',
    href: 'https://cbic-gst.gov.in/sectoral-faq.html'
  }
]
