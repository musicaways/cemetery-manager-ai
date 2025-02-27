
import { Cimitero } from "@/pages/cimiteri/types";
import { offlineManager } from "@/lib/offline/offlineManager";
import { ChatMessage } from "./types";

interface UseChatCimiteriHandlersParams {
  findCimiteroByName: (nome: string) => Promise<Cimitero | null>;
  getAllCimiteri: () => Promise<Cimitero[]>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isOnline: boolean;
}

export const useChatCimiteriHandlers = ({
  findCimiteroByName,
  getAllCimiteri,
  setMessages,
  isOnline
}: UseChatCimiteriHandlersParams) => {
  
  /**
   * Funzione per verificare e gestire la richiesta di lista cimiteri
   */
  const handleListaCimiteriRequest = async (normalizedQuery: string): Promise<boolean> => {
    const listaCimiteriExactPhrases = [
      "mostrami tutti i cimiteri",
      "mostrami la lista dei cimiteri",
      "mostrami la lista di tutti i cimiteri",
      "mostra tutti i cimiteri",
      "mostra la lista dei cimiteri",
      "mostra la lista di tutti i cimiteri",
      "visualizza i cimiteri",
      "visualizza tutti i cimiteri",
      "fammi vedere i cimiteri",
      "fammi vedere tutti i cimiteri",
      "vedi i cimiteri",
      "vedi tutti i cimiteri",
      "lista dei cimiteri",
      "lista di tutti i cimiteri",
      "elenco dei cimiteri",
      "elenco di tutti i cimiteri"
    ];

    const isListaCimiteriExactMatch = listaCimiteriExactPhrases.includes(normalizedQuery);
    
    if (isListaCimiteriExactMatch) {
      console.log("MATCH ESATTO trovato per la funzione 'Lista cimiteri'");
      
      let cimiteri;
      if (isOnline) {
        cimiteri = await getAllCimiteri();
      } else {
        // In modalità offline, usa il manager offline
        cimiteri = await offlineManager.getCimiteri();
      }
      
      setMessages(prev => [...prev, { 
        type: 'response', 
        content: 'Ecco la lista dei cimiteri disponibili:',
        data: {
          type: 'cimiteri',
          cimiteri
        },
        timestamp: new Date()
      }]);
      return true;
    }
    
    return false;
  };

  /**
   * Funzione per verificare e gestire la richiesta di dettagli cimitero
   */
  const handleDettagliCimiteroRequest = async (normalizedQuery: string): Promise<boolean> => {
    const cimiteroPatterns = [
      "mostrami il cimitero ",
      "mostra il cimitero ",
      "mostrami cimitero ",
      "mostra cimitero ",
      "apri il cimitero ",
      "apri cimitero ",
      "dettagli cimitero ",
      "informazioni cimitero ",
      "mostra informazioni cimitero ",
      "mostra informazioni sul cimitero ",
      "mostra informazioni del cimitero ",
      "voglio vedere il cimitero ",
      "fammi vedere il cimitero ",
      "visualizza cimitero ",
      "visualizza il cimitero "
    ];

    // Verifica se la query inizia con uno dei pattern
    let matchedPattern = null;
    let nomeCimitero = null;

    for (const pattern of cimiteroPatterns) {
      if (normalizedQuery.startsWith(pattern)) {
        matchedPattern = pattern;
        nomeCimitero = normalizedQuery.substring(pattern.length).trim();
        break;
      }
    }

    if (matchedPattern) {
      if (nomeCimitero && nomeCimitero.length > 0) {
        console.log(`Cercando cimitero con nome: "${nomeCimitero}"`);
        
        let cimitero;
        if (isOnline) {
          cimitero = await findCimiteroByName(nomeCimitero);
        } else {
          // In modalità offline, cerca tra i cimiteri disponibili localmente
          const cimiteri = await offlineManager.getCimiteri();
          cimitero = cimiteri.find(c => 
            c.Descrizione?.toLowerCase().includes(nomeCimitero.toLowerCase()) ||
            c.Codice?.toLowerCase().includes(nomeCimitero.toLowerCase())
          );
        }

        if (cimitero) {
          setMessages(prev => [...prev, { 
            type: 'response', 
            content: `Ho trovato il cimitero "${cimitero.Descrizione}"`,
            data: {
              type: 'cimitero',
              cimitero
            },
            timestamp: new Date()
          }]);
        } else {
          setMessages(prev => [...prev, { 
            type: 'response', 
            content: `Non ho trovato nessun cimitero con il nome "${nomeCimitero}".`,
            timestamp: new Date()
          }]);
        }
      } else {
        setMessages(prev => [...prev, { 
          type: 'response', 
          content: `Per favore, specifica quale cimitero desideri visualizzare. Puoi chiedere "mostrami il cimitero [nome]" oppure chiedere "lista dei cimiteri" per vedere tutti i cimiteri disponibili.`,
          timestamp: new Date()
        }]);
      }
      return true;
    }

    return false;
  };

  return {
    handleListaCimiteriRequest,
    handleDettagliCimiteroRequest
  };
};
