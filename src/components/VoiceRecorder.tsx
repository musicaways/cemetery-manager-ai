
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
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<number>();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          
          if (base64Audio) {
            try {
              const { data, error } = await supabase.functions.invoke('process-voice', {
                body: { audio: base64Audio }
              });

              if (error) throw error;
              if (data?.text) {
                onRecordingComplete(data.text);
              }
            } catch (error) {
              console.error('Errore processing:', error);
              toast.error('Errore durante l\'elaborazione dell\'audio');
            }
          }
        };
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      chunks.current = [];
      
      timerRef.current = window.setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Errore microfono:', error);
      toast.error('Errore accesso al microfono');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
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
