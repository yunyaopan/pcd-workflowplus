import { createClient } from '@/lib/supabase/server';
import type {
  Spreadsheet,
  SpreadsheetColumn,
  SpreadsheetRow,
  SpreadsheetCell,
  SpreadsheetWithColumns,
  SpreadsheetWithData,
  CreateSpreadsheetRequest,
  UpdateSpreadsheetRequest,
  CreateColumnRequest,
  UpdateColumnRequest,
  CreateRowRequest,
  UpdateCellRequest,
} from './types';

export class DatabaseClient {
  private async getSupabase() {
    return await createClient();
  }

  // Spreadsheet operations
  async getSpreadsheets(): Promise<Spreadsheet[]> {
    const supabase = await this.getSupabase();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('spreadsheets')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getSpreadsheet(id: string): Promise<Spreadsheet | null> {
    const supabase = await this.getSupabase();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('spreadsheets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  }

  async createSpreadsheet(request: CreateSpreadsheetRequest): Promise<Spreadsheet> {
    const supabase = await this.getSupabase();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('spreadsheets')
      .insert([{ ...request, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSpreadsheet(id: string, request: UpdateSpreadsheetRequest): Promise<Spreadsheet> {
    const supabase = await this.getSupabase();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('spreadsheets')
      .update(request)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSpreadsheet(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('spreadsheets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // Column operations
  async getSpreadsheetColumns(spreadsheetId: string): Promise<SpreadsheetColumn[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('spreadsheet_columns')
      .select('*')
      .eq('spreadsheet_id', spreadsheetId)
      .order('column_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getSpreadsheetWithColumns(id: string): Promise<SpreadsheetWithColumns | null> {
    const supabase = await this.getSupabase();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('spreadsheets')
      .select(`
        *,
        columns:spreadsheet_columns(*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  }

  async createColumn(spreadsheetId: string, request: CreateColumnRequest): Promise<SpreadsheetColumn> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('spreadsheet_columns')
      .insert([{ ...request, spreadsheet_id: spreadsheetId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateColumn(id: string, request: UpdateColumnRequest): Promise<SpreadsheetColumn> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('spreadsheet_columns')
      .update(request)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteColumn(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('spreadsheet_columns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Row operations
  async getSpreadsheetRows(spreadsheetId: string): Promise<SpreadsheetRow[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('spreadsheet_rows')
      .select('*')
      .eq('spreadsheet_id', spreadsheetId)
      .order('row_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createRow(spreadsheetId: string, request: CreateRowRequest = {}): Promise<SpreadsheetRow> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('spreadsheet_rows')
      .insert([{ ...request, spreadsheet_id: spreadsheetId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteRow(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('spreadsheet_rows')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Cell operations
  async getSpreadsheetCells(rowId: string): Promise<SpreadsheetCell[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('spreadsheet_cells')
      .select('*')
      .eq('row_id', rowId);

    if (error) throw error;
    return data || [];
  }

  async getSpreadsheetWithData(id: string): Promise<SpreadsheetWithData | null> {
    const supabase = await this.getSupabase();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }
    
    // Get spreadsheet with columns
    const { data: spreadsheetData, error: spreadsheetError } = await supabase
      .from('spreadsheets')
      .select(`
        *,
        columns:spreadsheet_columns(*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (spreadsheetError) throw spreadsheetError;
    if (!spreadsheetData) return null;

    // Get rows with cells
    const { data: rowsData, error: rowsError } = await supabase
      .from('spreadsheet_rows')
      .select(`
        *,
        cells:spreadsheet_cells(*)
      `)
      .eq('spreadsheet_id', id)
      .order('row_order', { ascending: true });

    if (rowsError) throw rowsError;

    return {
      ...spreadsheetData,
      rows: rowsData || [],
    };
  }

  async upsertCell(rowId: string, columnId: string, request: UpdateCellRequest): Promise<SpreadsheetCell> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from('spreadsheet_cells')
      .upsert(
        { row_id: rowId, column_id: columnId, value: request.value },
        { 
          onConflict: 'row_id,column_id',
          ignoreDuplicates: false 
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCell(rowId: string, columnId: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('spreadsheet_cells')
      .delete()
      .eq('row_id', rowId)
      .eq('column_id', columnId);

    if (error) throw error;
  }
}

export const db = new DatabaseClient();
