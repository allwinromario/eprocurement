'use client'

import React from 'react'
import { useState } from 'react'
import QuotationPreviewModal from './QuotationPreviewModal'
import toast from 'react-hot-toast'

interface Quotation {
  id: string
  productService: string
  description: string
  categories: string[]
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
}

interface QuotationListProps {
  quotations: Quotation[]
  onDelete?: (id: string) => void
}

const statusOptions = ['all', 'pending', 'approved', 'rejected']
const sortOptions = [
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'status', label: 'Status' },
]

const QuotationList: React.FC<QuotationListProps> = ({ quotations, onDelete }) => {
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')

  const filteredQuotations = React.useMemo(() => {
    let filtered = statusFilter === 'all' ? quotations : quotations.filter(q => q.status === statusFilter)
    if (sortBy === 'date-desc') {
      filtered = filtered.slice().sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    } else if (sortBy === 'date-asc') {
      filtered = filtered.slice().sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
    } else if (sortBy === 'status') {
      filtered = filtered.slice().sort((a, b) => a.status.localeCompare(b.status))
    }
    return filtered
  }, [quotations, statusFilter, sortBy])

  const handlePreview = (quotation: Quotation) => {
    setSelectedQuotation(quotation)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      const res = await fetch(`/api/quotations?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        if (onDelete) onDelete(id)
        toast.success('Quotation deleted!')
      } else {
        toast.error('Failed to delete quotation')
      }
    }
  }

  return (
    <div className="space-y-6">
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
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredQuotations.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              No quotations submitted yet
            </li>
          ) : (
            filteredQuotations.map((quotation) => (
              <li key={quotation.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {quotation.productService}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 truncate">
                      {quotation.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {quotation.categories.map((category) => (
                        <span
                          key={category}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    <button
                      onClick={() => handlePreview(quotation)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDelete(quotation.id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span>Submitted on {new Date(quotation.submittedAt).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span className={`capitalize ${
                    quotation.status === 'approved' ? 'text-green-600' :
                    quotation.status === 'rejected' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {quotation.status}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
      {selectedQuotation && (
        <QuotationPreviewModal
          quotation={selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
        />
      )}
    </div>
  )
} 

export default QuotationList 