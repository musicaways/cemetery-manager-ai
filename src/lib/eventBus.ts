
type EventCallback = (...args: any[]) => void;

/**
 * Sistema di eventi PubSub per comunicazione tra componenti
 * Riduce la necessità di prop-drilling e migliora la testabilità
 */
class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  /**
   * Sottoscrive un callback a un evento specifico
   * @param event Nome dell'evento
   * @param callback Funzione da eseguire quando l'evento viene attivato
   * @returns Funzione per annullare la sottoscrizione
   */
  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const callbacks = this.events.get(event)!;
    callbacks.push(callback);

    // Restituisci una funzione per annullare la sottoscrizione
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Pubblica un evento con i dati forniti
   * @param event Nome dell'evento
   * @param args Dati da passare ai callbacks
   */
  publish(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (!callbacks) return;

    callbacks.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
      }
    });
  }

  /**
   * Rimuove tutti i callback per un evento specifico
   * @param event Nome dell'evento (opzionale, se non specificato rimuove tutti gli eventi)
   */
  clear(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

// Esporta una singola istanza per tutta l'applicazione
export const eventBus = new EventBus();

// Eventi definiti dell'applicazione
export const AppEvents = {
  CONNECTIVITY_CHANGE: 'connectivity:change',
  SYNC_STARTED: 'sync:started',
  SYNC_COMPLETED: 'sync:completed',
  SYNC_FAILED: 'sync:failed',
  MODEL_LOADED: 'model:loaded',
  MODEL_LOADING_FAILED: 'model:loading:failed',
  PERFORMANCE_METRIC: 'performance:metric',
  ERROR_OCCURRED: 'error:occurred',
  DATA_UPDATED: 'data:updated',
  USER_ACTION: 'user:action'
};
