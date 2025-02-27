
import { eventBus, AppEvents } from './eventBus';

export type PerformanceMetricType = 
  | 'navigation' 
  | 'network' 
  | 'render' 
  | 'interaction' 
  | 'resource' 
  | 'memory'
  | 'custom';

export interface PerformanceMetric {
  type: PerformanceMetricType;
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Componente per monitorare le prestazioni dell'applicazione
 */
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private isEnabled: boolean = true;
  private maxStoredMetrics: number = 100;
  private flushInterval: number | null = null;
  private readonly localStorage = 'app_performance_metrics';

  constructor() {
    // Carica le metriche salvate dal localStorage
    this.loadMetricsFromStorage();
    
    // Imposta l'intervallo di flush delle metriche (salvataggio)
    this.startPeriodicFlush(30000); // 30 secondi
    
    // Monitora eventi di navigazione
    if (typeof window !== 'undefined' && 'performance' in window) {
      this.setupPerformanceObservers();
    }
  }

  /**
   * Configura gli observer per le metriche di performance web
   */
  private setupPerformanceObservers(): void {
    // Solo se il browser supporta PerformanceObserver
    if ('PerformanceObserver' in window) {
      try {
        // Osserva il rendering delle pagine
        const pageObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (entry.entryType === 'navigation') {
              this.recordMetric('navigation', 'page-load', entry.duration, 'ms', {
                domComplete: (entry as PerformanceNavigationTiming).domComplete,
                domInteractive: (entry as PerformanceNavigationTiming).domInteractive,
                loadEventEnd: (entry as PerformanceNavigationTiming).loadEventEnd
              });
            }
          });
        });
        pageObserver.observe({ entryTypes: ['navigation'] });

        // Osserva le interazioni utente
        const interactionObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            this.recordMetric('interaction', entry.name, entry.duration, 'ms');
          });
        });
        interactionObserver.observe({ entryTypes: ['first-input', 'event'] });

        // Osserva le risorse caricate
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordMetric('resource', resourceEntry.name.split('/').pop() || resourceEntry.name, 
              resourceEntry.duration, 'ms', {
                size: resourceEntry.transferSize,
                type: resourceEntry.initiatorType
              });
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.error('Error setting up performance observers:', error);
      }
    }

    // Monitora l'uso della memoria, se disponibile
    if (performance && 'memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        if (memory) {
          this.recordMetric('memory', 'heap-usage', 
            memory.usedJSHeapSize / (1024 * 1024), 'MB', {
              total: memory.totalJSHeapSize / (1024 * 1024),
              limit: memory.jsHeapSizeLimit / (1024 * 1024)
            });
        }
      }, 10000);
    }
  }

  /**
   * Salva una nuova metrica di prestazione
   */
  recordMetric(
    type: PerformanceMetricType,
    name: string,
    value: number,
    unit: string = 'ms',
    metadata?: Record<string, any>
  ): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      type,
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);
    
    // Limita il numero di metriche memorizzate
    if (this.metrics.length > this.maxStoredMetrics) {
      this.metrics = this.metrics.slice(-this.maxStoredMetrics);
    }

    // Pubblica la metrica sul bus degli eventi
    eventBus.publish(AppEvents.PERFORMANCE_METRIC, metric);

    // Salva immediatamente se è una metrica importante
    if (type === 'navigation' || type === 'error') {
      this.saveMetricsToStorage();
    }
  }

  /**
   * Avvia il monitoraggio di un'operazione per misurarne la durata
   * @returns Funzione da chiamare quando l'operazione è completata
   */
  startMeasure(name: string, type: PerformanceMetricType = 'custom'): () => void {
    if (!this.isEnabled) return () => {};
    
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.recordMetric(type, name, duration, 'ms');
    };
  }

  /**
   * Salva le metriche nel localStorage
   */
  private saveMetricsToStorage(): void {
    try {
      if (typeof localStorage !== 'undefined' && this.metrics.length > 0) {
        localStorage.setItem(this.localStorage, JSON.stringify(this.metrics));
      }
    } catch (error) {
      console.error('Failed to save metrics to localStorage:', error);
    }
  }

  /**
   * Carica le metriche dal localStorage
   */
  private loadMetricsFromStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.localStorage);
        if (stored) {
          this.metrics = JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error('Failed to load metrics from localStorage:', error);
      this.metrics = [];
    }
  }

  /**
   * Avvia il salvataggio periodico delle metriche
   */
  private startPeriodicFlush(intervalMs: number): void {
    if (this.flushInterval !== null) {
      clearInterval(this.flushInterval);
    }
    
    this.flushInterval = window.setInterval(() => {
      this.saveMetricsToStorage();
    }, intervalMs);
  }

  /**
   * Attiva/disattiva la raccolta delle metriche
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Ottiene tutte le metriche raccolte
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Ottiene le metriche filtrate per tipo
   */
  getMetricsByType(type: PerformanceMetricType): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.type === type);
  }

  /**
   * Cancella tutte le metriche memorizzate
   */
  clearMetrics(): void {
    this.metrics = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.localStorage);
    }
  }
}

// Esporta una singola istanza per tutta l'applicazione
export const performanceMonitor = new PerformanceMonitor();
