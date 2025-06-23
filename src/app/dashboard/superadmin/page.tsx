"use client"
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLoading from '../loading'
import { UserProvider, useUser } from '@/components/dashboard/UserContext'
import Logo from '@/components/common/Logo'
import OrderPreviewModal from '@/components/dashboard/OrderPreviewModal'
import toast from 'react-hot-toast'

export default function SuperadminDashboardPage() {
  return (
    <UserProvider>
      <SuperadminDashboard />
    </UserProvider>
  )
}

function SuperadminDashboard() {
  const { user, loading } = useUser()
  const { status } = useSession()
  const router = useRouter()
  const [vendors, setVendors] = useState<any[]>([])
  const [superadminOrders, setSuperadminOrders] = useState<any[]>([])
  const [superadminLoading, setSuperadminLoading] = useState(false)
  const [tab, setTab] = useState<'active' | 'history'>('active')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [orderQuotations, setOrderQuotations] = useState<any[]>([])
  const [modalLoading, setModalLoading] = useState(false)
  const [showVendorsModal, setShowVendorsModal] = useState(false)
  const [showOrdersModal, setShowOrdersModal] = useState<'pending' | 'approved' | 'completed' | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (user && user.role === 'SUPERADMIN') {
      setSuperadminLoading(true)
      Promise.all([
        fetch('/api/superadmin/vendors').then(res => res.json()),
        fetch(`/api/superadmin/orders${tab === 'history' ? '?history=true' : ''}`).then(res => res.json()),
      ]).then(([vendorData, orderData]) => {
        setVendors(vendorData.vendors || [])
        setSuperadminOrders(orderData.orders || [])
        setSuperadminLoading(false)
      }).catch(() => setSuperadminLoading(false))
    }
  }, [user, status, router, tab])

  const handleSuperadminOrderAction = async (orderId: string, action: 'approve' | 'reject' | 'post', approvalReason?: string) => {
    try {
      const res = await fetch('/api/superadmin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action, approvalReason }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuperadminOrders(prev => prev.map((o: any) => o.id === orderId ? data.order : o))
        toast.success(`Order ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'posted to vendors'} successfully!`)
      } else {
        toast.error(data.error || 'Failed to update order')
      }
    } catch (err) {
      toast.error('Failed to update order')
    }
  }

  const openOrderModal = async (order: any) => {
    setSelectedOrder(order)
    setModalLoading(true)
    const res = await fetch(`/api/quotations?orderId=${order.id}`)
    const data = await res.json()
    setOrderQuotations(data.quotations || [])
    setModalLoading(false)
  }

  // Compute stats
  const totalOrders = superadminOrders.length
  const pendingOrders = superadminOrders.filter((o: any) => o.status === 'pending').length
  const approvedOrders = superadminOrders.filter((o: any) => o.status === 'approved').length
  const completedOrders = superadminOrders.filter((o: any) => o.status === 'completed').length
  const totalVendors = vendors.length

  if (status === 'loading' || loading || !user) {
    return <DashboardLoading />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex flex-col">
      <div className="flex-1 max-w-5xl mx-auto py-8 px-2 sm:px-6 lg:px-8 w-full flex flex-col items-center justify-center">
        {/* Enhanced Analytics/Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8 sm:mb-10 w-full">
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
          <button
            className="bg-gradient-to-br from-indigo-100 to-indigo-300 rounded-2xl p-4 sm:p-6 flex flex-col items-center shadow-lg border border-indigo-200 hover:scale-105 hover:shadow-xl transition cursor-pointer col-span-1 lg:col-span-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => setShowVendorsModal(true)}
            aria-label={`Show ${totalVendors} Total Vendors`}
            onKeyDown={(e) => e.key === 'Enter' && setShowVendorsModal(true)}
          >
            <div className="text-3xl sm:text-4xl mb-2" aria-hidden="true">🧑‍💼</div>
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-900 drop-shadow">{totalVendors}</span>
            <span className="text-xs sm:text-sm text-indigo-800 mt-1 font-semibold tracking-wide">Total Vendors</span>
          </button>
        </div>
        <div className="w-full bg-white/90 shadow-2xl rounded-2xl p-6 md:p-10 relative overflow-x-auto border border-blue-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-blue-900 drop-shadow">Superadmin Dashboard</h2>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >Logout</button>
          </div>
          <div className="flex justify-center mb-6 gap-4">
            <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab==='active'?'bg-blue-700 text-white shadow':'bg-blue-100 text-blue-900'}`} onClick={()=>setTab('active')}>Active Orders</button>
            <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab==='history'?'bg-blue-700 text-white shadow':'bg-blue-100 text-blue-900'}`} onClick={()=>setTab('history')}>History</button>
          </div>
          {superadminLoading ? (
            <div>Loading...</div>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Orders Placed by Admins</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full divide-y divide-blue-100 rounded-lg overflow-hidden">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Product Name</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Visible to Vendors</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-50">
                    {superadminOrders.map((order) => (
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          {/* Actions moved to modal */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        {selectedOrder && (
          <OrderPreviewModal
            order={selectedOrder}
            quotations={orderQuotations}
            loading={modalLoading}
            onClose={() => setSelectedOrder(null)}
            onAction={handleSuperadminOrderAction}
            refreshOrders={() => {
              // refetch orders after action
              setSuperadminLoading(true)
              fetch(`/api/superadmin/orders${tab === 'history' ? '?history=true' : ''}`)
                .then(res => res.json())
                .then(data => {
                  setSuperadminOrders(data.orders || [])
                  setSuperadminLoading(false)
                })
            }}
          />
        )}
        {/* Vendor Modal */}
        {showVendorsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4" role="dialog" aria-modal="true" aria-labelledby="vendors-modal-title">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-4 sm:p-8 relative border border-blue-100 max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowVendorsModal(false)} 
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Close vendors modal"
              >&times;</button>
              <h2 id="vendors-modal-title" className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 sm:mb-6 text-center">Vendors</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-100 rounded-lg overflow-hidden" role="table" aria-label="Vendors list">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Vendor ID</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Name</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Email</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Company</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Quotations</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-50">
                    {vendors.map((vendor) => (
                      <tr key={vendor.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{vendor.vendorId}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{vendor.fullName}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{vendor.email}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{vendor.companyName}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          {vendor.quotations.length > 0 ? (
                            <ul className="list-disc ml-4">
                              {vendor.quotations.map((q: any) => (
                                <li key={q.id}>
                                  {q.productService} <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${q.status === 'approved' ? 'bg-green-100 text-green-800' : q.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{q.status}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400">No quotations</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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
                    {superadminOrders.filter((o: any) => o.status === showOrdersModal).map((order) => (
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