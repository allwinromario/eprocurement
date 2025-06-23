'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
}

const categories: Category[] = [
  { id: '1', name: 'Equipment' },
  { id: '2', name: 'Services' },
  { id: '3', name: 'Supplies' },
  { id: '4', name: 'Maintenance' },
  { id: '5', name: 'Other' },
]

interface QuotationFormProps {
  onQuotationAdded?: (quotation: any) => void
  orderId?: string
  userId: string
}

export default function QuotationForm({ onQuotationAdded, orderId, userId }: QuotationFormProps) {
  const [formData, setFormData] = useState({
    productService: '',
    description: '',
    selectedCategories: [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')
    try {
      if (!userId) {
        setError('User not authenticated. Please log in again.')
        setLoading(false)
        toast.error('User not authenticated. Please log in again.')
        return
      }
      const response = await fetch(orderId ? '/api/vendor/quotations' : '/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderId ? { ...formData, userId, orderId, categories: formData.selectedCategories } : { ...formData, userId }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || 'Failed to submit quotation')
        throw new Error(data.error || 'Failed to submit quotation')
      }
      setSuccess('Quotation submitted successfully!')
      setFormData({ productService: '', description: '', selectedCategories: [] })
      if (onQuotationAdded) {
        onQuotationAdded(data.quotation)
      }
      toast.success('Quotation submitted successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quotation')
      toast.error(err instanceof Error ? err.message : 'Failed to submit quotation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded">{success}</div>}
      {error && <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded">{error}</div>}
      <div>
        <label htmlFor="productService" className="block text-sm font-medium text-gray-700">
          Product / Service *
        </label>
        <input
          type="text"
          id="productService"
          name="productService"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.productService}
          onChange={(e) => setFormData({ ...formData, productService: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Categories *
        </label>
        <div className="mt-2 space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center">
              <input
                type="checkbox"
                id={`category-${category.id}`}
                name="categories"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={formData.selectedCategories.includes(category.id)}
                onChange={() => handleCategoryChange(category.id)}
              />
              <label
                htmlFor={`category-${category.id}`}
                className="ml-2 block text-sm text-gray-900"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Quotation'}
        </button>
      </div>
    </form>
  )
} 