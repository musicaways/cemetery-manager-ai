
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onRecordingComplete: (text: string) => void;
}

export const VoiceRecorder = ({ onRecordingComplete }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognition = useRef<SpeechRecognition | null>(null);

  const startRecording = async () => {
    try {
      if (!('webkitSpeechRecognition' in window)) {
        throw new Error('Il tuo browser non supporta il riconoscimento vocale');
      }

      const SpeechRecognition = window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'it-IT';

      recognition.current.onstart = () => {
        setIsRecording(true);
      };

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
    setIsRecording(false);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 p-1 text-gray-400 hover:text-gray-300"
      onClick={startRecording}
      disabled={isRecording}
    >
      <div className={`relative h-full w-full ${isRecording ? 'animate-pulse' : ''}`}>
        <Mic className="h-full w-full" />
        {isRecording && (
          <div className="absolute inset-0 animate-ping">
            <div className="h-full w-full rounded-full bg-red-500/30" />
          </div>
        )}
      </div>
    </Button>
  );
};
