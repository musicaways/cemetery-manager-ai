
import React, { useState, useRef } from 'react';
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

  const startRecording = () => {
    if (disabled) {
      toast.error("La registrazione vocale non è disponibile in modalità offline");
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Il tuo browser non supporta la registrazione vocale");
      return;
    }

    // Inizializza la riconoscimento vocale
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Configura il riconoscimento
    recognitionRef.current.lang = 'it-IT';
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    
    // Gestisci il risultato
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      // Assicurati di passare una stringa e non un oggetto
      if (typeof transcript === 'string') {
        onRecordingComplete(transcript);
      } else {
        console.error('Transcript non è una stringa:', transcript);
        toast.error("Errore nel riconoscimento vocale: formato non valido");
      }
      setIsRecording(false);
    };
    
    // Gestisci gli errori
    recognitionRef.current.onerror = (event: any) => {
      console.error('Errore durante la registrazione vocale:', event.error);
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
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
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
    >
      {isRecording ? <Square /> : <Mic />}
    </button>
  );
};
