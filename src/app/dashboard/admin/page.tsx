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

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (user && user.role === 'ADMIN') {
      fetch('/api/orders')
        .then(res => res.json())
        .then(orderData => {
          setOrders(orderData.orders || [])
          setTimeout(() => setPageLoading(false), 6000)
        })
        .catch(() => setPageLoading(false))
    } else {
      setPageLoading(false)
    }
  }, [user, status, router])

  const handleOrderPlaced = (order: any) => {
    setOrders(prev => [order, ...prev])
    setShowOrderForm(false)
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
              <p className="text-sm text-gray-600">Employee ID: {user.employeeId}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Logout
          </button>
        </div>
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Orders</h2>
            <button
              onClick={() => setShowOrderForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Place Order
            </button>
            <button
              onClick={handleViewQuotations}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              View Quotations
            </button>
          </div>
          <OrderTable orders={orders} onPreview={setPreviewOrder} />
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
          <OrderPreviewModal order={previewOrder} onClose={() => setPreviewOrder(null)} />
        )}
        {showQuotationsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
              <button onClick={() => setShowQuotationsModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
              <h2 className="text-xl font-bold mb-4">Quotations for Your Orders</h2>
              {adminQuotationsLoading ? (
                <div>Loading...</div>
              ) : (
                <QuotationList quotations={adminQuotations} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 