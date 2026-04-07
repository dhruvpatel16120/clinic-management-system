import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { fetchUserProfileFromFirestore } from '../../utils/authUtils'
import { productName } from '../../data/saasContent'

export default function Login() {
  const navigate = useNavigate()
  const { login, firebaseEnabled } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const user = await login(email, password)
      const profile = await fetchUserProfileFromFirestore(user.uid)

      if (!profile?.clinicId) {
        setError('This account needs workspace migration before it can access clinic data.')
        setIsLoading(false)
        return
      }

      if (profile.role === 'doctor') {
        navigate('/doctor')
      } else if (profile.role === 'receptionist') {
        navigate('/receptionist')
      } else {
        navigate('/')
      }
    } catch (authError) {
      console.error('Login error:', authError)

      let errorMessage = 'Failed to sign in. Please try again.'

      if (authError.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.'
      } else if (authError.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.'
      } else if (authError.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.'
      } else if (authError.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.'
      } else if (authError.message) {
        errorMessage = authError.message
      }

      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,#18314f,transparent_35%),linear-gradient(180deg,#07111f_0%,#0d1726_55%,#10192b_100%)] px-5 py-6 text-slate-100 sm:px-8">
      <div className="mx-auto flex min-h-[100dvh] max-w-6xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[34px] border border-white/10 bg-white/5 p-7 backdrop-blur-sm sm:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-cyan-300/12 text-cyan-200">
              <Building2 className="h-5 w-5" />
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.32em] text-cyan-300/70">Clinic Workspace</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
              Sign in to {productName}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              Access your clinic dashboard, continue your trial, and keep patient operations inside
              your own workspace boundary.
            </p>

            <div className="mt-8 space-y-3">
              <div className="rounded-[22px] border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-200">
                Owner onboarding, role-based access, and clinic-scoped records are now part of the base setup.
              </div>
              <div className="rounded-[22px] border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-200">
                Old demo accounts without a workspace will need migration before production use.
              </div>
            </div>

            {!firebaseEnabled ? (
              <div className="mt-8 rounded-[22px] border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm leading-6 text-amber-100">
                Live workspace sign-in is disabled on this public build until the Firebase project is connected.
              </div>
            ) : null}

            <div className="mt-8 flex items-center gap-3 text-sm text-slate-300">
              <ShieldCheck className="h-4 w-4 text-cyan-200" />
              India-first onboarding and compliance-ready rollout guidance included
            </div>
          </section>

          <section className="rounded-[34px] border border-white/10 bg-slate-950/32 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop-blur-sm sm:p-9">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">Sign In</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                  Return to your clinic workspace
                </h2>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Email address</span>
                <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="owner@clinic.com"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
                <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
                  <LockKeyhole className="h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    required
                  />
                </div>
              </label>

              <div className="flex items-center justify-between gap-3 text-sm">
                <Link to="/forgot-password" className="text-cyan-200 transition hover:text-white">
                  Forgot password?
                </Link>
                <Link to="/legal" className="text-slate-400 transition hover:text-white">
                  Legal checklist
                </Link>
              </div>

              {error ? (
                <div className="rounded-[18px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isLoading || !firebaseEnabled}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? 'Signing in...' : firebaseEnabled ? 'Sign in to workspace' : 'Firebase setup required'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">New clinic?</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Create a 14-day trial workspace, choose your subscription plan, and capture the
                legal acknowledgements during signup.
              </p>
              <Link
                to="/signup"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-200 transition hover:text-white"
              >
                Create workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
