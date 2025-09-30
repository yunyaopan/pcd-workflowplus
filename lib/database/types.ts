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
  data_type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'relation';
  options?: string[] | RelationOptions;
  column_order: number;
  created_at: string;
  updated_at: string;
}

export interface RelationOptions {
  target_spreadsheet_id: string;
  target_column_id?: string; // Optional: which column to display from target
  display_property?: string; // Optional: which property to show
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

export interface SpreadsheetRelation {
  id: string;
  row_id: string;
  column_id: string;
  related_row_id: string;
  created_at: string;
  updated_at: string;
}

export interface SpreadsheetRelationWithData extends SpreadsheetRelation {
  related_row?: {
    id: string;
    row_order: number;
    cells: SpreadsheetCell[];
  };
}

export interface SpreadsheetWithColumns extends Spreadsheet {
  columns: SpreadsheetColumn[];
}

export interface SpreadsheetWithData extends Spreadsheet {
  columns: SpreadsheetColumn[];
  rows: (SpreadsheetRow & { cells: SpreadsheetCell[]; relations: SpreadsheetRelationWithData[] })[];
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
  data_type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'relation';
  options?: string[] | RelationOptions;
  column_order?: number;
}

export interface UpdateColumnRequest {
  name?: string;
  data_type?: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'relation';
  options?: string[] | RelationOptions;
  column_order?: number;
}

export interface CreateRowRequest {
  row_order?: number;
}

export interface UpdateCellRequest {
  value?: string;
}

export interface UpdateRelationRequest {
  relatedRowIds: string[];
}
