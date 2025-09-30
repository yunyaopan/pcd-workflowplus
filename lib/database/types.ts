export interface Spreadsheet {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface SpreadsheetColumn {
  id: string;
  spreadsheet_id: string;
  name: string;
  data_type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  options?: string[];
  column_order: number;
  created_at: string;
  updated_at: string;
}

export interface SpreadsheetRow {
  id: string;
  spreadsheet_id: string;
  row_order: number;
  created_at: string;
  updated_at: string;
}

export interface SpreadsheetCell {
  id: string;
  row_id: string;
  column_id: string;
  value?: string;
  created_at: string;
  updated_at: string;
}

export interface SpreadsheetWithColumns extends Spreadsheet {
  columns: SpreadsheetColumn[];
}

export interface SpreadsheetWithData extends Spreadsheet {
  columns: SpreadsheetColumn[];
  rows: (SpreadsheetRow & { cells: SpreadsheetCell[] })[];
}

export interface CreateSpreadsheetRequest {
  name: string;
  description?: string;
}

export interface UpdateSpreadsheetRequest {
  name?: string;
  description?: string;
}

export interface CreateColumnRequest {
  name: string;
  data_type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  options?: string[];
  column_order?: number;
}

export interface UpdateColumnRequest {
  name?: string;
  data_type?: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  options?: string[];
  column_order?: number;
}

export interface CreateRowRequest {
  row_order?: number;
}

export interface UpdateCellRequest {
  value?: string;
}
