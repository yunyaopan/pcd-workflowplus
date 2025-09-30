import { db } from '@/lib/database/client';
import type {
  CreateSpreadsheetRequest,
  UpdateSpreadsheetRequest,
  CreateColumnRequest,
  UpdateColumnRequest,
  CreateRowRequest,
  UpdateCellRequest,
  UpdateRelationRequest,
} from '@/lib/database/types';

export const spreadsheetApi = {
  // Spreadsheet operations
  async getSpreadsheets() {
    return await db.getSpreadsheets();
  },

  async getSpreadsheet(id: string) {
    return await db.getSpreadsheet(id);
  },

  async getSpreadsheetWithColumns(id: string) {
    return await db.getSpreadsheetWithColumns(id);
  },

  async getSpreadsheetWithData(id: string) {
    return await db.getSpreadsheetWithData(id);
  },

  async createSpreadsheet(request: CreateSpreadsheetRequest) {
    return await db.createSpreadsheet(request);
  },

  async updateSpreadsheet(id: string, request: UpdateSpreadsheetRequest) {
    return await db.updateSpreadsheet(id, request);
  },

  async deleteSpreadsheet(id: string) {
    return await db.deleteSpreadsheet(id);
  },

  // Column operations
  async getColumns(spreadsheetId: string) {
    return await db.getSpreadsheetColumns(spreadsheetId);
  },

  async createColumn(spreadsheetId: string, request: CreateColumnRequest) {
    return await db.createColumn(spreadsheetId, request);
  },

  async updateColumn(id: string, request: UpdateColumnRequest) {
    return await db.updateColumn(id, request);
  },

  async deleteColumn(id: string) {
    return await db.deleteColumn(id);
  },

  // Row operations
  async getRows(spreadsheetId: string) {
    return await db.getSpreadsheetRows(spreadsheetId);
  },

  async createRow(spreadsheetId: string, request: CreateRowRequest = {}) {
    return await db.createRow(spreadsheetId, request);
  },

  async deleteRow(id: string) {
    return await db.deleteRow(id);
  },

  // Cell operations
  async upsertCell(rowId: string, columnId: string, request: UpdateCellRequest) {
    return await db.upsertCell(rowId, columnId, request);
  },

  async deleteCell(rowId: string, columnId: string) {
    return await db.deleteCell(rowId, columnId);
  },

  // Relation operations
  async upsertRelations(rowId: string, columnId: string, request: UpdateRelationRequest) {
    return await db.upsertRelations(rowId, columnId, request);
  },

  async getRelatedRows(rowId: string, columnId: string) {
    return await db.getRelatedRows(rowId, columnId);
  },

  async getAvailableRowsForRelation(targetSpreadsheetId: string, excludeRowId?: string) {
    return await db.getAvailableRowsForRelation(targetSpreadsheetId, excludeRowId);
  },
};
