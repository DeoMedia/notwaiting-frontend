import { Component, type ReactNode, type ErrorInfo } from 'react';
import { withTranslation, type WithTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react';

interface Props extends WithTranslation {
  children: ReactNode
}

interface State {
  error: Error | null
}

class ErrorBoundaryInner extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error, info.componentStack)
    // Forward to Sentry with the component stack as extra context. Sentry's
    // init is a no-op if VITE_SENTRY_DSN is unset, so this is safe in dev.
    Sentry.captureException(error, {
      contexts: { react: { componentStack: info.componentStack } },
    })
  }

  render() {
    if (this.state.error) {
      const { t } = this.props
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-black uppercase mb-4">{t('common.errorTitle')}</h2>
            <p className="text-gray-600 mb-8">
              {t('common.errorBody')}
            </p>
            <button
              onClick={() => this.setState({ error: null })}
              className="border-2 border-[#0C0C0A] px-8 py-3 font-bold hover:bg-[#0C0C0A] hover:text-white transition-colors"
            >
              {t('common.tryAgain')}
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryInner);
