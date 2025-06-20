'use client'

import { useState, useEffect } from 'react'
import Logo from '@/components/common/Logo'

export default function DashboardLoading() {
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <Logo />
        {showText && <p className="text-gray-600 text-lg">Loading dashboard...</p>}
      </div>
    </div>
  )
} 