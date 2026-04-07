import { Link } from 'react-router-dom'
import { ArrowRight, Building2, CheckCircle2, Shield, Sparkles } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import {
  launchChecklist,
  pricingPlans,
  productName,
  productTagline,
  trustPillars
} from '../data/saasContent'

function DashboardLink({ userRole }) {
  if (userRole === 'doctor') {
    return '/doctor'
  }

  if (userRole === 'receptionist') {
    return '/receptionist'
  }

  return '/login'
}

export default function Home() {
  const { currentUser, userRole, clinic } = useAuth()
  const primaryHref = currentUser ? DashboardLink({ userRole }) : '/signup'

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top_left,#1a2f48,transparent_35%),radial-gradient(circle_at_right,#0f3550,transparent_24%),linear-gradient(180deg,#07111f_0%,#0d1726_56%,#10192b_100%)] text-slate-100">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-cyan-300/12 text-cyan-200 ring-1 ring-cyan-100/10">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-300/70">Clinic SaaS</p>
              <h1 className="text-lg font-semibold tracking-[-0.03em] text-white">{productName}</h1>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              to="/legal"
              className="rounded-full border border-white/10 px-4 py-2 text-slate-200 transition hover:border-cyan-300/35 hover:text-white"
            >
              Legal
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-white/10 px-4 py-2 text-slate-200 transition hover:border-cyan-300/35 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              to={primaryHref}
              className="rounded-full bg-cyan-300 px-5 py-2 font-semibold text-slate-950 transition hover:-translate-y-0.5"
            >
              {currentUser ? 'Open workspace' : 'Start 14-day trial'}
            </Link>
          </nav>
        </header>

        <main className="pb-16">
          <section className="grid gap-6 pt-10 lg:grid-cols-[1.08fr_0.92fr] lg:pt-14">
            <div className="rounded-[34px] border border-white/10 bg-white/5 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.22)] backdrop-blur-sm sm:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                Built for India-first clinics
              </div>

              <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-[0.96] tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
                Turn this clinic management app into a real subscription business.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                {productTagline} The product now includes workspace creation, India-focused pricing,
                tighter tenant boundaries, and a launch path tailored for Saharanpur and Uttar Pradesh.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={primaryHref}
                  className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
                >
                  {currentUser ? 'Go to dashboard' : 'Create clinic workspace'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/legal"
                  className="rounded-full border border-white/10 px-5 py-3 text-sm text-slate-200 transition hover:border-cyan-300/35 hover:text-white"
                >
                  Review legal path
                </Link>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {trustPillars.map((pillar) => (
                  <article
                    key={pillar.title}
                    className="rounded-[24px] border border-white/8 bg-slate-950/32 p-5 transition hover:border-cyan-300/25 hover:bg-slate-950/45"
                  >
                    <p className="text-sm font-semibold text-white">{pillar.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{pillar.body}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="grid gap-6">
              <section className="rounded-[32px] border border-cyan-300/20 bg-cyan-300/8 p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/50 text-cyan-200">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Workspace Status</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                      {clinic?.name || 'New clinic workspace'}
                    </h3>
                  </div>
                </div>
                <div className="mt-6 grid gap-3 text-sm text-slate-100">
                  <div className="rounded-[22px] border border-white/10 bg-slate-950/28 px-4 py-3">
                    Trial window: 14 days with owner onboarding and clinic-scoped access.
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-slate-950/28 px-4 py-3">
                    Launch region: Saharanpur, Uttar Pradesh with India-first billing and documentation.
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-slate-950/28 px-4 py-3">
                    Queue display mode: staff-only until you ship a sanitized public kiosk feed.
                  </div>
                </div>
              </section>

              <section className="rounded-[32px] border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">Launch Checklist</p>
                <ul className="mt-5 space-y-3">
                  {launchChecklist.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 rounded-[18px] border border-white/8 bg-slate-950/25 px-4 py-3 text-sm leading-6 text-slate-200"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-cyan-200" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">Pricing Model</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                  Sell it like a clinic operations product, not a one-off software project.
                </h3>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[0.92fr_1.08fr_0.92fr]">
              {pricingPlans.map((plan, index) => (
                <article
                  key={plan.id}
                  className={`rounded-[30px] border p-6 transition hover:-translate-y-1 ${
                    index === 1
                      ? 'border-cyan-300/30 bg-cyan-300/10 shadow-[0_22px_60px_rgba(19,90,109,0.22)]'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
                    {plan.name}
                  </p>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-4xl font-semibold tracking-[-0.05em] text-white">{plan.price}</span>
                    <span className="pb-1 text-sm text-slate-400">{plan.period}</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-300">{plan.description}</p>
                  <ul className="mt-6 space-y-3 text-sm text-slate-100">
                    {plan.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-cyan-200" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
