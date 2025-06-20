'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import QuotationForm from '@/components/dashboard/QuotationForm'
import { useEffect, useState } from 'react'
import { UserProvider, useUser } from '@/components/dashboard/UserContext'

export default function QuotePage() {
  return (
    <UserProvider>
      <QuotePageContent />
    </UserProvider>
  )
}

function QuotePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')
  const [submitted, setSubmitted] = useState(false)
  const { user, loading } = useUser()

  useEffect(() => {
    if (!orderId) {
      router.push('/dashboard')
    }
  }, [orderId, router])

  if (!orderId || loading || !user) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Submit Quotation for Order</h2>
        {!submitted ? (
          <QuotationForm orderId={orderId} userId={user.id} onQuotationAdded={() => setSubmitted(true)} />
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="text-green-700 text-lg font-semibold text-center">Quotation submitted successfully!</div>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 