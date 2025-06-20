"use client"
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLoading from '../loading'
import { UserProvider, useUser } from '@/components/dashboard/UserContext'

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
        fetch('/api/superadmin/orders').then(res => res.json()),
      ]).then(([vendorData, orderData]) => {
        setVendors(vendorData.vendors || [])
        setSuperadminOrders(orderData.orders || [])
        setSuperadminLoading(false)
      }).catch(() => setSuperadminLoading(false))
    }
  }, [user, status, router])

  const handleSuperadminOrderAction = async (orderId: string, action: 'approve' | 'reject' | 'post') => {
    const res = await fetch('/api/superadmin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, action }),
    })
    const data = await res.json()
    if (res.ok) {
      setSuperadminOrders(prev => prev.map((o: any) => o.id === orderId ? data.order : o))
    }
  }

  if (status === 'loading' || loading || !user) {
    return <DashboardLoading />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user.fullName}
            </h1>
            <p className="text-sm text-gray-600">Superadmin</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Logout
          </button>
        </div>
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Superadmin Dashboard</h2>
            {superadminLoading ? (
              <div>Loading...</div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Vendors</h3>
                <div className="overflow-x-auto mb-8">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quotations</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vendors.map((vendor) => (
                        <tr key={vendor.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vendor.vendorId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vendor.fullName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vendor.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vendor.companyName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {vendor.quotations.length > 0 ? (
                              <ul className="list-disc ml-4">
                                {vendor.quotations.map((q: any) => (
                                  <li key={q.id}>{q.productService} ({q.status})</li>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Orders Placed by Admins</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visible to Vendors</th>
                        <th className="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {superadminOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.productName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'approved' ? 'bg-green-100 text-green-800' :
                              order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.visibleToVendors ? 'Yes' : 'No'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            {order.status === 'pending' && (
                              <>
                                <button onClick={() => handleSuperadminOrderAction(order.id, 'approve')} className="text-green-600 hover:text-green-900 underline">Approve</button>
                                <button onClick={() => handleSuperadminOrderAction(order.id, 'reject')} className="text-red-600 hover:text-red-900 underline">Reject</button>
                              </>
                            )}
                            {order.status === 'approved' && !order.visibleToVendors && (
                              <button onClick={() => handleSuperadminOrderAction(order.id, 'post')} className="text-blue-600 hover:text-blue-900 underline">Post</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 