
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, X, MicOff } from "lucide-react";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onRecordingComplete: (text: string) => void;
}

export const VoiceRecorder = ({ onRecordingComplete }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const recognition = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<number>();

  const startRecording = async () => {
    try {
      if (!('webkitSpeechRecognition' in window)) {
        throw new Error('Il tuo browser non supporta il riconoscimento vocale');
      }

      if (recognition.current) {
        recognition.current.stop();
      }

      const SpeechRecognition = window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'it-IT';

      recognition.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        onRecordingComplete(transcript);
        stopRecording();
      };

      recognition.current.onerror = (event: Event) => {
        console.error('Errore riconoscimento:', event);
        toast.error('Errore durante il riconoscimento vocale');
        stopRecording();
      };

      recognition.current.onend = () => {
        stopRecording();
      };

      recognition.current.start();
      setIsRecording(true);
      
      timerRef.current = window.setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Errore microfono:', error);
      toast.error('Errore accesso al microfono');
      stopRecording();
    }
  };

  const stopRecording = () => {
    if (recognition.current) {
      recognition.current.stop();
    }
    clearInterval(timerRef.current);
    setIsRecording(false);
    setDuration(0);
  };

  return (
    <div className="flex items-center space-x-2">
      {isRecording ? (
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400"
          onClick={stopRecording}
        >
          <div className="absolute inset-0 rounded-full animate-ping bg-red-500/20" />
          <MicOff className="h-5 w-5 relative z-10" />
          <span className="sr-only">Interrompi registrazione</span>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 hover:text-blue-400 transition-all duration-200"
          onClick={startRecording}
        >
          <Mic className="h-5 w-5" />
          <span className="sr-only">Avvia registrazione vocale</span>
        </Button>
      )}
      
      {isRecording && (
        <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/50">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm text-gray-400">{duration}s</span>
        </div>
      )}
    </div>
  );
};
