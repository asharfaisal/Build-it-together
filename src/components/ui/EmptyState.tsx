import React from 'react'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  icon = '✦',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      className="rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3"
      style={{
        background: 'var(--card)',
        border: '1px dashed var(--border)',
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-1"
        style={{
          background: 'rgba(25,184,143,0.1)',
          color: '#19b88f',
        }}
      >
        {icon}
      </div>
      <h3
        className="text-base font-700"
        style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}
      >
        {title}
      </h3>
      <p
        className="text-xs max-w-sm leading-relaxed"
        style={{ color: 'var(--muted-foreground)' }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 rounded-xl text-xs font-600 transition-all shadow-sm"
          style={{
            background: '#19b88f',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
