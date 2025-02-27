
import { eventBus, AppEvents } from './eventBus';

export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  metadata?: Record<string, any>;
  isHandled: boolean;
}

/**
 * Sistema per riportare e gestire gli errori dell'applicazione
 */
class ErrorReporter {
  private errors: ErrorReport[] = [];
  private readonly maxErrors = 50;
  private readonly localStorageKey = 'app_error_reports';
  private isSetup = false;

  constructor() {
    this.loadErrorsFromStorage();
  }

  /**
   * Configura il reporter di errori a livello globale
   */
  setup(): void {
    if (this.isSetup || typeof window === 'undefined') return;
    
    // Intercetta gli errori non gestiti
    window.addEventListener('error', (event) => {
      this.reportError(event.error || new Error(event.message), {
        fileName: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno
      });
      
      // Non blocchiamo la propagazione dell'errore
      return false;
    });
    
    // Intercetta le promise non gestite
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      this.reportError(error, { 
        unhandledRejection: true 
      });
    });
    
    // Segnaliamo che il reporter è configurato
    this.isSetup = true;
    console.log('Error reporter initialized');
  }

  /**
   * Riporta un nuovo errore
   * @param error Errore da riportare
   * @param metadata Metadati aggiuntivi sull'errore
   * @param isHandled Se l'errore è già stato gestito
   */
  reportError(
    error: Error, 
    metadata: Record<string, any> = {}, 
    isHandled: boolean = false
  ): void {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        url: window.location.href,
        userAgent: navigator.userAgent,
        online: navigator.onLine
      },
      isHandled
    };
    
    // Aggiungi l'errore alla lista
    this.errors.push(errorReport);
    
    // Limita il numero di errori memorizzati
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
    
    // Pubblica l'errore sul bus degli eventi
    eventBus.publish(AppEvents.ERROR_OCCURRED, errorReport);
    
    // Salva immediatamente nel localStorage
    this.saveErrorsToStorage();
    
    // Log nella console per debug
    console.error('Error reported:', errorReport);
    
    // Tenta di inviare l'errore al server se online
    if (navigator.onLine) {
      this.sendErrorToServer(errorReport).catch(e => {
        console.error('Failed to send error to server:', e);
      });
    }
  }

  /**
   * Invia l'errore al server
   * @param errorReport Rapporto dell'errore da inviare
   */
  private async sendErrorToServer(errorReport: ErrorReport): Promise<void> {
    try {
      // Implementare qui l'invio al server
      // Si può usare Supabase Edge Function o servizi esterni
      
      // Esempio:
      // await fetch('/api/report-error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });
    } catch (e) {
      // Ignoriamo errori nel reporting per evitare loop
      console.error('Error sending error report:', e);
    }
  }

  /**
   * Salva gli errori nel localStorage
   */
  private saveErrorsToStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.errors));
      }
    } catch (e) {
      console.error('Failed to save errors to localStorage:', e);
    }
  }

  /**
   * Carica gli errori dal localStorage
   */
  private loadErrorsFromStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.localStorageKey);
        if (stored) {
          this.errors = JSON.parse(stored);
        }
      }
    } catch (e) {
      console.error('Failed to load errors from localStorage:', e);
      this.errors = [];
    }
  }

  /**
   * Ottiene tutti gli errori memorizzati
   */
  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  /**
   * Cancella tutti gli errori memorizzati
   */
  clearErrors(): void {
    this.errors = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.localStorageKey);
    }
  }
}

// Esporta una singola istanza per tutta l'applicazione
export const errorReporter = new ErrorReporter();

// Inizializza il reporter di errori
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    errorReporter.setup();
  });
}
