
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
    <div className="relative flex items-center">
      {isRecording && (
        <div className="absolute right-full mr-2 flex items-center space-x-2 bg-[#333333]/50 px-3 py-1 rounded-full border border-[#9b87f5]/20">
          <div className="w-2 h-2 rounded-full bg-[#9b87f5] animate-[pulse_1.5s_ease-in-out_infinite]" />
          <span className="text-sm text-[#9b87f5]">{duration}s</span>
        </div>
      )}
      
      <Button
        variant="ghost"
        size="icon"
        onClick={isRecording ? stopRecording : startRecording}
        className={`relative h-8 w-8 rounded-full transition-all duration-200 ${
          isRecording 
            ? "border-2 border-[#9b87f5] bg-[#9b87f5]/10 text-[#9b87f5]"
            : "border-2 border-white/20 text-gray-400 hover:text-[#9b87f5] hover:border-[#9b87f5] hover:bg-[#9b87f5]/10"
        }`}
      >
        {isRecording && (
          <div className="absolute inset-0 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] bg-[#9b87f5]/30" />
        )}
        {isRecording ? (
          <MicOff className="h-4 w-4 relative z-10" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        <span className="sr-only">
          {isRecording ? "Interrompi registrazione" : "Avvia registrazione vocale"}
        </span>
      </Button>
    </div>
  );
};
