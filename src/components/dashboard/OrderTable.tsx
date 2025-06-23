import React, { useState, useMemo } from 'react'

interface OrderTableProps {
  orders: any[]
  onPreview: (order: any) => void
}

const statusOptions = ['all', 'pending', 'approved', 'rejected', 'completed']
const sortOptions = [
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'status', label: 'Status' },
]

export default function OrderTable({ orders, onPreview }: OrderTableProps) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')

  const filteredOrders = useMemo(() => {
    let filtered = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter)
    if (sortBy === 'date-desc') {
      filtered = filtered.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === 'date-asc') {
      filtered = filtered.slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else if (sortBy === 'status') {
      filtered = filtered.slice().sort((a, b) => a.status.localeCompare(b.status))
    }
    return filtered
  }, [orders, statusFilter, sortBy])

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 mb-2 items-center">
        <label className="text-sm font-medium">Filter by Status:</label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-2 py-1">
          {statusOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
        </select>
        <label className="text-sm font-medium ml-4">Sort by:</label>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded px-2 py-1">
          {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredOrders.map((order) => (
            <tr key={order.id}>
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
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onPreview(order)}
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
  )
} 