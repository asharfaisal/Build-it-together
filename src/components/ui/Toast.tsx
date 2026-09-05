import React from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastProps {
  toast: ToastItem
  onClose: (id: string) => void
}

export function Toast({ toast, onClose }: ToastProps) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠️'
      case 'info':
      default:
        return '✦'
    }
  }

  const getColors = () => {
    switch (toast.type) {
      case 'success':
        return { border: 'rgba(25,184,143,0.3)', bg: 'rgba(25,184,143,0.12)', text: '#19b88f' }
      case 'error':
        return { border: 'rgba(228,91,91,0.3)', bg: 'rgba(228,91,91,0.12)', text: '#e45b5b' }
      case 'warning':
        return { border: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' }
      case 'info':
      default:
        return { border: 'rgba(91,141,239,0.3)', bg: 'rgba(91,141,239,0.12)', text: '#5b8def' }
    }
  }

  const c = getColors()

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md transition-all animate-slide-in pointer-events-auto"
      style={{
        background: 'var(--card)',
        border: `1px solid ${c.border}`,
        boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        minWidth: '280px',
        maxWidth: '420px',
      }}
      role="alert"
    >
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-700 shrink-0"
        style={{ background: c.bg, color: c.text }}
      >
        {getIcon()}
      </div>
      <p className="text-xs font-500 flex-1 leading-snug" style={{ color: 'var(--foreground)' }}>
        {toast.message}
      </p>
      <button
        onClick={() => onClose(toast.id)}
        className="text-xs shrink-0 p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
        style={{ background: 'transparent', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}
        aria-label="Dismiss alert"
      >
        ✕
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
      style={{ maxWidth: 'calc(100vw - 32px)' }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  )
}
