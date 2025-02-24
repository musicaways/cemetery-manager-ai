
export interface Cimitero {
  Id: number;
  Codice: string;
  Descrizione: string;
  Indirizzo: string | null;
  Latitudine: number | null;
  Longitudine: number | null;
  FotoCopertina: string | null;
  settori: Settore[];
  foto: CimiteroFoto[];
  documenti: CimiteroDocumenti[];
  mappe: CimiteroMappe[];
}

export interface Settore {
  Id: number;
  Codice: string;
  Descrizione: string;
}

export interface CimiteroFoto {
  Id: string;
  Url: string;
  Descrizione: string | null;
  DataInserimento: string;
}

export interface CimiteroDocumenti {
  Id: string;
  Url: string;
  NomeFile: string;
  TipoFile: string;
  Descrizione: string | null;
  DataInserimento: string;
}

export interface CimiteroMappe {
  Id: string;
  Url: string;
  Descrizione: string | null;
  DataInserimento: string;
}
