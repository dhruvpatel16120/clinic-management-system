import { Link } from 'react-router-dom'
import { ArrowRight, Building2, FileCheck2, ShieldCheck, Siren, WalletCards } from 'lucide-react'
import { legalReferenceLinks, productName } from '../data/saasContent'

const complianceSteps = [
  {
    icon: Building2,
    title: 'Form the business properly',
    body: 'Use an LLP or Private Limited Company before signing clinics on annual contracts and collecting recurring SaaS revenue.'
  },
  {
    icon: WalletCards,
    title: 'Close tax and billing setup',
    body: 'Work with a CA on GST registration timing, invoicing format, bookkeeping, and payment gateway setup for INR subscriptions.'
  },
  {
    icon: ShieldCheck,
    title: 'Publish data and security terms',
    body: 'You need a privacy policy, SaaS terms, and a clinic-facing data processing addendum before production use.'
  },
  {
    icon: Siren,
    title: 'Define incident response',
    body: 'Document who reports cyber incidents, how you preserve logs, and how you notify clinics and CERT-In when needed.'
  }
]

export default function LegalHub() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,#18223c,transparent_45%),linear-gradient(180deg,#07111f_0%,#0b1523_55%,#101d2e_100%)] text-slate-100">
      <div className="mx-auto flex min-h-[100dvh] max-w-6xl flex-col px-5 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">Legal Readiness</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              Launching {productName} from Saharanpur
            </h1>
          </div>
          <div className="flex gap-3">
            <Link
              to="/"
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:text-white"
            >
              Back to product
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
            >
              Create workspace
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[28px] border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
            <p className="max-w-3xl text-base leading-7 text-slate-300">
              The app can be sold as a B2B clinic SaaS in Saharanpur, but you should treat it as a
              healthcare data product, not a generic appointment app. That means entity setup, contracts,
              billing hygiene, and clinic-scoped data controls all need to be in place before go-live.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {complianceSteps.map((step) => {
                const Icon = step.icon
                return (
                  <article
                    key={step.title}
                    className="rounded-[24px] border border-white/8 bg-slate-950/30 p-5 transition hover:border-cyan-300/30 hover:bg-slate-950/40"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-white">{step.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{step.body}</p>
                  </article>
                )
              })}
            </div>
          </section>

          <aside className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/8 p-7">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">Current stance</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
              What this build now assumes
            </h2>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-100">
              <li>Clinic customers remain responsible for their own medical licences and clinical legality.</li>
              <li>You operate the software platform, subscription billing, support, and data safeguards.</li>
              <li>Public queue displays stay staff-only until a sanitized kiosk data feed is added.</li>
              <li>Production launch happens only after old Firestore records are backfilled with `clinicId`.</li>
            </ul>
          </aside>
        </div>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">Official Sources</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                Reference documents used for this rollout
              </h2>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:text-white"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {legalReferenceLinks.map((reference) => (
              <a
                key={reference.href}
                href={reference.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-[22px] border border-white/10 bg-slate-950/30 px-5 py-4 text-sm text-slate-200 transition hover:border-cyan-300/35 hover:bg-slate-950/45 hover:text-white"
              >
                {reference.label}
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
