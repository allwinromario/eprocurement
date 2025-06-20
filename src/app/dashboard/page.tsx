'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import QuotationForm from '@/components/dashboard/QuotationForm'
import QuotationList from '@/components/dashboard/QuotationList'
import OrderForm from '@/components/dashboard/OrderForm'
import OrderTable from '@/components/dashboard/OrderTable'
import OrderPreviewModal from '@/components/dashboard/OrderPreviewModal'
import DashboardLoading from './loading'
import toast from 'react-hot-toast'
import { useSession, signOut } from 'next-auth/react'

interface User {
  id: string
  username: string
  fullName: string
  role: 'VENDOR' | 'ADMIN' | 'SUPERADMIN'
  companyName?: string
  vendorId?: string
  employeeId?: string
  department?: string
}

interface Quotation {
  id: string
  productService: string
  description: string
  categories: string[]
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showQuotationForm, setShowQuotationForm] = useState(false)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [previewOrder, setPreviewOrder] = useState<any | null>(null)
  const [vendors, setVendors] = useState<any[]>([])
  const [superadminOrders, setSuperadminOrders] = useState<any[]>([])
  const [superadminLoading, setSuperadminLoading] = useState(false)
  const [openOrders, setOpenOrders] = useState<any[]>([])
  const [showOrderDetails, setShowOrderDetails] = useState<any | null>(null)
  const [showQuotationModal, setShowQuotationModal] = useState(false)
  const [quotationLoading, setQuotationLoading] = useState(false)
  const [quotationError, setQuotationError] = useState('')
  const [quotationForm, setQuotationForm] = useState({
    productService: '',
    description: '',
    categories: '',
  })
  const [showQuotationFormInModal, setShowQuotationFormInModal] = useState(false)
  const [previewOrderModal, setPreviewOrderModal] = useState<any | null>(null)
  const [showQuotationsModal, setShowQuotationsModal] = useState(false)
  const [adminQuotations, setAdminQuotations] = useState<any[]>([])
  const [adminQuotationsLoading, setAdminQuotationsLoading] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (session && (session.user as any)?.role) {
      const role = (session.user as any).role
      if (role === 'SUPERADMIN') router.replace('/dashboard/superadmin')
      else if (role === 'ADMIN') router.replace('/dashboard/admin')
      else if (role === 'VENDOR') router.replace('/dashboard/vendor')
      else router.replace('/dashboard/not-authorized')
    }
  }, [session, status, router])

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (session && (session.user as any)?.id) {
      Promise.all([
        fetch(`/api/users/${(session.user as any).id}`).then(res => res.json()),
        fetch(`/api/quotations?userId=${(session.user as any).id}`).then(res => res.json()),
        fetch('/api/orders').then(res => res.json()),
      ])
        .then(([userData, quotationData, orderData]) => {
          setUser(userData.user)
          setQuotations(quotationData.quotations || [])
          setOrders(orderData.orders || [])
          setTimeout(() => setLoading(false), 6000)
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [router, session, status])

  // Fetch vendors and all orders for superadmin
  useEffect(() => {
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
  }, [user])

  // Fetch open orders for vendors
  useEffect(() => {
    if (user && user.role === 'VENDOR') {
      fetch('/api/vendor/orders')
        .then(res => res.json())
        .then(data => setOpenOrders(data.orders || []))
    }
  }, [user])

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  const handleQuotationAdded = (quotation: Quotation) => {
    setQuotations(prev => [quotation, ...prev])
    setShowQuotationForm(false)
    toast.success('Quotation added successfully!')
  }

  // Admin order handlers
  const handleOrderPlaced = (order: any) => {
    setOrders(prev => [order, ...prev])
    setShowOrderForm(false)
  }

  // Superadmin order actions
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

  // Vendor quotation submit handler
  const handleQuotationSubmit = async (e: any) => {
    e.preventDefault()
    if (!user) return;
    setQuotationLoading(true)
    setQuotationError('')
    try {
      const res = await fetch('/api/vendor/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          orderId: showOrderDetails.id,
          productService: quotationForm.productService,
          description: quotationForm.description,
          categories: quotationForm.categories.split(',').map((c: string) => c.trim()),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit quotation')
      setShowQuotationModal(false)
      setShowOrderDetails(null)
      setQuotationForm({ productService: '', description: '', categories: '' })
    } catch (err: any) {
      setQuotationError(err.message)
    } finally {
      setQuotationLoading(false)
    }
  }

  const handleQuotationDeleted = (id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id))
    toast.success('Quotation deleted successfully!')
  }

  const handleViewQuotations = async () => {
    setShowQuotationsModal(true)
    setAdminQuotationsLoading(true)
    const res = await fetch(`/api/admin/quotations?adminId=${user.id}`)
    const data = await res.json()
    setAdminQuotations(data.quotations || [])
    setAdminQuotationsLoading(false)
  }

  if (status === 'loading' || loading) {
    return <DashboardLoading />
  }

  if (!user) {
    return <DashboardLoading />
  }

  return <div />
} 