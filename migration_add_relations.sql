-- Migration: Add relation support to existing spreadsheet system
-- Execute this in your Supabase SQL editor

-- 1. Add 'relation' to the existing data_type constraint
ALTER TABLE spreadsheet_columns 
DROP CONSTRAINT IF EXISTS spreadsheet_columns_data_type_check;

ALTER TABLE spreadsheet_columns 
ADD CONSTRAINT spreadsheet_columns_data_type_check 
CHECK (data_type IN ('text', 'number', 'date', 'select', 'checkbox', 'relation'));

-- 2. Create spreadsheet_relations table if it doesn't exist
CREATE TABLE IF NOT EXISTS spreadsheet_relations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  row_id UUID REFERENCES spreadsheet_rows(id) ON DELETE CASCADE,
  column_id UUID REFERENCES spreadsheet_columns(id) ON DELETE CASCADE,
  related_row_id UUID REFERENCES spreadsheet_rows(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(row_id, column_id, related_row_id)
);

-- 3. Enable RLS on spreadsheet_relations table
ALTER TABLE spreadsheet_relations ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for spreadsheet_relations
CREATE POLICY "Users can view relations of their spreadsheets" ON spreadsheet_relations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM spreadsheet_rows sr
      JOIN spreadsheets s ON s.id = sr.spreadsheet_id
      WHERE sr.id = spreadsheet_relations.row_id 
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert relations to their spreadsheets" ON spreadsheet_relations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM spreadsheet_rows sr
      JOIN spreadsheets s ON s.id = sr.spreadsheet_id
      WHERE sr.id = spreadsheet_relations.row_id 
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update relations of their spreadsheets" ON spreadsheet_relations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM spreadsheet_rows sr
      JOIN spreadsheets s ON s.id = sr.spreadsheet_id
      WHERE sr.id = spreadsheet_relations.row_id 
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete relations of their spreadsheets" ON spreadsheet_relations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM spreadsheet_rows sr
      JOIN spreadsheets s ON s.id = sr.spreadsheet_id
      WHERE sr.id = spreadsheet_relations.row_id 
      AND s.user_id = auth.uid()
    )
  );

-- 5. Create indexes for better performance on relations
CREATE INDEX IF NOT EXISTS idx_spreadsheet_relations_row_id ON spreadsheet_relations(row_id);
CREATE INDEX IF NOT EXISTS idx_spreadsheet_relations_column_id ON spreadsheet_relations(column_id);
CREATE INDEX IF NOT EXISTS idx_spreadsheet_relations_related_row_id ON spreadsheet_relations(related_row_id);

-- 6. Add a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_spreadsheet_relations_row_column ON spreadsheet_relations(row_id, column_id);

-- 7. Optional: Add a function to validate relation constraints
CREATE OR REPLACE FUNCTION validate_relation_constraint()
RETURNS TRIGGER AS $$
BEGIN
  -- Check that the related row exists and is accessible
  IF NOT EXISTS (
    SELECT 1 FROM spreadsheet_rows sr
    JOIN spreadsheets s ON s.id = sr.spreadsheet_id
    WHERE sr.id = NEW.related_row_id
    AND s.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Cannot create relation to inaccessible row';
  END IF;
  
  -- Check that the column is a relation type
  IF NOT EXISTS (
    SELECT 1 FROM spreadsheet_columns 
    WHERE id = NEW.column_id 
    AND data_type = 'relation'
  ) THEN
    RAISE EXCEPTION 'Column must be of type relation';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to validate relations
DROP TRIGGER IF EXISTS validate_relation_trigger ON spreadsheet_relations;
CREATE TRIGGER validate_relation_trigger
  BEFORE INSERT OR UPDATE ON spreadsheet_relations
  FOR EACH ROW
  EXECUTE FUNCTION validate_relation_constraint();

-- 9. Add helpful comments
COMMENT ON TABLE spreadsheet_relations IS 'Stores relationships between rows in different spreadsheets';
COMMENT ON COLUMN spreadsheet_relations.row_id IS 'The source row that has the relation';
COMMENT ON COLUMN spreadsheet_relations.column_id IS 'The relation column in the source spreadsheet';
COMMENT ON COLUMN spreadsheet_relations.related_row_id IS 'The target row being related to';

-- 10. Verify the migration
DO $$
BEGIN
  -- Check if relation data type is available
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'spreadsheet_columns_data_type_check'
    AND check_clause LIKE '%relation%'
  ) THEN
    RAISE EXCEPTION 'Migration failed: relation data type not added';
  END IF;
  
  -- Check if relations table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'spreadsheet_relations'
  ) THEN
    RAISE EXCEPTION 'Migration failed: spreadsheet_relations table not created';
  END IF;
  
  RAISE NOTICE 'Migration completed successfully! Relation feature is now available.';
END $$;
