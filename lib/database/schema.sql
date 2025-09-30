-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create spreadsheets table
CREATE TABLE IF NOT EXISTS spreadsheets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spreadsheet_columns table
CREATE TABLE IF NOT EXISTS spreadsheet_columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spreadsheet_id UUID REFERENCES spreadsheets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data_type TEXT NOT NULL CHECK (data_type IN ('text', 'number', 'date', 'select', 'checkbox')),
  options JSONB, -- For select type columns
  column_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spreadsheet_rows table
CREATE TABLE IF NOT EXISTS spreadsheet_rows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spreadsheet_id UUID REFERENCES spreadsheets(id) ON DELETE CASCADE,
  row_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spreadsheet_cells table
CREATE TABLE IF NOT EXISTS spreadsheet_cells (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  row_id UUID REFERENCES spreadsheet_rows(id) ON DELETE CASCADE,
  column_id UUID REFERENCES spreadsheet_columns(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(row_id, column_id)
);

-- Enable RLS on all tables
ALTER TABLE spreadsheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE spreadsheet_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE spreadsheet_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE spreadsheet_cells ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for spreadsheets
CREATE POLICY "Users can view their own spreadsheets" ON spreadsheets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spreadsheets" ON spreadsheets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spreadsheets" ON spreadsheets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spreadsheets" ON spreadsheets
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for spreadsheet_columns
CREATE POLICY "Users can view columns of their spreadsheets" ON spreadsheet_columns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM spreadsheets 
      WHERE spreadsheets.id = spreadsheet_columns.spreadsheet_id 
      AND spreadsheets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert columns to their spreadsheets" ON spreadsheet_columns
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM spreadsheets 
      WHERE spreadsheets.id = spreadsheet_columns.spreadsheet_id 
      AND spreadsheets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update columns of their spreadsheets" ON spreadsheet_columns
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM spreadsheets 
      WHERE spreadsheets.id = spreadsheet_columns.spreadsheet_id 
      AND spreadsheets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete columns of their spreadsheets" ON spreadsheet_columns
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM spreadsheets 
      WHERE spreadsheets.id = spreadsheet_columns.spreadsheet_id 
      AND spreadsheets.user_id = auth.uid()
    )
  );

-- Create RLS policies for spreadsheet_rows
CREATE POLICY "Users can view rows of their spreadsheets" ON spreadsheet_rows
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM spreadsheets 
      WHERE spreadsheets.id = spreadsheet_rows.spreadsheet_id 
      AND spreadsheets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert rows to their spreadsheets" ON spreadsheet_rows
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM spreadsheets 
      WHERE spreadsheets.id = spreadsheet_rows.spreadsheet_id 
      AND spreadsheets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update rows of their spreadsheets" ON spreadsheet_rows
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM spreadsheets 
      WHERE spreadsheets.id = spreadsheet_rows.spreadsheet_id 
      AND spreadsheets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete rows of their spreadsheets" ON spreadsheet_rows
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM spreadsheets 
      WHERE spreadsheets.id = spreadsheet_rows.spreadsheet_id 
      AND spreadsheets.user_id = auth.uid()
    )
  );

-- Create RLS policies for spreadsheet_cells
CREATE POLICY "Users can view cells of their spreadsheets" ON spreadsheet_cells
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM spreadsheet_rows sr
      JOIN spreadsheets s ON s.id = sr.spreadsheet_id
      WHERE sr.id = spreadsheet_cells.row_id 
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert cells to their spreadsheets" ON spreadsheet_cells
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM spreadsheet_rows sr
      JOIN spreadsheets s ON s.id = sr.spreadsheet_id
      WHERE sr.id = spreadsheet_cells.row_id 
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cells of their spreadsheets" ON spreadsheet_cells
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM spreadsheet_rows sr
      JOIN spreadsheets s ON s.id = sr.spreadsheet_id
      WHERE sr.id = spreadsheet_cells.row_id 
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cells of their spreadsheets" ON spreadsheet_cells
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM spreadsheet_rows sr
      JOIN spreadsheets s ON s.id = sr.spreadsheet_id
      WHERE sr.id = spreadsheet_cells.row_id 
      AND s.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_spreadsheets_user_id ON spreadsheets(user_id);
CREATE INDEX IF NOT EXISTS idx_spreadsheet_columns_spreadsheet_id ON spreadsheet_columns(spreadsheet_id);
CREATE INDEX IF NOT EXISTS idx_spreadsheet_rows_spreadsheet_id ON spreadsheet_rows(spreadsheet_id);
CREATE INDEX IF NOT EXISTS idx_spreadsheet_cells_row_id ON spreadsheet_cells(row_id);
CREATE INDEX IF NOT EXISTS idx_spreadsheet_cells_column_id ON spreadsheet_cells(column_id);
