import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaEnvelope, FaArrowLeft, FaCircleCheck, FaTriangleExclamation, FaCircleNotch, FaArrowRight, FaStar } from 'react-icons/fa6'
import { useAuth } from '../../hooks/useAuth'

export default function ForgotPasswordForm() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Use Firebase password reset
      await resetPassword(email.trim());
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset error:', error);
      // Handle specific Firebase errors
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900 p-4 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-200 dark:bg-cyan-900/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-sky-200 dark:bg-sky-900/20 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-pulse animation-delay-2000"></div>
        </div>
        <div className="relative z-10 w-full max-w-md">
          <div className="w-full shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8">
            <div className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <FaCircleCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                Check Your Email
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400">
                If an account with <strong>{email}</strong> exists, we've sent a password reset link
              </p>
            </div>
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  What happens next?
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Check your email inbox (and spam folder)</li>
                  <li>• Click the reset link in the email</li>
                  <li>• Create a new password</li>
                  <li>• Sign in with your new password</li>
                </ul>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaEnvelope className="w-4 h-4 mr-2 inline" />
                  Resend Email
                </button>
                <Link to="/login">
                  <button className="w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                    <FaArrowLeft className="w-4 h-4 mr-2 inline" />
                    Back to Sign In
                  </button>
                </Link>
              </div>
            </div>
          </div>
          <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            <p>
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900 p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-200 dark:bg-cyan-900/20 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-sky-200 dark:bg-sky-900/20 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-pulse animation-delay-2000"></div>
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="w-full shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8">
          <div className="text-center pb-6">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full mb-4 shadow-lg">
                <FaStar className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 leading-tight">
              Forgot Your Password?
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 h-12 border-2 transition-all duration-300 border-gray-200 focus:border-blue-500 dark:border-gray-600 dark:focus:border-blue-400 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    disabled={isLoading}
                    required
                  />
                </div>
                {error && (
                  <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                    <FaTriangleExclamation className="w-4 h-4 mr-2" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                
                {/* Helpful information */}
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="mb-1"><strong>What happens next?</strong></p>
                  <ul className="space-y-1">
                    <li>• We'll process your password reset request</li>
                    <li>• If an account exists, we'll send a reset link</li>
                    <li>• Check your inbox (and spam folder)</li>
                    <li>• Click the link to create a new password</li>
                  </ul>
                </div>
              </div>
              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FaCircleNotch className="w-5 h-5 mr-2 animate-spin inline" />
                    Verifying & Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <FaArrowRight className="w-5 h-5 ml-2 inline" />
                  </>
                )}
              </button>
            </form>
            {/* Back to Login */}
            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
              >
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          <p>
            Remember your password?{' '}
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
