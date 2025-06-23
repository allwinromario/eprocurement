"use client"
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import QuotationForm from '@/components/dashboard/QuotationForm'
import QuotationList from '@/components/dashboard/QuotationList'
import DashboardLoading from '../loading'
import { UserProvider, useUser } from '@/components/dashboard/UserContext'
import UserAvatar from '@/components/common/UserAvatar'
import toast from 'react-hot-toast'

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
  const [tab, setTab] = useState<'active' | 'history'>('active')
  const [orderQuotations, setOrderQuotations] = useState<any[]>([])
  const [modalLoading, setModalLoading] = useState(false)
  const [showQuotationsModal, setShowQuotationsModal] = useState<'pending' | 'approved' | 'rejected' | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (user && user.role === 'VENDOR') {
      setPageLoading(true)
      Promise.all([
        fetch(`/api/quotations?userId=${user.id}`).then(res => res.json()),
        fetch(`/api/vendor/orders${tab === 'history' ? '?history=true' : ''}`).then(res => res.json()),
      ])
        .then(([quotationData, orderData]) => {
          setQuotations(quotationData.quotations || [])
          setOpenOrders(orderData.orders || [])
          setTimeout(() => setPageLoading(false), 600)
        })
        .catch(() => setPageLoading(false))
    } else {
      setPageLoading(false)
    }
  }, [user, status, router, tab])

  const handleQuotationAdded = (quotation: any) => {
    setQuotations(prev => [quotation, ...prev])
    setShowQuotationForm(false)
    toast.success('Quotation submitted successfully!')
  }

  const handleQuotationDeleted = (id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id))
    toast.success('Quotation deleted!')
  }

  const openOrderModal = async (order: any) => {
    setPreviewOrderModal(order)
    setModalLoading(true)
    const res = await fetch(`/api/quotations?orderId=${order.id}`)
    const data = await res.json()
    setOrderQuotations(data.quotations || [])
    setModalLoading(false)
  }

  // Compute stats
  const totalQuotations = quotations.length
  const pendingQuotations = quotations.filter((q: any) => q.status === 'pending').length
  const approvedQuotations = quotations.filter((q: any) => q.status === 'approved').length
  const rejectedQuotations = quotations.filter((q: any) => q.status === 'rejected').length

  if (status === 'loading' || loading || pageLoading || !user) {
    return <DashboardLoading />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex flex-col">
      <div className="flex-1 max-w-5xl mx-auto py-8 px-2 sm:px-6 lg:px-8 w-full flex flex-col items-center justify-center">
        <div className="w-full bg-white/90 shadow-2xl rounded-2xl p-6 md:p-10 relative overflow-x-auto border border-blue-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-blue-900 drop-shadow">Vendor Dashboard</h2>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >Logout</button>
          </div>
          <div className="flex justify-center mb-6 gap-4">
            <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab==='active'?'bg-blue-700 text-white shadow':'bg-blue-100 text-blue-900'}`} onClick={()=>setTab('active')}>Active Orders</button>
            <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab==='history'?'bg-blue-700 text-white shadow':'bg-blue-100 text-blue-900'}`} onClick={()=>setTab('history')}>History</button>
          </div>
          {pageLoading ? (
            <DashboardLoading />
          ) : (
            <>
              {/* Enhanced Analytics/Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-200 to-blue-400 rounded-2xl p-4 sm:p-6 flex flex-col items-center shadow-lg border border-blue-100" role="status" aria-label={`Total Quotations: ${totalQuotations}`}>
                  <div className="text-3xl sm:text-4xl mb-2" aria-hidden="true">📄</div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-blue-900 drop-shadow">{totalQuotations}</span>
                  <span className="text-xs sm:text-sm text-blue-800 mt-1 font-semibold tracking-wide">Total Quotations</span>
                </div>
                <button
                  className="bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-2xl p-4 sm:p-6 flex flex-col items-center shadow-lg border border-yellow-200 hover:scale-105 hover:shadow-xl transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                  onClick={() => setShowQuotationsModal('pending')}
                  aria-label={`Show ${pendingQuotations} Pending Quotations`}
                  onKeyDown={(e) => e.key === 'Enter' && setShowQuotationsModal('pending')}
                >
                  <div className="text-3xl sm:text-4xl mb-2" aria-hidden="true">⏳</div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-yellow-900 drop-shadow">{pendingQuotations}</span>
                  <span className="text-xs sm:text-sm text-yellow-800 mt-1 font-semibold tracking-wide">Pending</span>
                </button>
                <button
                  className="bg-gradient-to-br from-green-100 to-green-300 rounded-2xl p-4 sm:p-6 flex flex-col items-center shadow-lg border border-green-200 hover:scale-105 hover:shadow-xl transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  onClick={() => setShowQuotationsModal('approved')}
                  aria-label={`Show ${approvedQuotations} Approved Quotations`}
                  onKeyDown={(e) => e.key === 'Enter' && setShowQuotationsModal('approved')}
                >
                  <div className="text-3xl sm:text-4xl mb-2" aria-hidden="true">✅</div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-green-900 drop-shadow">{approvedQuotations}</span>
                  <span className="text-xs sm:text-sm text-green-800 mt-1 font-semibold tracking-wide">Approved</span>
                </button>
                <button
                  className="bg-gradient-to-br from-red-100 to-red-300 rounded-2xl p-4 sm:p-6 flex flex-col items-center shadow-lg border border-red-200 hover:scale-105 hover:shadow-xl transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={() => setShowQuotationsModal('rejected')}
                  aria-label={`Show ${rejectedQuotations} Rejected Quotations`}
                  onKeyDown={(e) => e.key === 'Enter' && setShowQuotationsModal('rejected')}
                >
                  <div className="text-3xl sm:text-4xl mb-2" aria-hidden="true">❌</div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-red-900 drop-shadow">{rejectedQuotations}</span>
                  <span className="text-xs sm:text-sm text-red-800 mt-1 font-semibold tracking-wide">Rejected</span>
                </button>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Your Quotations</h3>
                <QuotationList quotations={quotations} onDelete={handleQuotationDeleted} />
              </div>
              <div className="mt-12">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Open Orders</h3>
                <div className="overflow-x-auto mb-8">
                  <table className="min-w-full divide-y divide-blue-100 rounded-lg overflow-hidden">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Product Name</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-50">
                      {openOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.productName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => openOrderModal(order)}
                              className="text-blue-600 hover:text-blue-900 underline"
                            >Preview</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {previewOrderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 relative">
                    <button onClick={() => setPreviewOrderModal(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
                    <h2 className="text-2xl font-bold mb-4">Order Preview</h2>
                    <div className="space-y-2 mb-4">
                      <div><span className="font-semibold">Order ID:</span> {previewOrderModal.id}</div>
                      <div><span className="font-semibold">Product Name:</span> {previewOrderModal.productName}</div>
                      <div><span className="font-semibold">Description:</span> {previewOrderModal.description}</div>
                      <div><span className="font-semibold">Quantity:</span> {previewOrderModal.quantity}</div>
                      {previewOrderModal.specifications && <div><span className="font-semibold">Specifications:</span> {previewOrderModal.specifications}</div>}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Quotations for this Order</h3>
                    {modalLoading ? <div>Loading quotations...</div> : (
                      <div className="overflow-x-auto mb-4">
                        <table className="min-w-full divide-y divide-blue-100 rounded-lg overflow-hidden">
                          <thead className="bg-blue-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-bold text-blue-700 uppercase">Vendor</th>
                              <th className="px-4 py-2 text-left text-xs font-bold text-blue-700 uppercase">Service</th>
                              <th className="px-4 py-2 text-left text-xs font-bold text-blue-700 uppercase">Description</th>
                              <th className="px-4 py-2 text-left text-xs font-bold text-blue-700 uppercase">Status</th>
                              <th className="px-4 py-2 text-left text-xs font-bold text-blue-700 uppercase">Approval Reason</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-blue-50">
                            {orderQuotations.length === 0 && <tr><td colSpan={5} className="text-center text-gray-400 py-4">No quotations</td></tr>}
                            {orderQuotations.map((q) => (
                              <tr key={q.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{q.user?.fullName || q.user?.vendorId || 'N/A'}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{q.productService}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{q.description}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    q.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    q.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {q.status}
                                  </span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{q.approvalReason || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {!quotations.some(q => q.orderId === previewOrderModal.id) && (
                      <button
                        onClick={() => { setPreviewOrderModal(null); router.push(`/dashboard/quote?orderId=${previewOrderModal.id}`) }}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full mt-4"
                      >
                        Submit Quotation
                      </button>
                    )}
                    {quotations.some(q => q.orderId === previewOrderModal.id && q.status === 'approved') && (
                      <div className="mt-4 p-4 bg-green-50 rounded">
                        <div className="font-semibold text-green-800">Your quotation was approved!</div>
                        <div className="text-green-700">Reason: {quotations.find(q => q.orderId === previewOrderModal.id && q.status === 'approved')?.approvalReason}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {showQuotationForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
              <button onClick={() => setShowQuotationForm(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
              <h2 className="text-xl font-bold mb-4">Submit New Quotation</h2>
              <QuotationForm userId={user.id} onQuotationAdded={handleQuotationAdded} />
            </div>
          </div>
        )}
        {/* Quotations Modal for Pending/Approved/Rejected */}
        {showQuotationsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4" role="dialog" aria-modal="true" aria-labelledby="quotations-modal-title">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-4 sm:p-8 relative border border-blue-100 max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowQuotationsModal(null)} 
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Close quotations modal"
              >&times;</button>
              <h2 id="quotations-modal-title" className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 sm:mb-6 text-center">{showQuotationsModal.charAt(0).toUpperCase() + showQuotationsModal.slice(1)} Quotations</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-100 rounded-lg overflow-hidden" role="table" aria-label={`${showQuotationsModal} quotations list`}>
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Quotation ID</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Product/Service</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Approval Reason</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-50">
                    {quotations.filter((q: any) => q.status === showQuotationsModal).map((q) => (
                      <tr key={q.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{q.id}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{q.productService}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            q.status === 'approved' ? 'bg-green-100 text-green-800' :
                            q.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{q.approvalReason || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 