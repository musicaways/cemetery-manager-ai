
import React, { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (text: string) => void;
  disabled?: boolean;
}

export const VoiceRecorder = ({ onRecordingComplete, disabled = false }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const startRecording = () => {
    if (disabled) {
      toast({
        title: "Registrazione non disponibile",
        description: "La registrazione vocale non è disponibile in modalità offline",
        variant: "destructive"
      });
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Browser non supportato",
        description: "Il tuo browser non supporta la registrazione vocale",
        variant: "destructive"
      });
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
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onRecordingComplete(transcript);
      setIsRecording(false);
    };
    
    // Gestisci gli errori
    recognitionRef.current.onerror = (event) => {
      console.error('Errore durante la registrazione vocale:', event.error);
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${event.error}`,
        variant: "destructive"
      });
      setIsRecording(false);
    };
    
    // Fine della registrazione
    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };
    
    // Inizia la registrazione
    recognitionRef.current.start();
    setIsRecording(true);
    
    toast({
      title: "Registrazione avviata",
      description: "Parla ora...",
    });
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
    >
      {isRecording ? <Square /> : <Mic />}
    </button>
  );
};
