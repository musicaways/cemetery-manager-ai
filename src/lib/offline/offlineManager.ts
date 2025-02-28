
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Cimitero } from "@/pages/cimiteri/types";

// Definizione dello schema del database IndexedDB
interface CimiteriDBSchema extends DBSchema {
  cimiteri: {
    key: number;
    value: Cimitero;
    indexes: { 'by-descrizione': string };
  };
  pendingChanges: {
    key: string;
    value: {
      id: string;
      table: string;
      operation: 'insert' | 'update' | 'delete';
      data: any;
      timestamp: number;
    };
  };
}

class OfflineManager {
  private db: IDBPDatabase<CimiteriDBSchema> | null = null;
  private syncInProgress = false;
  private initialized = false;
  
  /**
   * Inizializza il database IndexedDB
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      this.db = await openDB<CimiteriDBSchema>('cimiteri-db', 1, {
        upgrade(db) {
          // Store per i dati dei cimiteri
          if (!db.objectStoreNames.contains('cimiteri')) {
            const cimiteriStore = db.createObjectStore('cimiteri', { keyPath: 'Id' });
            cimiteriStore.createIndex('by-descrizione', 'Descrizione');
          }
          
          // Store per le modifiche in attesa di sincronizzazione
          if (!db.objectStoreNames.contains('pendingChanges')) {
            db.createObjectStore('pendingChanges', { keyPath: 'id' });
          }
        }
      });
      
      this.initialized = true;
      
      // Registra event listener per online/offline
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
      
      // Se siamo online, sincronizziamo subito
      if (navigator.onLine) {
        this.syncChanges();
      }
      
      console.log('OfflineManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      toast.error('Errore nell\'inizializzazione del database locale');
    }
  }

  /**
   * Gestisce l'evento "online"
   */
  private handleOnline(): void {
    console.log('App is online, syncing changes...');
    toast.info('Connessione ripristinata', { duration: 3000 });
    this.syncChanges();
  }

  /**
   * Gestisce l'evento "offline"
   */
  private handleOffline(): void {
    console.log('App is offline, switching to local database');
    toast.warning('Modalità offline attivata', { 
      description: 'I dati sono disponibili ma limitati', 
      duration: 4000 
    });
  }

  /**
   * Recupera tutti i cimiteri, dal database locale o da Supabase
   */
  async getCimiteri(): Promise<Cimitero[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Prima controlla il database locale
      const localCimiteri = await this.db?.getAll('cimiteri') || [];
      
      // Se online e il db locale è vuoto o non aggiornato, carica da Supabase
      if (navigator.onLine && (localCimiteri.length === 0 || this.shouldRefreshData())) {
        return await this.fetchAndStoreCimiteri();
      }
      
      // Altrimenti usa i dati locali
      if (localCimiteri.length > 0) {
        console.log(`Retrieved ${localCimiteri.length} cimiteri from local DB`);
        return localCimiteri;
      } else {
        console.log('No local data available and offline');
        return [];
      }
    } catch (error) {
      console.error('Error getting cimiteri:', error);
      return [];
    }
  }

  /**
   * Verifica se è necessario aggiornare i dati locali
   * (ad esempio, se sono passate più di 24 ore dall'ultimo aggiornamento)
   */
  private shouldRefreshData(): boolean {
    const lastUpdate = localStorage.getItem('lastCimiteriUpdate');
    if (!lastUpdate) return true;
    
    const lastUpdateTime = new Date(lastUpdate).getTime();
    const now = new Date().getTime();
    const hoursSinceLastUpdate = (now - lastUpdateTime) / (1000 * 60 * 60);
    
    return hoursSinceLastUpdate > 24;
  }

  /**
   * Recupera i cimiteri da Supabase e li salva localmente
   */
  private async fetchAndStoreCimiteri(): Promise<Cimitero[]> {
    try {
      console.log('Fetching cimiteri from Supabase...');
      
      const { data, error } = await supabase
        .from("Cimitero")
        .select(`
          *,
          settori:Settore(
            Id,
            Codice,
            Descrizione,
            blocchi:Blocco(
              Id,
              Codice,
              Descrizione,
              NumeroFile,
              NumeroLoculi
            )
          ),
          foto:CimiteroFoto(*),
          documenti:CimiteroDocumenti(*),
          mappe:CimiteroMappe(*)
        `)
        .order('Descrizione', { ascending: true });
        
      if (error) throw error;
      
      // Salva nel database locale
      if (data && data.length > 0) {
        const tx = this.db?.transaction('cimiteri', 'readwrite');
        await Promise.all([
          ...data.map(cimitero => tx?.store.put(cimitero)),
          tx?.done
        ]);
        
        // Aggiorna il timestamp dell'ultimo aggiornamento
        localStorage.setItem('lastCimiteriUpdate', new Date().toISOString());
        
        console.log(`Stored ${data.length} cimiteri in local DB`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching cimiteri:', error);
      toast.error('Errore nel caricamento dei cimiteri');
      return [];
    }
  }

  /**
   * Salva un cimitero, localmente se offline o su Supabase se online
   */
  async saveCimitero(cimitero: Partial<Cimitero>, id?: number): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      const timestamp = Date.now();
      const operation = id ? 'update' : 'insert';
      const data = { ...cimitero, Id: id };
      
      // Se online, salva direttamente su Supabase
      if (navigator.onLine) {
        if (operation === 'update' && id) {
          const { error } = await supabase
            .from("Cimitero")
            .update(data)
            .eq("Id", id);
            
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("Cimitero")
            .insert([data]);
            
          if (error) throw error;
        }
        
        // Aggiorna anche il database locale
        if (id) {
          await this.db?.put('cimiteri', data as Cimitero);
        }
        
        return true;
      } 
      // Se offline, salva localmente e aggiungi alla coda di sincronizzazione
      else {
        // Salva nel database locale
        if (id) {
          await this.db?.put('cimiteri', data as Cimitero);
        }
        
        // Registra la modifica pendente
        await this.db?.add('pendingChanges', {
          id: `${operation}-cimitero-${id || 'new'}-${timestamp}`,
          table: 'Cimitero',
          operation,
          data,
          timestamp
        });
        
        toast.info('Modifiche salvate localmente', {
          description: 'Verranno sincronizzate quando sarai online'
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error saving cimitero:', error);
      toast.error('Errore durante il salvataggio');
      return false;
    }
  }

  /**
   * Recupera un singolo cimitero per ID
   */
  async getCimiteroById(id: number): Promise<Cimitero | undefined> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Prima controlla il database locale
      const localCimitero = await this.db?.get('cimiteri', id);
      
      // Se online e non trovato localmente, cerca su Supabase
      if (!localCimitero && navigator.onLine) {
        const { data, error } = await supabase
          .from("Cimitero")
          .select(`
            *,
            settori:Settore(
              Id,
              Codice,
              Descrizione,
              blocchi:Blocco(
                Id,
                Codice,
                Descrizione,
                NumeroFile,
                NumeroLoculi
              )
            ),
            foto:CimiteroFoto(*),
            documenti:CimiteroDocumenti(*),
            mappe:CimiteroMappe(*)
          `)
          .eq("Id", id)
          .single();
          
        if (error || !data) {
          console.error('Error fetching cimitero by id:', error);
          return undefined;
        }
        
        // Salva nel database locale
        await this.db?.put('cimiteri', data);
        
        return data;
      }
      
      return localCimitero;
    } catch (error) {
      console.error('Error getting cimitero by id:', error);
      return undefined;
    }
  }

  /**
   * Sincronizza le modifiche in sospeso con Supabase
   */
  async syncChanges(): Promise<void> {
    if (!this.initialized || this.syncInProgress || !navigator.onLine || !this.db) {
      return;
    }
    
    this.syncInProgress = true;
    
    try {
      // Recupera tutte le modifiche pendenti ordinate per timestamp
      const pendingChanges = await this.db.getAll('pendingChanges');
      if (pendingChanges.length === 0) {
        this.syncInProgress = false;
        return;
      }
      
      console.log(`Syncing ${pendingChanges.length} pending changes...`);
      pendingChanges.sort((a, b) => a.timestamp - b.timestamp);
      
      let successCount = 0;
      
      for (const change of pendingChanges) {
        try {
          if (change.operation === 'update') {
            // Usa l'operatore 'as' per dire a TypeScript che stiamo usando un tipo valido
            const { error } = await supabase
              .from(change.table as "Cimitero")
              .update(change.data)
              .eq('Id', change.data.Id);
              
            if (error) throw error;
          } else if (change.operation === 'insert') {
            const { error } = await supabase
              .from(change.table as "Cimitero")
              .insert([change.data]);
              
            if (error) throw error;
          } else if (change.operation === 'delete') {
            const { error } = await supabase
              .from(change.table as "Cimitero")
              .delete()
              .eq('Id', change.data.Id);
              
            if (error) throw error;
          }
          
          // Rimuovi la modifica pendente una volta sincronizzata
          await this.db.delete('pendingChanges', change.id);
          successCount++;
        } catch (error) {
          console.error(`Error syncing change ${change.id}:`, error);
          // Continua con la prossima modifica
        }
      }
      
      if (successCount > 0) {
        console.log(`Successfully synced ${successCount} changes`);
        toast.success(`${successCount} modifiche sincronizzate`);
        
        // Aggiorna i dati locali con quelli più recenti
        await this.fetchAndStoreCimiteri();
      }
    } catch (error) {
      console.error('Error syncing changes:', error);
      toast.error('Errore durante la sincronizzazione');
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Ritorna lo stato della connessione
   */
  isOnline(): boolean {
    return navigator.onLine;
  }
}

// Esporta una singola istanza del manager
export const offlineManager = new OfflineManager();
