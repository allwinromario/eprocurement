'use client'

import LoginForm from '@/components/auth/LoginForm'
import Logo from '@/components/common/Logo'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const registered = searchParams?.get('registered') === 'true'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Harbor-themed decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-700 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-600 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div>
            <Logo />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-blue-100">
              Welcome to DBGT E-Procurement System
            </p>
            {registered && (
              <div className="mt-4 bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded text-center">
                Registration successful! Please log in.
              </div>
            )}
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
} 