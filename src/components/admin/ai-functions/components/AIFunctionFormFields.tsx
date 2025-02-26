
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AIFunctionFormFieldsProps {
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  triggerPhrasesText: string;
  setTriggerPhrasesText: (value: string) => void;
  code: string;
  setCode: (value: string) => void;
}

export const AIFunctionFormFields = ({
  name,
  setName,
  description,
  setDescription,
  triggerPhrasesText,
  setTriggerPhrasesText,
  code,
  setCode
}: AIFunctionFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-white">
          Nome
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-[#2A2F3C] border-[#4F46E5] text-white"
          placeholder="Nome della funzione"
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-white">
          Descrizione
        </Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-[#2A2F3C] border-[#4F46E5] text-white"
          placeholder="Descrizione della funzione"
        />
      </div>

      <div>
        <Label htmlFor="trigger_phrases" className="text-white">
          Frasi Trigger (una per riga)
        </Label>
        <textarea
          id="trigger_phrases"
          value={triggerPhrasesText}
          onChange={(e) => setTriggerPhrasesText(e.target.value)}
          className="w-full h-32 p-3 rounded-md bg-[#2A2F3C] border border-[#4F46E5] text-white resize-none"
          placeholder="Inserisci le frasi trigger, una per riga"
        />
      </div>

      <div>
        <Label htmlFor="code" className="text-white">
          Codice
        </Label>
        <textarea
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-64 p-3 rounded-md bg-[#2A2F3C] border border-[#4F46E5] text-white font-mono resize-none"
          placeholder="Inserisci il codice della funzione"
        />
      </div>
    </div>
  );
};
