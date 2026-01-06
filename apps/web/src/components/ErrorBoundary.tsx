import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-8 max-w-md w-full text-center border border-white/5">
            <div className="w-16 h-16 bg-muted-red/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-red"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#F1F5F9] mb-2">
              Etwas ist schiefgelaufen
            </h1>
            <p className="text-[#94A3B8] mb-6">
              Ein unerwarteter Fehler ist aufgetreten.
            </p>
            {this.state.error && (
              <pre className="text-left text-xs text-muted-red bg-canvas p-3 rounded-xl mb-6 overflow-auto max-h-32 border border-white/5">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 rounded-xl bg-[#2A3441] text-[#94A3B8] font-bold hover:bg-[#334155] transition-colors"
              >
                Erneut versuchen
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-[#2563EB] transition-colors"
              >
                Zur Startseite
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
