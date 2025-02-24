
export type TableInfo = {
  table_name: string;
  columns: ColumnInfo[];
  foreign_keys?: ForeignKeyInfo[];
};

export type ColumnInfo = {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
};

export type ForeignKeyInfo = {
  column: string;
  foreign_table: string;
  foreign_column: string;
};

export type SchemaResponse = {
  tables: Array<{
    name: string;
    columns: Array<{
      name: string;
      type: string;
      is_nullable: boolean;
      default_value: string | null;
    }>;
    foreign_keys?: Array<{
      column: string;
      foreign_table: string;
      foreign_column: string;
    }>;
  }>;
};
