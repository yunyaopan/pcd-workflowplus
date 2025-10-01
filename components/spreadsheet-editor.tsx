'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Settings, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { 
  SpreadsheetWithData, 
  SpreadsheetColumn, 
  SpreadsheetRow, 
  SpreadsheetCell,
  SpreadsheetRelationWithData,
  RelationOptions
} from '@/lib/database/types';

interface ColumnEditorProps {
  column?: SpreadsheetColumn | null;
  onClose: () => void;
  onSave: (data: { name: string; data_type: string; options?: string[] | RelationOptions }) => void;
  availableSpreadsheets?: Array<{ id: string; name: string }>;
}

function ColumnEditor({ column, onClose, onSave, availableSpreadsheets = [] }: ColumnEditorProps) {
  const [name, setName] = useState(column?.name || '');
  const [type, setType] = useState(column?.data_type || 'text');
  const [options, setOptions] = useState(
    Array.isArray(column?.options) ? column.options.join(', ') : ''
  );
  const [relationTargetSpreadsheet, setRelationTargetSpreadsheet] = useState(
    (column?.options as RelationOptions)?.target_spreadsheet_id || ''
  );

  const handleSave = () => {
    if (name.trim()) {
      let optionsData: string[] | RelationOptions | undefined;
      
      if (type === 'select') {
        optionsData = options.split(',').map((o: string) => o.trim()).filter((o: string) => o);
      } else if (type === 'relation') {
        optionsData = {
          target_spreadsheet_id: relationTargetSpreadsheet
        };
      }
      
      onSave({
        name: name.trim(),
        data_type: type,
        ...(optionsData && { options: optionsData })
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{column ? 'Edit Column' : 'Add Column'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Column Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter column name"
            />
          </div>
          
          <div>
            <Label htmlFor="type">Data Type</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'relation')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="select">Dropdown</option>
              <option value="checkbox">Checkbox</option>
              <option value="relation">Relation</option>
            </select>
          </div>
          
          {type === 'select' && (
            <div>
              <Label htmlFor="options">Options (comma-separated)</Label>
              <Input
                id="options"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Option1, Option2, Option3"
              />
            </div>
          )}
          
          {type === 'relation' && (
            <div>
              <Label htmlFor="targetSpreadsheet">Target Spreadsheet</Label>
              <select
                id="targetSpreadsheet"
                value={relationTargetSpreadsheet}
                onChange={(e) => setRelationTargetSpreadsheet(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a spreadsheet...</option>
                {availableSpreadsheets.map(spreadsheet => (
                  <option key={spreadsheet.id} value={spreadsheet.id}>
                    {spreadsheet.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-6">
          <Button onClick={handleSave} className="flex-1">
            Save
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

interface RelationCellProps {
  column: SpreadsheetColumn;
  relations: SpreadsheetRelationWithData[];
  onUpdate: (relatedRowIds: string[]) => void;
  availableSpreadsheets: Array<{ id: string; name: string }>;
}

function RelationCell({ column, relations, onUpdate, availableSpreadsheets }: RelationCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableRows, setAvailableRows] = useState<Array<{ id: string; row_order: number; first_column_value?: string }>>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const relationOptions = column.options as RelationOptions;
  const targetSpreadsheet = availableSpreadsheets.find(s => s.id === relationOptions?.target_spreadsheet_id);

  const fetchAvailableRows = useCallback(async () => {
    try {
      const response = await fetch(`/api/spreadsheets/${relationOptions.target_spreadsheet_id}/available-rows`);
      if (response.ok) {
        const rows = await response.json();
        setAvailableRows(rows);
      }
    } catch (error) {
      console.error('Error fetching available rows:', error);
    }
  }, [relationOptions.target_spreadsheet_id]);

  useEffect(() => {
    if (isOpen && relationOptions?.target_spreadsheet_id) {
      fetchAvailableRows();
    }
  }, [isOpen, relationOptions?.target_spreadsheet_id, fetchAvailableRows]);

  useEffect(() => {
    setSelectedRows(relations.map(r => r.related_row_id));
  }, [relations]);

  const handleSave = () => {
    onUpdate(selectedRows);
    setIsOpen(false);
  };

  const toggleRow = (rowId: string) => {
    setSelectedRows(prev => 
      prev.includes(rowId) 
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId]
    );
  };

  if (!targetSpreadsheet) {
    return <div className="text-gray-400 text-sm">No target spreadsheet</div>;
  }

  // Get the display text for related rows
  const getRelatedRowsDisplay = () => {
    if (relations.length === 0) return 'Select...';
    
    const relatedRowValues = relations
      .map(relation => {
        if (relation.related_row?.cells?.[0]?.value) {
          return relation.related_row.cells[0].value;
        }
        return `Row ${relation.related_row?.row_order ? relation.related_row.row_order + 1 : '?'}`;
      })
      .join(', ');
    
    return relatedRowValues.length > 50 
      ? `${relatedRowValues.substring(0, 50)}...` 
      : relatedRowValues;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-2 py-1 text-left border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white hover:bg-gray-50"
        title={relations.length > 0 ? relations.map(r => r.related_row?.cells?.[0]?.value || `Row ${r.related_row?.row_order ? r.related_row.row_order + 1 : '?'}`).join(', ') : ''}
      >
        {getRelatedRowsDisplay()}
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl max-h-96 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select from {targetSpreadsheet.name}</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
              {availableRows.map(row => (
                <label key={row.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={() => toggleRow(row.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{row.first_column_value || `Row ${row.row_order + 1}`}</span>
                </label>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SpreadsheetEditorProps {
  spreadsheetId: string;
}

export function SpreadsheetEditor({ spreadsheetId }: SpreadsheetEditorProps) {
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetWithData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingColumn, setEditingColumn] = useState<SpreadsheetColumn | null>(null);
  const [showColumnEditor, setShowColumnEditor] = useState(false);
  const [availableSpreadsheets, setAvailableSpreadsheets] = useState<Array<{ id: string; name: string }>>([]);

  const fetchAvailableSpreadsheets = useCallback(async () => {
    try {
      const response = await fetch('/api/spreadsheets');
      if (response.ok) {
        const spreadsheets = await response.json();
        // Filter out the current spreadsheet
        const filtered = spreadsheets.filter((s: { id: string }) => s.id !== spreadsheetId);
        setAvailableSpreadsheets(filtered);
      }
    } catch (error) {
      console.error('Error fetching available spreadsheets:', error);
    }
  }, [spreadsheetId]);

  const fetchSpreadsheet = useCallback(async () => {
    try {
      const response = await fetch(`/api/spreadsheets/${spreadsheetId}/data`);
      if (response.ok) {
        const data = await response.json();
        setSpreadsheet(data);
      }
    } catch (error) {
      console.error('Error fetching spreadsheet:', error);
    } finally {
      setLoading(false);
    }
  }, [spreadsheetId]);

  useEffect(() => {
    fetchSpreadsheet();
    fetchAvailableSpreadsheets();
  }, [fetchSpreadsheet, fetchAvailableSpreadsheets]);

  const handleAddColumn = async (data: { name: string; data_type: string; options?: string[] | RelationOptions }) => {
    try {
      const response = await fetch(`/api/spreadsheets/${spreadsheetId}/columns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchSpreadsheet(); // Refresh data
      }
    } catch (error) {
      console.error('Error creating column:', error);
    }
  };

  const handleUpdateColumn = async (columnId: string, data: { name: string; data_type: string; options?: string[] | RelationOptions }) => {
    try {
      const response = await fetch(`/api/spreadsheets/${spreadsheetId}/columns/${columnId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchSpreadsheet(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating column:', error);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!confirm('Are you sure you want to delete this column?')) {
      return;
    }

    try {
      const response = await fetch(`/api/spreadsheets/${spreadsheetId}/columns/${columnId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchSpreadsheet(); // Refresh data
      }
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  };

  const handleAddRow = async () => {
    try {
      const response = await fetch(`/api/spreadsheets/${spreadsheetId}/rows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        await fetchSpreadsheet(); // Refresh data
      }
    } catch (error) {
      console.error('Error creating row:', error);
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    if (!confirm('Are you sure you want to delete this row?')) {
      return;
    }

    try {
      const response = await fetch(`/api/spreadsheets/${spreadsheetId}/rows/${rowId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchSpreadsheet(); // Refresh data
      }
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };

  const handleUpdateRelation = async (rowId: string, columnId: string, relatedRowIds: string[]) => {
    try {
      const response = await fetch(`/api/spreadsheets/${spreadsheetId}/relations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rowId, columnId, relatedRowIds }),
      });

      if (response.ok) {
        await fetchSpreadsheet();
      }
    } catch (error) {
      console.error('Error updating relation:', error);
    }
  };

  const handleUpdateCell = async (rowId: string, columnId: string, value: string) => {
    try {
      const response = await fetch(`/api/spreadsheets/${spreadsheetId}/cells`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rowId, columnId, value }),
      });

      if (response.ok) {
        // Refresh the spreadsheet data to get the updated value
        await fetchSpreadsheet();
      }
    } catch (error) {
      console.error('Error updating cell:', error);
    }
  };

  const renderCell = (row: SpreadsheetRow & { cells: SpreadsheetCell[]; relations: SpreadsheetRelationWithData[] }, col: SpreadsheetColumn) => {
    const cell = row.cells.find(c => c.column_id === col.id);
    const value = cell?.value || '';
    const relations = row.relations.filter(r => r.column_id === col.id);
    
    switch(col.data_type) {
      case 'text':
        return (
          <input
            type="text"
            defaultValue={value}
            onBlur={(e) => handleUpdateCell(row.id, col.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            defaultValue={value}
            onBlur={(e) => handleUpdateCell(row.id, col.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );
      case 'date':
        return (
          <input
            type="date"
            defaultValue={value}
            onBlur={(e) => handleUpdateCell(row.id, col.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleUpdateCell(row.id, col.id, e.target.value)}
            className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="">Select...</option>
            {Array.isArray(col.options) && col.options.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value === 'true'}
            onChange={(e) => handleUpdateCell(row.id, col.id, e.target.checked.toString())}
            className="ml-2"
          />
        );
      case 'relation':
        return (
          <RelationCell
            column={col}
            relations={relations}
            onUpdate={(relatedRowIds) => handleUpdateRelation(row.id, col.id, relatedRowIds)}
            availableSpreadsheets={availableSpreadsheets}
          />
        );
      default:
        return (
          <input
            type="text"
            defaultValue={value}
            onBlur={(e) => handleUpdateCell(row.id, col.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading spreadsheet...</div>
      </div>
    );
  }

  if (!spreadsheet) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Spreadsheet not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/spreadsheets'}
            className="mb-4"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Spreadsheets
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{spreadsheet.name}</h1>
          {spreadsheet.description && (
            <p className="text-gray-600 mt-1">{spreadsheet.description}</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="w-12 px-4 py-3 text-left border-b border-r border-gray-200"></th>
                  {spreadsheet.columns.map(col => (
                    <th key={col.id} className="px-4 py-3 text-left border-b border-r border-gray-200 min-w-48">
                      <div className="flex items-center justify-between group">
                        <div>
                          <div className="font-semibold text-gray-900">{col.name}</div>
                          <div className="text-xs text-gray-500">{col.data_type}</div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingColumn(col);
                              setShowColumnEditor(true);
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Settings size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteColumn(col.id)}
                            className="p-1 hover:bg-red-100 text-red-600 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 border-b border-gray-200">
                    <button
                      onClick={() => {
                        setEditingColumn(null);
                        setShowColumnEditor(true);
                      }}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Plus size={18} />
                      Add Column
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {spreadsheet.rows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b border-r border-gray-200 text-center text-gray-500">
                      <div className="flex items-center justify-between">
                        <span>{idx + 1}</span>
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="opacity-0 hover:opacity-100 p-1 hover:bg-red-100 text-red-600 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                    {spreadsheet.columns.map(col => (
                      <td key={col.id} className="border-b border-r border-gray-200">
                        {renderCell(row, col)}
                      </td>
                    ))}
                    <td className="border-b border-gray-200"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4">
            <button
              onClick={handleAddRow}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              <Plus size={18} />
              Add Row
            </button>
          </div>
        </div>
      </div>
      
      {showColumnEditor && (
        <ColumnEditor
          column={editingColumn}
          availableSpreadsheets={availableSpreadsheets}
          onClose={() => {
            setShowColumnEditor(false);
            setEditingColumn(null);
          }}
          onSave={(data) => {
            if (editingColumn) {
              handleUpdateColumn(editingColumn.id, data);
            } else {
              handleAddColumn(data);
            }
            setShowColumnEditor(false);
            setEditingColumn(null);
          }}
        />
      )}
    </div>
  );
}
