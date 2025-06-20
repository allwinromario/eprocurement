'use client'

import React, { useState } from 'react'
import Image from 'next/image'

export default function Logo() {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-48 h-24">
        {!imgError ? (
          <Image
            src="/logo.jpeg"
            alt="DBGT Logo"
            fill
            sizes="192px"
            className="object-contain"
            priority
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-700 rounded-lg">
            <span className="text-2xl font-bold text-white">DBGT</span>
          </div>
        )}
      </div>
    </div>
  )
} 