"use client"
import { useUser } from '@/components/dashboard/UserContext'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'

export default function ProfilePage() {
  const { user } = useUser()
  const { data: session, status } = useSession()
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    contactNumber: user?.contactNumber || '',
    address: user?.address || '',
  })
  const [loading, setLoading] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        contactNumber: user.contactNumber || '',
        address: user.address || '',
      })
    }
  }, [user])

  const handleProfileUpdate = async (e: any) => {
    e.preventDefault()
    if (!user || !user.id) {
      toast.error('User not loaded. Please refresh and try again.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update profile')
      toast.success('Profile updated!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: any) => {
    e.preventDefault()
    if (pwForm.new !== pwForm.confirm) {
      toast.error('New passwords do not match')
      return
    }
    setPwLoading(true)
    try {
      const res = await fetch(`/api/users/${user?.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current: pwForm.current, new: pwForm.new }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to change password')
      toast.success('Password changed!')
      setPwForm({ current: '', new: '', confirm: '' })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-lg bg-white/90 shadow-2xl rounded-2xl p-8 border border-blue-100">
        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Profile & Settings</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-blue-900">Full Name</label>
            <input className="w-full border rounded px-3 py-2" value={form.fullName} onChange={e=>setForm(f=>({...f, fullName: e.target.value}))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900">Contact Number</label>
            <input className="w-full border rounded px-3 py-2" value={form.contactNumber} onChange={e=>setForm(f=>({...f, contactNumber: e.target.value}))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900">Address</label>
            <input className="w-full border rounded px-3 py-2" value={form.address} onChange={e=>setForm(f=>({...f, address: e.target.value}))} />
          </div>
          <button type="submit" disabled={loading || !user || !user.id} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 w-full">{loading ? 'Saving...' : 'Save Profile'}</button>
        </form>
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-900">Current Password</label>
            <input type="password" className="w-full border rounded px-3 py-2" value={pwForm.current} onChange={e=>setPwForm(f=>({...f, current: e.target.value}))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900">New Password</label>
            <input type="password" className="w-full border rounded px-3 py-2" value={pwForm.new} onChange={e=>setPwForm(f=>({...f, new: e.target.value}))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900">Confirm New Password</label>
            <input type="password" className="w-full border rounded px-3 py-2" value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f, confirm: e.target.value}))} />
          </div>
          <button type="submit" disabled={pwLoading} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 w-full">{pwLoading ? 'Changing...' : 'Change Password'}</button>
        </form>
      </div>
    </div>
  )
} 