import React, { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  maxWidth?: string
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '520px',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto scroll-thin animate-in fade-in zoom-in-95 duration-150"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          maxWidth,
          color: 'var(--foreground)',
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2
              className="text-lg font-700 leading-tight"
              style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all"
            style={{
              background: 'var(--muted)',
              border: 'none',
              color: 'var(--muted-foreground)',
              cursor: 'pointer',
            }}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
