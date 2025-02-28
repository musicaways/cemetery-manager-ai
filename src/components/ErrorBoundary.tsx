
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorReporter } from '@/lib/errorReporter';
import { ErrorFallback } from './ErrorFallback';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Aggiorna lo stato in modo che il prossimo render mostri l'UI di fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Registra l'errore
    console.error("Errore catturato da ErrorBoundary:", error, errorInfo);
    
    // Per il problema specifico React #31, aggiungi log dettagliato
    if (error.message.includes('#31') || error.message.includes('object with keys')) {
      console.error("Errore React #31 rilevato - Dettagli aggiuntivi:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        componentStack: errorInfo.componentStack,
      });
    }
    
    errorReporter.reportError(error, {
      componentStack: errorInfo.componentStack,
      handledBy: 'ErrorBoundary'
    }, true);

    // Aggiorna lo stato
    this.setState({ errorInfo });

    // Callback di errore se fornita
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Usa il nostro componente ErrorFallback
      return (
        <ErrorFallback 
          error={this.state.error || new Error('Si è verificato un errore')}
          resetErrorBoundary={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}
