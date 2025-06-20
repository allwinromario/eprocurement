import React from 'react'

interface UserAvatarProps {
  name?: string | null
  size?: number
}

function getInitials(name?: string | null) {
  if (!name) return ''
  const parts = name.split(' ')
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || ''
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function UserAvatar({ name, size = 40 }: UserAvatarProps) {
  const initials = getInitials(name)
  return (
    <div
      className="flex items-center justify-center rounded-full bg-blue-600 text-white font-bold"
      style={{ width: size, height: size, fontSize: size / 2 }}
      title={name || 'User'}
    >
      {initials || (
        <svg width={size / 2} height={size / 2} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a8.38 8.38 0 0 1 13 0" /></svg>
      )}
    </div>
  )
} 