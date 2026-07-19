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
    <div className="min-h-screen bg-gradient-to-br from-slate-955 via-slate-900 to-slate-955 text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight mb-2">Firebase Configuration Required</h1>
          <p className="text-slate-400 max-w-md mb-8">
            To run the Life Clinic Management System, you need to connect your own Firebase project.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center">
              <span className="w-2 h-2 bg-amber-400 rounded-full mr-2" />
              Configuration Checklist
            </h3>
            
            <div className="space-y-3">
              {envVars.map((item) => {
                const configured = isConfigured(item)
                return (
                  <div key={item.key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex flex-col">
                      <span className="text-xs font-mono text-slate-300">{item.key}</span>
                      <span className="text-[10px] text-slate-500">
                        {configured ? 'Configured' : 'Missing or using placeholder'}
                      </span>
                    </div>
                    {configured ? (
                      <div className="flex items-center space-x-1 text-emerald-400 text-xs">
                        <CheckCircle className="w-4 h-4" />
                        <span>Ready</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-amber-400 text-xs">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Pending</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center">
              <FileCode className="w-4 h-4 text-blue-400 mr-2" />
              Setup Instructions
            </h3>
            <ol className="text-xs text-slate-400 space-y-3 pl-4 list-decimal">
              <li>
                Create a file named <code className="bg-white/5 px-1.5 py-0.5 rounded text-amber-300 font-mono">.env</code> in the root directory of this project.
              </li>
              <li>
                Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Firebase Console</a>, create a project, and register a Web App.
              </li>
              <li>
                Copy the Firebase SDK configuration keys and paste them into your <code className="bg-white/5 px-1.5 py-0.5 rounded text-amber-300 font-mono">.env</code> file.
              </li>
            </ol>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleCopyEnvTemplate}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all font-medium text-sm cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Env Template</span>
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all font-medium text-sm shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Check Again / Refresh</span>
          </button>
        </div>
      </div>
    </div>
  )
}
