import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const appName = import.meta.env.VITE_APP_NAME || 'Life Clinic Management System'
  const redirectDelay = Number(import.meta.env.VITE_REDIRECT_DELAY_MS || 5000)

  useEffect(() => {
    const id = setTimeout(() => navigate('/login'), redirectDelay)
    return () => clearTimeout(id)
  }, [navigate, redirectDelay])

  useEffect(() => {
    document.title = `${appName} — Welcome`
  }, [appName])

  return (
    <div className="home-landing">
      {/* Component-scoped styles mirroring index.html */}
      <style>{`
        .home-landing {
          min-height: 100vh;
          min-width: 100%;
          display: grid;
          place-items: center;
          background: linear-gradient(120deg, #0f172a, #1e293b);
          background-size: 200% 200%;
          color: #e2e8f0;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, 'Apple Color Emoji', 'Segoe UI Emoji';
          animation: gradientShift 10s ease infinite;
        }
        .home-landing .container { text-align: center; padding: 32px 24px; width: min(560px, 92vw); }
        .home-landing .mark { width: 72px; height: 72px; margin: 0 auto 16px; position: relative; filter: drop-shadow(0 6px 16px rgba(34, 211, 238, 0.3)); animation: float 3s ease-in-out infinite; }
        .home-landing .mark::before, .home-landing .mark::after { content: ''; position: absolute; inset: 0; border-radius: 16px; }
        .home-landing .mark::before { background: radial-gradient(circle at 50% 50%, #22d3ee, transparent 65%); opacity: 0.6; }
        .home-landing .mark::after { background: conic-gradient(from 0deg, rgba(34,211,238,0.3), rgba(34,211,238,0.05), rgba(34,211,238,0.3)); -webkit-mask: radial-gradient(circle 22px at 50% 50%, transparent 98%, black 100%); mask: radial-gradient(circle 22px at 50% 50%, transparent 98%, black 100%); animation: spin 4s linear infinite; opacity: 0.9; }
        .home-landing h1 { margin: 0 0 8px; font-weight: 700; letter-spacing: 0.2px; font-size: clamp(22px, 4vw, 32px); animation: fadeInUp 900ms ease both; }
        .home-landing p { margin: 0 auto 18px; font-size: clamp(14px, 2.4vw, 16px); color: #cbd5e1; max-width: 46ch; line-height: 1.5; animation: fadeInUp 900ms ease 120ms both; }
        .home-landing .loader { width: 44px; height: 44px; margin: 18px auto 0; border-radius: 50%; border: 3px solid rgba(255, 255, 255, 0.25); border-top-color: #22d3ee; animation: spin 1s linear infinite; }
        .home-landing .hint { margin-top: 16px; font-size: 12px; color: #94a3b8; animation: fadeIn 1.2s ease 500ms both; }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .home-landing { animation: none; }
          .home-landing .mark { animation: none; }
          .home-landing .loader { animation: none; border-top-color: rgba(255,255,255,0.6); }
        }
      `}</style>

      <main className="container" role="main" aria-label="Welcome screen">
        <div className="mark" aria-hidden="true"></div>
        <h1>Welcome to {appName}</h1>
        <p>Getting things ready for you. Redirecting to login shortly…</p>
        <div className="loader" aria-hidden="true"></div>
        <div className="hint" aria-hidden="true">You will be redirected in about 5 seconds.</div>
      </main>
    </div>
  )
}


