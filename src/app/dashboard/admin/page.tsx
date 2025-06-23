"use client"
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import OrderForm from '@/components/dashboard/OrderForm'
import OrderTable from '@/components/dashboard/OrderTable'
import OrderPreviewModal from '@/components/dashboard/OrderPreviewModal'
import DashboardLoading from '../loading'
import QuotationList from '@/components/dashboard/QuotationList'
import toast from 'react-hot-toast'
import { UserProvider, useUser } from '@/components/dashboard/UserContext'
import UserAvatar from '@/components/common/UserAvatar'

export default function AdminDashboardPage() {
  return (
    <UserProvider>
      <AdminDashboard />
    </UserProvider>
  )
}

function AdminDashboard() {
  const { user, loading } = useUser()
  const { status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [previewOrder, setPreviewOrder] = useState<any | null>(null)
  const [showQuotationsModal, setShowQuotationsModal] = useState(false)
  const [adminQuotations, setAdminQuotations] = useState<any[]>([])
  const [adminQuotationsLoading, setAdminQuotationsLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [tab, setTab] = useState<'active' | 'history'>('active')
  const [orderQuotations, setOrderQuotations] = useState<any[]>([])
  const [modalLoading, setModalLoading] = useState(false)
  const [showOrdersModal, setShowOrdersModal] = useState<'pending' | 'approved' | 'completed' | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (user && user.role === 'ADMIN') {
      fetch(`/api/orders${tab === 'history' ? '?history=true' : ''}`)
        .then(res => res.json())
        .then(orderData => {
          setOrders(orderData.orders || [])
          setTimeout(() => setPageLoading(false), 600)
        })
        .catch(() => setPageLoading(false))
    } else {
      setPageLoading(false)
    }
  }, [user, status, router, tab])

  const handleOrderPlaced = (order: any) => {
    setOrders(prev => [order, ...prev])
    setShowOrderForm(false)
    toast.success('Order placed successfully!')
  }

  const handleViewQuotations = async () => {
    if (!user) return;
    setShowQuotationsModal(true)
    setAdminQuotationsLoading(true)
    const res = await fetch(`/api/admin/quotations?adminId=${user.id}`)
    const data = await res.json()
    setAdminQuotations(data.quotations || [])
    setAdminQuotationsLoading(false)
  }

  const openOrderModal = async (order: any) => {
    setPreviewOrder(order)
    setModalLoading(true)
    const res = await fetch(`/api/quotations?orderId=${order.id}`)
    const data = await res.json()
    setOrderQuotations(data.quotations || [])
    setModalLoading(false)
  }

  const handleApproveVendor = async (orderId: string, vendorId: string, approvalReason: string) => {
    try {
      const res = await fetch('/api/admin/quotations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, vendorId, approvalReason }),
      })
      const data = await res.json()
      if (res.ok) {
        setOrders(prev => prev.map((o: any) => o.id === orderId ? data.order : o))
        toast.success('Vendor approved and order completed!')
      } else {
        toast.error(data.error || 'Failed to approve vendor')
      }
    } catch (err) {
      toast.error('Failed to approve vendor')
    }
  }

  // Compute stats
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o: any) => o.status === 'pending').length
  const approvedOrders = orders.filter((o: any) => o.status === 'approved').length
  const completedOrders = orders.filter((o: any) => o.status === 'completed').length

  if (status === 'loading' || loading || pageLoading || !user) {
    return <DashboardLoading />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex flex-col">
      <div className="flex-1 max-w-5xl mx-auto py-8 px-2 sm:px-6 lg:px-8 w-full flex flex-col items-center justify-center">
        <div className="w-full bg-white/90 shadow-2xl rounded-2xl p-6 md:p-10 relative overflow-x-auto border border-blue-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-blue-900 drop-shadow">Admin Dashboard</h2>
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
                <div className="bg-gradient-to-br from-blue-200 to-blue-400 rounded-2xl p-4 sm:p-6 flex flex-col items-center shadow-lg border border-blue-100" role="status" aria-label={`Total Orders: ${totalOrders}`}>
                  <div className="text-3xl sm:text-4xl mb-2" aria-hidden="true">📦</div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-blue-900 drop-shadow">{totalOrders}</span>
                  <span className="text-xs sm:text-sm text-blue-800 mt-1 font-semibold tracking-wide">Total Orders</span>
                </div>
                <button
                  className="bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-2xl p-4 sm:p-6 flex flex-col items-center shadow-lg border border-yellow-200 hover:scale-105 hover:shadow-xl transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                  onClick={() => setShowOrdersModal('pending')}
                  aria-label={`Show ${pendingOrders} Pending Orders`}
                  onKeyDown={(e) => e.key === 'Enter' && setShowOrdersModal('pending')}
                >
                  <div className="text-3xl sm:text-4xl mb-2" aria-hidden="true">⏳</div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-yellow-900 drop-shadow">{pendingOrders}</span>
                  <span className="text-xs sm:text-sm text-yellow-800 mt-1 font-semibold tracking-wide">Pending</span>
                </button>
                <button
                  className="bg-gradient-to-br from-green-100 to-green-300 rounded-2xl p-4 sm:p-6 flex flex-col items-center shadow-lg border border-green-200 hover:scale-105 hover:shadow-xl transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  onClick={() => setShowOrdersModal('approved')}
                  aria-label={`Show ${approvedOrders} Approved Orders`}
                  onKeyDown={(e) => e.key === 'Enter' && setShowOrdersModal('approved')}
                >
                  <div className="text-3xl sm:text-4xl mb-2" aria-hidden="true">✅</div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-green-900 drop-shadow">{approvedOrders}</span>
                  <span className="text-xs sm:text-sm text-green-800 mt-1 font-semibold tracking-wide">Approved</span>
                </button>
                <button
                  className="bg-gradient-to-br from-gray-100 to-gray-300 rounded-2xl p-4 sm:p-6 flex flex-col items-center shadow-lg border border-gray-200 hover:scale-105 hover:shadow-xl transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  onClick={() => setShowOrdersModal('completed')}
                  aria-label={`Show ${completedOrders} Completed Orders`}
                  onKeyDown={(e) => e.key === 'Enter' && setShowOrdersModal('completed')}
                >
                  <div className="text-3xl sm:text-4xl mb-2" aria-hidden="true">🏁</div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 drop-shadow">{completedOrders}</span>
                  <span className="text-xs sm:text-sm text-gray-800 mt-1 font-semibold tracking-wide">Completed</span>
                </button>
              </div>
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setShowOrderForm(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >Place Order</button>
              </div>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full divide-y divide-blue-100 rounded-lg overflow-hidden">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Product Name</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Visible to Vendors</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-50">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-blue-50 transition-colors cursor-pointer" onClick={()=>openOrderModal(order)}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.productName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'approved' ? 'bg-green-100 text-green-800' :
                            order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            order.status === 'completed' ? 'bg-gray-200 text-gray-700' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.visibleToVendors ? 'Yes' : 'No'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        {showOrderForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
              <button onClick={() => setShowOrderForm(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
              <h2 className="text-xl font-bold mb-4">Place Order</h2>
              <OrderForm adminId={user.id} onOrderPlaced={handleOrderPlaced} />
            </div>
          </div>
        )}
        {previewOrder && (
          <OrderPreviewModal
            order={previewOrder}
            quotations={orderQuotations}
            loading={modalLoading}
            onClose={() => setPreviewOrder(null)}
            onApproveVendor={handleApproveVendor}
            refreshOrders={() => {
              setPageLoading(true)
              fetch(`/api/orders${tab === 'history' ? '?history=true' : ''}`)
                .then(res => res.json())
                .then(orderData => {
                  setOrders(orderData.orders || [])
                  setPageLoading(false)
                })
            }}
            userRole="ADMIN"
          />
        )}
        {/* Orders Modal for Pending/Approved/Completed */}
        {showOrdersModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4" role="dialog" aria-modal="true" aria-labelledby="orders-modal-title">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-4 sm:p-8 relative border border-blue-100 max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowOrdersModal(null)} 
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Close orders modal"
              >&times;</button>
              <h2 id="orders-modal-title" className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 sm:mb-6 text-center">{showOrdersModal.charAt(0).toUpperCase() + showOrdersModal.slice(1)} Orders</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-100 rounded-lg overflow-hidden" role="table" aria-label={`${showOrdersModal} orders list`}>
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Order ID</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Product Name</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Visible to Vendors</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-50">
                    {orders.filter((o: any) => o.status === showOrdersModal).map((order) => (
                      <tr key={order.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{order.id}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{order.productName}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'approved' ? 'bg-green-100 text-green-800' :
                            order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            order.status === 'completed' ? 'bg-gray-200 text-gray-700' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {order.visibleToVendors ? 'Yes' : 'No'}
                        </td>
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