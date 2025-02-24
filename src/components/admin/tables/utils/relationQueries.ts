
export const isPrimaryKey = (column: any) => {
  // Controlliamo sia il campo is_pk che viene dalla funzione get_complete_schema
  // che la presenza di PK nelle proprietà della colonna
  return column.is_pk || 
    (column.column_default && 
     typeof column.column_default === 'string' && 
     (column.column_default.includes('nextval') || 
      column.column_default.includes('gen_random_uuid')));
};

export const createRelationQueries = (
  tableName: string,
  columnName: string,
  foreignTableName: string,
  foreignColumnName: string,
  foreignColumnType: string
) => {
  const constraintName = `${tableName}_${columnName}_fkey`;

  return {
    // Prima eliminiamo il vincolo se esiste
    dropExistingConstraintSQL: `
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = '${constraintName}'
        ) THEN
          ALTER TABLE "${tableName}" 
          DROP CONSTRAINT "${constraintName}";
        END IF;
      END $$;
    `,

    // Aggiorniamo il tipo della colonna per farla corrispondere alla chiave primaria
    columnTypeSQL: `
      ALTER TABLE "${tableName}" 
      ALTER COLUMN "${columnName}" 
      TYPE ${foreignColumnType}
      USING "${columnName}"::${foreignColumnType};
    `,

    // Creiamo il vincolo di chiave esterna
    relationSQL: `
      ALTER TABLE "${tableName}"
      ADD CONSTRAINT "${constraintName}"
      FOREIGN KEY ("${columnName}")
      REFERENCES "${foreignTableName}"("${foreignColumnName}");
    `
  };
};
