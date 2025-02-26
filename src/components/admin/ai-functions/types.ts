
export interface AIFunction {
  id: string;
  name: string;
  description: string | null;
  trigger_phrases: string[];
  code: string;
  is_active: boolean;
}

export type AIFunctionInput = {
  name: string;
  description: string | null;
  trigger_phrases: string[];
  code: string;
  is_active: boolean;
};

export interface AIFunctionEditorProps {
  open: boolean;
  onClose: () => void;
  initialData: AIFunction | null;
}
