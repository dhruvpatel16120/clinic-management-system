import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, CheckCircle2, Mail, MapPin, ShieldCheck, Stethoscope, UserRound } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { pricingPlans, productName } from '../../data/saasContent'

const roleOptions = [
  {
    id: 'doctor',
    title: 'Doctor',
    description: 'Best if the clinic owner is a practicing doctor who will also use the clinical workflow.'
  },
  {
    id: 'receptionist',
    title: 'Operations Lead',
    description: 'Best if the first account belongs to the person running front-desk and clinic operations.'
  }
]

const businessTypes = [
  { value: 'general-clinic', label: 'General clinic' },
  { value: 'specialty-clinic', label: 'Specialty clinic' },
  { value: 'dental-clinic', label: 'Dental clinic' },
  { value: 'diagnostics', label: 'Diagnostics or pathology' }
]

export default function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'doctor',
    clinicName: '',
    clinicCity: 'Saharanpur',
    clinicState: 'Uttar Pradesh',
    businessType: 'general-clinic',
    plan: 'growth',
    isClinicOwner: true,
    acceptTerms: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (name, value) => {
    setFormData((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      return 'Enter the account owner or first staff member name.'
    }

    if (!formData.email.trim()) {
      return 'Enter a valid clinic email address.'
    }

    if (!formData.clinicName.trim()) {
      return 'Enter the clinic or workspace name.'
    }

    if (!formData.password || formData.password.length < 6) {
      return 'Password must be at least 6 characters long.'
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match.'
    }

    if (!formData.acceptTerms) {
      return 'You need to accept the privacy and platform terms before creating the workspace.'
    }

    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationMessage = validateForm()

    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
        clinicName: formData.clinicName,
        clinicCity: formData.clinicCity,
        clinicState: formData.clinicState,
        plan: formData.plan,
        businessType: formData.businessType,
        clinicCountry: 'India',
        isClinicOwner: formData.isClinicOwner
      })

      navigate('/verify-email', {
        state: {
          role: formData.role,
          email: formData.email,
          fullName: formData.fullName,
          clinicName: formData.clinicName,
          plan: formData.plan
        }
      })
    } catch (signupError) {
      console.error('Signup error:', signupError)

      let message = 'Failed to create the clinic workspace. Please try again.'

      if (signupError.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists.'
      } else if (signupError.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters long.'
      } else if (signupError.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.'
      }

      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top_left,#18314f,transparent_35%),linear-gradient(180deg,#07111f_0%,#0d1726_55%,#10192b_100%)] px-5 py-6 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <section className="rounded-[34px] border border-white/10 bg-white/5 p-7 backdrop-blur-sm sm:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-cyan-300/12 text-cyan-200">
              <Building2 className="h-5 w-5" />
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.32em] text-cyan-300/70">Trial Onboarding</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
              Launch your clinic workspace in {productName}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              This signup creates the clinic workspace, the first staff account, the trial plan, and the
              basic compliance acknowledgements you need before real customer rollout.
            </p>

            <div className="mt-8 space-y-3">
              <div className="rounded-[22px] border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-200">
                Default launch city is Saharanpur so you can start local sales immediately.
              </div>
              <div className="rounded-[22px] border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-200">
                Multi-clinic public rollout should happen only after Firestore migration and contract review.
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-cyan-300/20 bg-cyan-300/8 p-6">
              <p className="text-sm font-semibold text-white">Included in this onboarding</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-100">
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-cyan-200" />
                  14-day trial workspace with clinic metadata
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-cyan-200" />
                  Role-based first user account
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-cyan-200" />
                  India-first pricing and launch assumptions
                </li>
              </ul>
            </div>
          </section>

          <section className="rounded-[34px] border border-white/10 bg-slate-950/32 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop-blur-sm sm:p-9">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">Create Workspace</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                  Set up the owner account and clinic profile
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Full name</span>
                  <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
                    <UserRound className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(event) => handleChange('fullName', event.target.value)}
                      placeholder="Dr. Aditi Sharma"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Email address</span>
                  <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(event) => handleChange('email', event.target.value)}
                      placeholder="owner@clinic.com"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                      required
                    />
                  </div>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(event) => handleChange('password', event.target.value)}
                    placeholder="Create a strong password"
                    className="w-full rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Confirm password</span>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(event) => handleChange('confirmPassword', event.target.value)}
                    placeholder="Repeat your password"
                    className="w-full rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Clinic name</span>
                  <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
                    <Stethoscope className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.clinicName}
                      onChange={(event) => handleChange('clinicName', event.target.value)}
                      placeholder="Sharma Heart Clinic"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">City</span>
                  <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.clinicCity}
                      onChange={(event) => handleChange('clinicCity', event.target.value)}
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">State</span>
                  <input
                    type="text"
                    value={formData.clinicState}
                    onChange={(event) => handleChange('clinicState', event.target.value)}
                    className="w-full rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Business type</span>
                  <select
                    value={formData.businessType}
                    onChange={(event) => handleChange('businessType', event.target.value)}
                    className="w-full rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none [&>option]:bg-slate-950"
                  >
                    {businessTypes.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">First account role</span>
                  <div className="grid gap-3">
                    {roleOptions.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleChange('role', role.id)}
                        className={`rounded-[20px] border px-4 py-3 text-left transition ${
                          formData.role === role.id
                            ? 'border-cyan-300/35 bg-cyan-300/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <p className="text-sm font-semibold text-white">{role.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-300">{role.description}</p>
                      </button>
                    ))}
                  </div>
                </label>
              </div>

              <div>
                <span className="mb-3 block text-sm font-medium text-slate-200">Choose your plan</span>
                <div className="grid gap-3 lg:grid-cols-3">
                  {pricingPlans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => handleChange('plan', plan.id)}
                      className={`rounded-[24px] border p-4 text-left transition ${
                        formData.plan === plan.id
                          ? 'border-cyan-300/35 bg-cyan-300/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <p className="text-sm font-semibold text-white">{plan.name}</p>
                      <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-cyan-200">
                        {plan.price}
                        <span className="ml-1 text-xs font-normal text-slate-400">{plan.period}</span>
                      </p>
                      <p className="mt-2 text-xs leading-5 text-slate-300">{plan.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(event) => handleChange('acceptTerms', event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950 text-cyan-300"
                />
                <span>
                  I confirm that this clinic will use the platform under its own medical and business
                  licences, and I accept the privacy and SaaS platform terms for trial setup.
                </span>
              </label>

              <div className="flex items-center gap-3 rounded-[22px] border border-cyan-300/20 bg-cyan-300/8 px-4 py-4 text-sm text-slate-100">
                <ShieldCheck className="h-4 w-4 flex-none text-cyan-200" />
                Clinic data stays scoped to the workspace you create here. Legacy records still need a
                migration pass before production use.
              </div>

              {error ? (
                <div className="rounded-[18px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? 'Creating workspace...' : 'Create clinic workspace'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-8 text-sm text-slate-300">
              Already have a workspace?{' '}
              <Link to="/login" className="font-medium text-cyan-200 transition hover:text-white">
                Sign in here
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
