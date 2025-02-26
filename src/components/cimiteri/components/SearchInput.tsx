
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const SearchInput = ({ value, onChange, placeholder }: SearchInputProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-9 bg-black/20 border-gray-800 text-white placeholder:text-gray-500 text-sm h-9 focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
      />
      {value && (
        <button 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          onClick={() => onChange("")}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
