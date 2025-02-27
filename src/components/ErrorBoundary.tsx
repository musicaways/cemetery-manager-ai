
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorReporter } from '@/lib/errorReporter';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

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

      // Fallback predefinito
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full bg-card p-6 rounded-lg shadow-lg border border-muted">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle size={24} />
            </div>
            
            <h1 className="text-xl font-bold text-center mb-2">Ops, qualcosa è andato storto</h1>
            
            <p className="text-muted-foreground text-center mb-6">
              Si è verificato un errore imprevisto. Prova a ricaricare la pagina o tornare alla home.
            </p>
            
            <div className="space-y-2">
              <Button 
                variant="default" 
                className="w-full" 
                onClick={this.resetError}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Riprova
              </Button>
              
              <Link to="/">
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Torna alla home
                </Button>
              </Link>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-muted rounded-md overflow-x-auto text-xs">
                <p className="font-bold text-destructive">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <pre className="mt-2 text-muted-foreground">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
