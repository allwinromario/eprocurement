import React from 'react'

interface OrderPreviewModalProps {
  order: any
  onClose: () => void
}

export default function OrderPreviewModal({ order, onClose }: OrderPreviewModalProps) {
  if (!order) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
        <h2 className="text-xl font-bold mb-4">Order Preview</h2>
        <div className="space-y-2">
          <div><span className="font-semibold">Order ID:</span> {order.id}</div>
          <div><span className="font-semibold">Product Name:</span> {order.productName}</div>
          <div><span className="font-semibold">Description:</span> {order.description}</div>
          <div><span className="font-semibold">Quantity:</span> {order.quantity}</div>
          {order.specifications && <div><span className="font-semibold">Specifications:</span> {order.specifications}</div>}
          <div><span className="font-semibold">Status:</span> {order.status}</div>
          <div><span className="font-semibold">Created At:</span> {new Date(order.createdAt).toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
} 