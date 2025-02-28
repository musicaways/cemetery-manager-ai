
import { Button } from "./ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

export const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--chat-bg)]">
      <div className="max-w-md w-full bg-card border border-destructive/20 rounded-lg p-6">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle size={24} />
        </div>
        
        <h1 className="text-xl font-bold text-center mb-2">Si è verificato un errore</h1>
        
        <p className="text-muted-foreground text-center mb-4">
          {error.message || "Errore durante l'elaborazione della richiesta"}
        </p>
        
        <div className="space-y-2">
          <Button 
            variant="default" 
            className="w-full"
            onClick={() => {
              if (resetErrorBoundary) {
                resetErrorBoundary();
              } else {
                window.location.reload();
              }
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Riprova
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-muted rounded-md overflow-x-auto text-xs">
            <p className="font-bold text-destructive">{error.toString()}</p>
            {error.stack && (
              <pre className="mt-2 text-muted-foreground">
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
