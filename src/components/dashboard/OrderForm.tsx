import { useState } from 'react'

interface OrderFormProps {
  adminId: string
  onOrderPlaced: (order: any) => void
}

export default function OrderForm({ adminId, onOrderPlaced }: OrderFormProps) {
  const [form, setForm] = useState({
    productName: '',
    description: '',
    quantity: 1,
    specifications: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity), createdById: adminId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to place order')
      onOrderPlaced(data.order)
      setForm({ productName: '', description: '', quantity: 1, specifications: '' })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700">Product Name</label>
        <input name="productName" value={form.productName} onChange={handleChange} required className="mt-1 block w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} required className="mt-1 block w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Quantity</label>
        <input name="quantity" type="number" min={1} value={form.quantity} onChange={handleChange} required className="mt-1 block w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Specifications (optional)</label>
        <input name="specifications" value={form.specifications} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
      </div>
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Placing...' : 'Place Order'}
      </button>
    </form>
  )
} 