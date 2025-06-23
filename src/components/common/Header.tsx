'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Logo from './Logo'

export default function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  
  // Check if we're on auth pages (login, register, forgot-password)
  const isAuthPage = pathname?.startsWith('/login') || 
                    pathname?.startsWith('/register') || 
                    pathname?.startsWith('/forgot-password')
  
  // Only show profile button if user is authenticated and not on auth pages
  const showProfileButton = status === 'authenticated' && session && !isAuthPage

  return (
    <header className="w-full bg-white/80 shadow-md py-2 px-4 flex items-center justify-between z-20 sticky top-0 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Logo />
        <div className="ml-2">
          <span className="block text-xl font-bold text-blue-900">DBGT Private Limited</span>
          <span className="block text-xs text-blue-700">Tuticorin Harbour, Tamil Nadu</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:block text-blue-900 font-semibold text-sm">E-Procurement Portal</div>
        {showProfileButton && (
          <Link 
            href="/dashboard/profile" 
            className="px-4 py-2 bg-blue-100 text-blue-900 rounded hover:bg-blue-200 font-semibold transition-colors"
          >
            Profile
          </Link>
        )}
      </div>
    </header>
  )
} 