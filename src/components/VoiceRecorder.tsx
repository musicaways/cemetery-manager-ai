
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, X } from "lucide-react";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onRecordingComplete: (text: string) => void;
}

export const VoiceRecorder = ({ onRecordingComplete }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const recognition = useRef<any>(null);
  const timerRef = useRef<number>();

  const startRecording = async () => {
    try {
      if (!window.webkitSpeechRecognition) {
        throw new Error('Il tuo browser non supporta il riconoscimento vocale');
      }

      const SpeechRecognition = window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false; // Cambiato a false per evitare ripetizioni
      recognition.current.interimResults = false; // Cambiato a false per avere solo risultati finali
      recognition.current.lang = 'it-IT';

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onRecordingComplete(transcript);
        stopRecording();
      };

      recognition.current.onerror = (event: any) => {
        console.error('Errore riconoscimento:', event.error);
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
    }
  };

  const stopRecording = () => {
    if (recognition.current && isRecording) {
      recognition.current.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
      setDuration(0);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {isRecording ? (
        <div className="flex items-center space-x-2 bg-orange-500/20 text-orange-500 px-4 py-2 rounded-full">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-orange-500 hover:text-orange-400"
            onClick={stopRecording}
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>{duration}s</span>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-gray-800"
          onClick={startRecording}
        >
          <Mic className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};
