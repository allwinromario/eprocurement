'use client'

import LoginForm from '@/components/auth/LoginForm'
import Logo from '@/components/common/Logo'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const registered = searchParams?.get('registered') === 'true'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-2 sm:py-4 md:py-6 lg:py-8 px-2 sm:px-4 md:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced Tuticorin Harbour background with multiple layers */}
      <div className="absolute inset-0 z-0">
        {/* Primary harbour image */}
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          alt="Tuticorin Harbour - Port and shipping activities"
          className="w-full h-full object-cover opacity-20"
          style={{ filter: 'blur(1px)' }}
        />
        {/* Secondary overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/85 to-blue-900/90" />
        {/* Animated wave effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-800/60 to-transparent animate-pulse" />
      </div>
      
      {/* Floating elements for visual interest */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-20 w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-white/25 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-10 w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '3s' }} />
      </div>

      {/* Content */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl space-y-8 relative z-10 flex flex-col justify-center" style={{ maxHeight: '90vh' }}>
        <div className="bg-white/25 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-white/40 overflow-y-auto" style={{ maxHeight: '80vh' }}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-16 sm:w-40 sm:h-20 md:w-48 md:h-24 mb-2">
              <Logo />
            </div>
            <h1 className="mt-2 sm:mt-4 text-center text-2xl sm:text-3xl font-extrabold text-white drop-shadow-lg">
              Sign in to your account
            </h1>
            <div className="text-center space-y-1">
              <p className="text-sm sm:text-base text-blue-100 font-medium">
                Welcome to DBGT E-Procurement System
              </p>
              <p className="text-xs sm:text-sm text-blue-200">
                Tuticorin Harbour, Tamil Nadu
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-300 font-medium">Secure Portal</span>
              </div>
            </div>
            {registered && (
              <div className="mt-4 bg-green-100/90 backdrop-blur-sm border border-green-300/50 text-green-800 px-4 py-3 rounded-xl text-center text-xs sm:text-sm font-medium shadow-lg">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Registration successful! Please log in.
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 sm:mt-8">
            <LoginForm />
          </div>
          
          {/* Footer branding */}
          <div className="mt-6 pt-4 border-t border-white/20 text-center">
            <p className="text-xs text-blue-200">
              Powered by DBGT Private Limited
            </p>
            <p className="text-xs text-blue-300 mt-1">
              Modern E-Procurement Solutions
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 