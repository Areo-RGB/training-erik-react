import { useEffect, ReactNode } from 'react'
import Icon from './Icon'
import Button from './Button'

export interface ModalProps {
  open: boolean
  onClose?: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  full: 'max-w-full mx-4',
}

export default function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-enter">
      <div
        className={`w-full ${sizeClasses[size]} bg-[#1E2532] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/10 animate-enter-scale`}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#2A3441]/50">
            {title && <h2 className="text-xl font-bold text-[#F1F5F9]">{title}</h2>}
            {onClose && (
              <button
                onClick={onClose}
                className="text-[#94A3B8] hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                aria-label="Close"
              >
                <Icon name="close" size={24} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && <div className="p-6 border-t border-white/5 bg-[#2A3441]/50 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}

// Convenience component for common modal with cancel/save buttons
export interface ConfirmModalProps extends Omit<ModalProps, 'footer' | 'children'> {
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  confirmVariant?: 'primary' | 'danger'
}

export function ConfirmModal({
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
  confirmVariant = 'primary',
}: ConfirmModalProps) {
  return (
    <Modal
      open={true}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message && <p className="text-[#94A3B8]">{message}</p>}
    </Modal>
  )
}
