export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Blocco: {
        Row: {
          Annotazioni: string | null
          Codice: string | null
          Descrizione: string | null
          Id: number
          IdSettore: number | null
          NumeroFile: number | null
          NumeroFileInterrate: number | null
          NumeroLoculi: number | null
          NumeroPartenza: number | null
          PassoNumeri: number | null
          TipoNumerazione: number | null
        }
        Insert: {
          Annotazioni?: string | null
          Codice?: string | null
          Descrizione?: string | null
          Id: number
          IdSettore?: number | null
          NumeroFile?: number | null
          NumeroFileInterrate?: number | null
          NumeroLoculi?: number | null
          NumeroPartenza?: number | null
          PassoNumeri?: number | null
          TipoNumerazione?: number | null
        }
        Update: {
          Annotazioni?: string | null
          Codice?: string | null
          Descrizione?: string | null
          Id?: number
          IdSettore?: number | null
          NumeroFile?: number | null
          NumeroFileInterrate?: number | null
          NumeroLoculi?: number | null
          NumeroPartenza?: number | null
          PassoNumeri?: number | null
          TipoNumerazione?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Blocco_IdSettore_fkey"
            columns: ["IdSettore"]
            isOneToOne: false
            referencedRelation: "Settore"
            referencedColumns: ["Id"]
          },
          {
            foreignKeyName: "Blocco_TipoNumerazione_fkey"
            columns: ["TipoNumerazione"]
            isOneToOne: false
            referencedRelation: "TipoNumerazione"
            referencedColumns: ["Id"]
          },
        ]
      }
      Cimitero: {
        Row: {
          Codice: string | null
          Descrizione: string | null
          Id: number
        }
        Insert: {
          Codice?: string | null
          Descrizione?: string | null
          Id: number
        }
        Update: {
          Codice?: string | null
          Descrizione?: string | null
          Id?: number
        }
        Relationships: []
      }
      Defunto: {
        Row: {
          DataDecesso: string | null
          DataNascita: string | null
          Eta: string | null
          Id: number
          IdLoculo: number | null
          Nominativo: string | null
          Posto: string | null
          Sesso: string | null
          StatoDefunto: number | null
        }
        Insert: {
          DataDecesso?: string | null
          DataNascita?: string | null
          Eta?: string | null
          Id: number
          IdLoculo?: number | null
          Nominativo?: string | null
          Posto?: string | null
          Sesso?: string | null
          StatoDefunto?: number | null
        }
        Update: {
          DataDecesso?: string | null
          DataNascita?: string | null
          Eta?: string | null
          Id?: number
          IdLoculo?: number | null
          Nominativo?: string | null
          Posto?: string | null
          Sesso?: string | null
          StatoDefunto?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Defunto_IdLoculo_fkey"
            columns: ["IdLoculo"]
            isOneToOne: false
            referencedRelation: "Loculo"
            referencedColumns: ["Id"]
          },
        ]
      }
      Loculo: {
        Row: {
          Annotazioni: string | null
          Fila: number | null
          Id: number
          IdBlocco: number | null
          Numero: number | null
          TipoTomba: number | null
        }
        Insert: {
          Annotazioni?: string | null
          Fila?: number | null
          Id: number
          IdBlocco?: number | null
          Numero?: number | null
          TipoTomba?: number | null
        }
        Update: {
          Annotazioni?: string | null
          Fila?: number | null
          Id?: number
          IdBlocco?: number | null
          Numero?: number | null
          TipoTomba?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Loculo_IdBlocco_fkey"
            columns: ["IdBlocco"]
            isOneToOne: false
            referencedRelation: "Blocco"
            referencedColumns: ["Id"]
          },
          {
            foreignKeyName: "Loculo_TipoTomba_fkey"
            columns: ["TipoTomba"]
            isOneToOne: false
            referencedRelation: "TipoLoculo"
            referencedColumns: ["Id"]
          },
        ]
      }
      Settore: {
        Row: {
          Codice: string | null
          Descrizione: string | null
          Id: number
          IdCimitero: number | null
        }
        Insert: {
          Codice?: string | null
          Descrizione?: string | null
          Id: number
          IdCimitero?: number | null
        }
        Update: {
          Codice?: string | null
          Descrizione?: string | null
          Id?: number
          IdCimitero?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Settore_IdCimitero_fkey"
            columns: ["IdCimitero"]
            isOneToOne: false
            referencedRelation: "Cimitero"
            referencedColumns: ["Id"]
          },
        ]
      }
      TipoLoculo: {
        Row: {
          Codice: number | null
          Descrizione: string | null
          Id: number
        }
        Insert: {
          Codice?: number | null
          Descrizione?: string | null
          Id: number
        }
        Update: {
          Codice?: number | null
          Descrizione?: string | null
          Id?: number
        }
        Relationships: []
      }
      TipoNumerazione: {
        Row: {
          Codice: string | null
          Descrizione: string | null
          Id: number
        }
        Insert: {
          Codice?: string | null
          Descrizione?: string | null
          Id: number
        }
        Update: {
          Codice?: string | null
          Descrizione?: string | null
          Id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_complete_schema: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
