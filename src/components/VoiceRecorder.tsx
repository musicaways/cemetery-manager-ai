
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';
import { toast } from "sonner";
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (text: string) => void;
  disabled?: boolean;
}

export const VoiceRecorder = ({ onRecordingComplete, disabled = false }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Gestione pulizia al unmount del componente
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error("Errore nella pulizia del recognition:", err);
        }
      }
    };
  }, []);

  const startRecording = () => {
    if (disabled) {
      toast.error("La registrazione vocale non è disponibile in modalità offline");
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Il tuo browser non supporta la registrazione vocale");
      return;
    }

    try {
      // Inizializza la riconoscimento vocale
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configura il riconoscimento
      recognitionRef.current.lang = 'it-IT';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      // Gestisci il risultato
      recognitionRef.current.onresult = (event: any) => {
        try {
          if (event?.results?.[0]?.[0]) {
            const rawTranscript = event.results[0][0].transcript;
            // Assicurati di passare una stringa e non un oggetto
            const sanitizedText = typeof rawTranscript === 'string' 
              ? rawTranscript
              : typeof rawTranscript === 'object'
                ? JSON.stringify(rawTranscript)
                : String(rawTranscript || '');
                
            console.log("[VoiceRecorder] Testo riconosciuto:", sanitizedText);
            
            // Invia il testo sanitizzato
            onRecordingComplete(sanitizedText);
          } else {
            console.error("[VoiceRecorder] Risultato vocale non valido:", event);
            toast.error("Nessun testo riconosciuto");
          }
        } catch (resultError) {
          console.error("[VoiceRecorder] Errore nell'elaborazione del risultato vocale:", resultError);
          toast.error("Errore nell'elaborazione della voce");
        } finally {
          setIsRecording(false);
        }
      };
      
      // Gestisci gli errori
      recognitionRef.current.onerror = (event: any) => {
        console.error('[VoiceRecorder] Errore durante la registrazione vocale:', event.error);
        toast.error(`Si è verificato un errore: ${event.error || 'sconosciuto'}`);
        setIsRecording(false);
      };
      
      // Fine della registrazione
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
      
      // Inizia la registrazione
      recognitionRef.current.start();
      setIsRecording(true);
      
      toast.info("Registrazione avviata, parla ora...");
    } catch (initError) {
      console.error("[VoiceRecorder] Errore nell'inizializzazione del riconoscimento vocale:", initError);
      toast.error("Impossibile avviare il riconoscimento vocale");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("[VoiceRecorder] Errore nell'arresto della registrazione:", err);
      }
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      onClick={toggleRecording}
      className={cn(
        "flex items-center justify-center w-full h-full",
        isRecording ? "recording" : "",
        disabled ? "opacity-50 cursor-not-allowed" : ""
      )}
      disabled={disabled}
      type="button"
      aria-label={isRecording ? "Ferma registrazione" : "Avvia registrazione vocale"}
    >
      {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </button>
  );
};
