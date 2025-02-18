
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExternalLink, Check } from "lucide-react";

interface APIKeyFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  linkUrl: string;
  linkText: string;
  provider: string;
  onTest: (provider: string, value: string) => Promise<void>;
  isTesting: boolean;
}

export const APIKeyField = ({ 
  label, 
  value, 
  onChange, 
  linkUrl, 
  linkText, 
  provider,
  onTest,
  isTesting
}: APIKeyFieldProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-200">
        {label}
      </label>
      <div className="flex gap-2">
        <Input
          type="password"
          value={value}
          onChange={onChange}
          placeholder={`Inserisci la tua ${label}`}
          className="bg-[#1A1F2C] border-white/10 flex-1"
        />
        <Button
          onClick={() => onTest(provider, value)}
          disabled={!value || isTesting}
          variant="secondary"
          className="whitespace-nowrap"
        >
          {isTesting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Check className="w-4 h-4" />
          )}
          Test
        </Button>
      </div>
      <a 
        href={linkUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 mt-1"
      >
        <ExternalLink className="w-3 h-3 mr-1" />
        {linkText}
      </a>
    </div>
  );
};
