"use client"
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import QuotationForm from '@/components/dashboard/QuotationForm'
import QuotationList from '@/components/dashboard/QuotationList'
import DashboardLoading from '../loading'
import { UserProvider, useUser } from '@/components/dashboard/UserContext'
import UserAvatar from '@/components/common/UserAvatar'

type Quotation = {
  id: string
  productService: string
  description: string
  categories: string[]
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
}

export default function VendorDashboardPage() {
  return (
    <UserProvider>
      <VendorDashboard />
    </UserProvider>
  )
}

function VendorDashboard() {
  const { user, loading } = useUser()
  const { status } = useSession()
  const router = useRouter()
  const [quotations, setQuotations] = useState<any[]>([])
  const [openOrders, setOpenOrders] = useState<any[]>([])
  const [showQuotationForm, setShowQuotationForm] = useState(false)
  const [previewOrderModal, setPreviewOrderModal] = useState<any | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (user && user.role === 'VENDOR') {
      Promise.all([
        fetch(`/api/quotations?userId=${user.id}`).then(res => res.json()),
        fetch('/api/vendor/orders').then(res => res.json()),
      ])
        .then(([quotationData, orderData]) => {
          setQuotations(quotationData.quotations || [])
          setOpenOrders(orderData.orders || [])
          setTimeout(() => setPageLoading(false), 6000)
        })
        .catch(() => setPageLoading(false))
    } else {
      setPageLoading(false)
    }
  }, [user, status, router])

  const handleQuotationAdded = (quotation: any) => {
    setQuotations(prev => [quotation, ...prev])
    setShowQuotationForm(false)
  }

  const handleQuotationDeleted = (id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id))
  }

  if (status === 'loading' || loading || pageLoading || !user) {
    return <DashboardLoading />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <UserAvatar name={user.fullName} size={40} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user.fullName}
              </h1>
              <p className="text-sm text-gray-600">Vendor ID: {user.vendorId}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Logout
          </button>
        </div>
        <div className="px-4 py-6 sm:px-0">
          {!showQuotationForm ? (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Vendor Dashboard
                </h2>
                <button
                  onClick={() => setShowQuotationForm(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Apply for Quotation
                </button>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Your Quotations
                </h3>
                <QuotationList quotations={quotations} onDelete={handleQuotationDeleted} />
              </div>
              <div className="mt-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Open Orders
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {openOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.productName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => setPreviewOrderModal(order)}
                              className="text-blue-600 hover:text-blue-900 underline"
                            >
                              Preview
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {previewOrderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
                    <button onClick={() => setPreviewOrderModal(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
                    <h2 className="text-xl font-bold mb-4">Order Preview</h2>
                    <div className="space-y-2 mb-4">
                      <div><span className="font-semibold">Order ID:</span> {previewOrderModal.id}</div>
                      <div><span className="font-semibold">Product Name:</span> {previewOrderModal.productName}</div>
                      <div><span className="font-semibold">Description:</span> {previewOrderModal.description}</div>
                      <div><span className="font-semibold">Quantity:</span> {previewOrderModal.quantity}</div>
                      {previewOrderModal.specifications && <div><span className="font-semibold">Specifications:</span> {previewOrderModal.specifications}</div>}
                    </div>
                    <button
                      onClick={() => { setPreviewOrderModal(null); router.push(`/dashboard/quote?orderId=${previewOrderModal.id}`) }}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                    >
                      Quote
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Submit New Quotation
                </h2>
                <button
                  onClick={() => setShowQuotationForm(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
              <QuotationForm userId={user.id} onQuotationAdded={handleQuotationAdded} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 