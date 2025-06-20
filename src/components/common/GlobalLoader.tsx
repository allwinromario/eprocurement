'use client'

import React, { createContext, useContext, useState } from 'react'

const GlobalLoadingContext = createContext<{
  show: () => void
  hide: () => void
  loading: boolean
}>({ show: () => {}, hide: () => {}, loading: false })

export const GlobalLoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false)
  const show = () => setLoading(true)
  const hide = () => setLoading(false)

  return (
    <GlobalLoadingContext.Provider value={{ show, hide, loading }}>
      {children}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-b-4 border-white"></div>
        </div>
      )}
    </GlobalLoadingContext.Provider>
  )
}

export const useGlobalLoading = () => useContext(GlobalLoadingContext) 