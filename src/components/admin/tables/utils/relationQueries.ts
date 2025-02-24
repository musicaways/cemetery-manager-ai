
export const createRelationQueries = (
  currentTable: string,
  selectedColumn: string,
  selectedTable: string,
  selectedForeignColumn: string,
  foreignColumnType: string
) => {
  // Query per rimuovere eventuali relazioni esistenti
  const dropExistingConstraintSQL = `
    DO $$
    BEGIN
      EXECUTE (
        SELECT 'ALTER TABLE "' || '${currentTable}' || '" DROP CONSTRAINT "' || conname || '"'
        FROM pg_constraint
        WHERE conrelid = '"${currentTable}"'::regclass
        AND conkey = ARRAY[(
          SELECT attnum
          FROM pg_attribute
          WHERE attrelid = '"${currentTable}"'::regclass
          AND attname = '${selectedColumn}'
        )]
        AND contype = 'f'
        LIMIT 1
      );
    EXCEPTION WHEN OTHERS THEN
      -- Ignoriamo eventuali errori se il constraint non esiste
    END $$;
  `;

  // Query per modificare il tipo della colonna
  const columnTypeSQL = `
    ALTER TABLE "${currentTable}"
    ALTER COLUMN "${selectedColumn}" TYPE ${foreignColumnType} 
    USING "${selectedColumn}"::${foreignColumnType};
  `;

  // Query per creare la nuova relazione
  const relationSQL = `
    ALTER TABLE "${currentTable}"
    ADD CONSTRAINT "fk_${currentTable}_${selectedTable}_${selectedColumn}"
    FOREIGN KEY ("${selectedColumn}")
    REFERENCES "${selectedTable}"("${selectedForeignColumn}")
    ON DELETE CASCADE;
  `;

  return {
    dropExistingConstraintSQL,
    columnTypeSQL,
    relationSQL
  };
};

export const isPrimaryKey = (column: any) => {
  // Una colonna è considerata chiave primaria se:
  // 1. Ha il flag is_pk impostato a true
  // 2. O ha una sequenza come default value (nextval) ed è NOT NULL
  // 3. O si chiama "id" ed è NOT NULL
  // 4. O è di tipo uuid/integer/bigint/numeric ed è NOT NULL
  return (column.is_pk === true) || 
         (column.is_nullable === 'NO' && (
           (column.column_default?.includes('nextval')) ||
           (column.column_name.toLowerCase() === 'id') ||
           (['uuid', 'integer', 'bigint', 'numeric'].includes(column.data_type))
         ));
};
