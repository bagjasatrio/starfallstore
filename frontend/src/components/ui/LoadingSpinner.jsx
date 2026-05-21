import React from 'react'

export default function LoadingSpinner({ fullscreen = false, size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const spinner = (
    <div className={`${sizes[size]} border-2 border-electric-blue/20 border-t-electric-blue rounded-full animate-spin`} />
  )
  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-space-black flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-sm text-text-muted animate-pulse">Loading StarfallStore...</p>
        </div>
      </div>
    )
  }
  return <div className="flex items-center justify-center py-12">{spinner}</div>
}
