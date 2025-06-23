import React from 'react'

interface OrderPreviewModalProps {
  order: any
  quotations: any[]
  loading: boolean
  onClose: () => void
  onAction?: (orderId: string, action: 'approve' | 'reject' | 'post', approvalReason?: string) => Promise<void>
  refreshOrders: () => void
  onApproveVendor?: (orderId: string, vendorId: string, approvalReason: string) => Promise<void>
  userRole?: string
}

export default function OrderPreviewModal({ order, quotations, loading, onClose, onAction, refreshOrders, onApproveVendor, userRole }: OrderPreviewModalProps) {
  const [actionLoading, setActionLoading] = React.useState(false)
  const [reason, setReason] = React.useState('')
  const [error, setError] = React.useState('')
  const [selectedVendor, setSelectedVendor] = React.useState('')

  if (!order) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
        <h2 className="text-2xl font-bold mb-4">Order Preview</h2>
        <div className="space-y-2 mb-4">
          <div><span className="font-semibold">Order ID:</span> {order.id}</div>
          <div><span className="font-semibold">Product Name:</span> {order.productName}</div>
          <div><span className="font-semibold">Description:</span> {order.description}</div>
          <div><span className="font-semibold">Quantity:</span> {order.quantity}</div>
          {order.specifications && <div><span className="font-semibold">Specifications:</span> {order.specifications}</div>}
          <div><span className="font-semibold">Status:</span> {order.status}</div>
          <div><span className="font-semibold">Created At:</span> {new Date(order.createdAt).toLocaleString()}</div>
          {order.approvalReason && <div><span className="font-semibold">Approval Reason:</span> {order.approvalReason}</div>}
          {order.approvedVendorId && <div><span className="font-semibold">Approved Vendor ID:</span> {order.approvedVendorId}</div>}
        </div>
        <h3 className="text-lg font-semibold mb-2">Quotations</h3>
        {loading ? <div>Loading quotations...</div> : (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-blue-100 rounded-lg overflow-hidden">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-blue-700 uppercase">Vendor</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-blue-700 uppercase">Service</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-blue-700 uppercase">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-blue-700 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-blue-700 uppercase">Approval Reason</th>
                  {userRole === 'ADMIN' && order.status === 'approved' && order.visibleToVendors && !order.approvedVendorId && <th className="px-4 py-2 text-left text-xs font-bold text-blue-700 uppercase">Select</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-50">
                {quotations.length === 0 && <tr><td colSpan={userRole === 'ADMIN' && order.status === 'approved' && order.visibleToVendors && !order.approvedVendorId ? 6 : 5} className="text-center text-gray-400 py-4">No quotations</td></tr>}
                {quotations.map((q) => (
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
                    {userRole === 'ADMIN' && order.status === 'approved' && order.visibleToVendors && !order.approvedVendorId && (
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <input type="radio" name="selectVendor" value={q.user?.id} checked={selectedVendor === q.user?.id} onChange={()=>setSelectedVendor(q.user?.id)} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Approve/Reject actions if pending (superadmin) */}
        {userRole !== 'ADMIN' && order.status === 'pending' && onAction && (
          <div className="mt-4">
            <textarea
              className="w-full border rounded p-2 mb-2"
              placeholder="Enter approval/rejection reason..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={2}
            />
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            <div className="flex gap-4">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                disabled={actionLoading || !reason}
                onClick={async () => {
                  if (!reason) { setError('Reason required'); return }
                  setActionLoading(true)
                  await onAction(order.id, 'approve', reason)
                  setActionLoading(false)
                  refreshOrders()
                  onClose()
                }}
              >Approve</button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                disabled={actionLoading || !reason}
                onClick={async () => {
                  if (!reason) { setError('Reason required'); return }
                  setActionLoading(true)
                  await onAction(order.id, 'reject', reason)
                  setActionLoading(false)
                  refreshOrders()
                  onClose()
                }}
              >Reject</button>
            </div>
          </div>
        )}
        {/* Post to vendors if approved but not visible (superadmin) */}
        {userRole !== 'ADMIN' && order.status === 'approved' && !order.visibleToVendors && onAction && (
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={async () => {
                setActionLoading(true)
                await onAction(order.id, 'post')
                setActionLoading(false)
                refreshOrders()
                onClose()
              }}
            >Post to Vendors</button>
          </div>
        )}
        {/* Admin: Approve vendor for order */}
        {userRole === 'ADMIN' && order.status === 'approved' && order.visibleToVendors && !order.approvedVendorId && (
          <div className="mt-4">
            <textarea
              className="w-full border rounded p-2 mb-2"
              placeholder="Enter approval reason for selected vendor..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={2}
            />
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            <div className="flex gap-4">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                disabled={actionLoading || !reason || !selectedVendor}
                onClick={async () => {
                  if (!reason || !selectedVendor) { setError('Select a vendor and provide a reason'); return }
                  setActionLoading(true)
                  if (onApproveVendor) await onApproveVendor(order.id, selectedVendor, reason)
                  setActionLoading(false)
                  refreshOrders()
                  onClose()
                }}
              >Approve Vendor</button>
            </div>
          </div>
        )}
        {/* Show approved vendor and reason if completed */}
        {userRole === 'ADMIN' && order.status === 'completed' && order.approvedVendorId && (
          <div className="mt-4 p-4 bg-green-50 rounded">
            <div className="font-semibold text-green-800">Approved Vendor ID: {order.approvedVendorId}</div>
            <div className="text-green-700">Reason: {order.approvalReason}</div>
          </div>
        )}
      </div>
    </div>
  )
} 