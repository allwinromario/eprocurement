import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface User {
  id: string
  username: string
  fullName: string
  role: 'VENDOR' | 'ADMIN' | 'SUPERADMIN'
  companyName?: string
  vendorId?: string
  employeeId?: string
  department?: string
  email?: string
  contactNumber?: string
  address?: string
}

interface UserContextType {
  user: User | null
  loading: boolean
}

const UserContext = createContext<UserContextType>({ user: null, loading: true })

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      setUser(null)
      setLoading(false)
      return
    }
    if (session && (session.user as any)?.id) {
      fetch(`/api/users/${(session.user as any).id}`)
        .then(res => res.json())
        .then(data => {
          setUser(data.user)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setUser(null)
      setLoading(false)
    }
  }, [session, status])

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext) 