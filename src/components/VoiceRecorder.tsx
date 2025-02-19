
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
      variant="ghost"
      size="icon"
      className={`relative text-gray-400 hover:text-gray-300 transition-colors ${
        isRecording ? 'recording-pulse' : ''
      }`}
      onClick={startRecording}
      disabled={isRecording}
    >
      <Mic className="h-5 w-5" />
      {isRecording && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </div>
      )}
    </Button>
  );
};
