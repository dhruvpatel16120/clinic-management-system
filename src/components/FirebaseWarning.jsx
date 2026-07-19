import React from 'react'
import { AlertTriangle, Copy, CheckCircle, RefreshCw, FileCode } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FirebaseWarning() {
  const envVars = [
    { key: 'VITE_FIREBASE_API_KEY', value: import.meta.env.VITE_FIREBASE_API_KEY, placeholder: 'AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' },
    { key: 'VITE_FIREBASE_AUTH_DOMAIN', value: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, placeholder: 'your-project.firebaseapp.com' },
    { key: 'VITE_FIREBASE_PROJECT_ID', value: import.meta.env.VITE_FIREBASE_PROJECT_ID, placeholder: 'your-project-id' },
    { key: 'VITE_FIREBASE_STORAGE_BUCKET', value: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, placeholder: 'your-project.appspot.com' },
    { key: 'VITE_FIREBASE_MESSAGING_SENDER_ID', value: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, placeholder: '123456789' },
    { key: 'VITE_FIREBASE_APP_ID', value: import.meta.env.VITE_FIREBASE_APP_ID, placeholder: '1:123456789:web:abcdef123456' }
  ]

  const isConfigured = (item) => {
    return item.value && item.value !== item.placeholder && !item.value.includes('your-')
  }

  const handleCopyEnvTemplate = () => {
    const template = envVars.map(v => `${v.key}=${isConfigured(v) ? v.value : ''}`).join('\n')
    navigator.clipboard.writeText(template)
    toast.success('Env template copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white antialiased relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-900/50 to-slate-900"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/20 overflow-hidden">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl mb-6 shadow-2xl shadow-amber-500/25 animate-bounce">
            <AlertTriangle className="w-10 h-10 text-slate-900" />
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent mb-3 leading-tight">
            Firebase Configuration Required
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-md mb-8">
            To run the Life Clinic Management System, you need to connect your own Firebase project.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center">
              <span className="w-2 h-2 bg-amber-400 rounded-full mr-2 animate-ping" />
              Configuration Checklist
            </h3>
            
            <div className="space-y-3">
              {envVars.map((item) => {
                const configured = isConfigured(item)
                return (
                  <div key={item.key} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                    <div className="flex flex-col">
                      <span className="text-xs font-mono text-slate-300">{item.key}</span>
                      <span className="text-[10px] text-slate-500">
                        {configured ? 'Configured' : 'Missing or using placeholder'}
                      </span>
                    </div>
                    {configured ? (
                      <div className="flex items-center space-x-1 text-emerald-400 text-xs font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        <span>Ready</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-amber-400 text-xs font-semibold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Pending</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center">
              <FileCode className="w-5 h-5 text-blue-400 mr-2" />
              Setup Instructions
            </h3>
            <ol className="text-sm text-slate-300 space-y-3 pl-4 list-decimal">
              <li>
                Create a file named <code className="bg-white/10 px-2 py-0.5 rounded text-amber-300 font-mono">.env</code> in the root directory of this project.
              </li>
              <li>
                Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors hover:underline">Firebase Console</a>, create a project, and register a Web App.
              </li>
              <li>
                Copy the Firebase SDK configuration keys and paste them into your <code className="bg-white/10 px-2 py-0.5 rounded text-amber-300 font-mono">.env</code> file.
              </li>
            </ol>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleCopyEnvTemplate}
            className="flex-1 py-4 px-6 border-2 border-white/20 bg-white/5 hover:border-blue-400/40 hover:bg-blue-400/10 text-white font-medium rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/20 flex items-center justify-center space-x-2 cursor-pointer text-sm"
          >
            <Copy className="w-5 h-5" />
            <span>Copy Env Template</span>
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-slate-900 font-bold text-lg rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Check / Refresh</span>
          </button>
        </div>
      </div>
    </div>
  )
}
