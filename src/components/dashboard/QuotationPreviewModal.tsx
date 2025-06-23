import React from 'react'

interface QuotationPreviewModalProps {
  quotation: any
  onClose: () => void
}

const QuotationPreviewModal: React.FC<QuotationPreviewModalProps> = ({ quotation, onClose }) => {
  if (!quotation) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
        <h2 className="text-2xl font-bold mb-4">Quotation Preview</h2>
        <div className="space-y-2 mb-4">
          <div><span className="font-semibold">Product/Service:</span> {quotation.productService}</div>
          <div><span className="font-semibold">Description:</span> {quotation.description}</div>
          <div><span className="font-semibold">Categories:</span> {quotation.categories?.join(', ')}</div>
          <div><span className="font-semibold">Status:</span> {quotation.status}</div>
          <div><span className="font-semibold">Submitted At:</span> {new Date(quotation.submittedAt).toLocaleString()}</div>
          {quotation.approvalReason && <div><span className="font-semibold">Approval Reason:</span> {quotation.approvalReason}</div>}
        </div>
        {quotation.user && (
          <div className="mb-2 p-3 bg-blue-50 rounded">
            <div className="font-semibold text-blue-800">Vendor Details</div>
            <div><span className="font-semibold">Name:</span> {quotation.user.fullName}</div>
            <div><span className="font-semibold">Company:</span> {quotation.user.companyName}</div>
            <div><span className="font-semibold">Email:</span> {quotation.user.email}</div>
            <div><span className="font-semibold">Vendor ID:</span> {quotation.user.vendorId}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuotationPreviewModal 