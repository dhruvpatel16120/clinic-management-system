export const productName = import.meta.env.VITE_APP_NAME || 'ClinicNova'

export const productTagline =
  'Appointments, token flow, prescriptions, and billing in one workspace for modern clinics in India.'

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
      'Founder-led onboarding checklist'
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
    title: 'Front desk to doctor flow',
    body: 'Appointments, token handling, prescriptions, and billing stay inside one shared clinic workspace.'
  },
  {
    title: 'Workspace-based access',
    body: "Each clinic gets its own workspace boundary so staff should not see other clinics' records."
  },
  {
    title: 'India-ready rollout',
    body: 'Built for local clinic onboarding, founder-led setup, and practical compliance preparation before scale.'
  }
]

export const pilotOffer = {
  badge: 'Founder-led pilot',
  title: 'Launch the first 5 clinics with a clean, low-friction offer.',
  summary:
    'ClinicNova is positioned as a guided 14-day rollout, not a software handoff. You map the workflow, onboard staff, and prove the daily value before asking for a full subscription.',
  highlights: [
    '14-day pilot with one clinic workspace and staff onboarding',
    'Reception, doctor, billing, and prescription workflows in one login flow',
    'Workflow mapping for the clinic owner and front-desk lead',
    'Go-live checklist before the clinic starts using real data'
  ]
}

export const demoJourney = [
  {
    step: '01',
    title: 'Register the patient at the front desk',
    body: 'Show a receptionist creating an appointment, selecting the patient, and issuing the next token without touching a paper register.'
  },
  {
    step: '02',
    title: 'Move the patient into the live queue',
    body: 'Open token management so the clinic sees the waiting list and patient flow without shouting names across the room.'
  },
  {
    step: '03',
    title: 'Hand off to the doctor workspace',
    body: 'Switch to the doctor view and show how the visit context carries into prescriptions and follow-up decisions.'
  },
  {
    step: '04',
    title: 'Create the invoice and capture payment',
    body: 'End the visit with a clean bill, payment record, and a printable document the clinic can actually use at the desk.'
  }
]

export const pilotTimeline = [
  {
    label: 'Call',
    title: 'Qualify the clinic in under 5 minutes',
    body: 'Confirm specialty, daily patient load, who runs the front desk, and whether the owner is open to a 14-day pilot.'
  },
  {
    label: 'Demo',
    title: 'Run the receptionist-to-doctor workflow',
    body: 'Use one clean demo story that shows booking, queue, prescription, and billing without wandering across every screen.'
  },
  {
    label: 'Pilot',
    title: 'Set up the live clinic workspace',
    body: 'Create the owner account, onboard staff, and keep the launch tight enough that the clinic sees value in the first week.'
  },
  {
    label: 'Convert',
    title: 'Move from trial to paid subscription',
    body: 'Close with a monthly plan only after the clinic has seen the workflow reduce front-desk confusion and manual follow-up.'
  }
]

export const founderSalesNotes = [
  'Lead with one clear problem: missed follow-ups, manual queues, or messy billing.',
  'Book the demo while you are still on the call instead of asking the clinic to think about it later.',
  'Show one realistic clinic story end-to-end instead of trying to tour every feature.',
  'Close the demo with a pilot offer, start date, and owner decision-maker.'
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
