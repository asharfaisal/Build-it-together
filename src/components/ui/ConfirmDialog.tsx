import React from 'react'
import Modal from './Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="420px">
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          {message}
        </p>
        <div className="flex items-center justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-600 transition-all"
            style={{
              background: 'var(--muted)',
              color: 'var(--foreground)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="px-4 py-2 rounded-xl text-xs font-600 transition-all shadow-sm"
            style={{
              background: isDestructive ? '#e45b5b' : '#19b88f',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
