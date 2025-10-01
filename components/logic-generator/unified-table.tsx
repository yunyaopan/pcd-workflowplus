import { Plus, Trash2, Edit3 } from 'lucide-react';
import { CellRenderer } from './cell-renderer';
import { ColumnTypeSelector } from './column-type-selector';
import type { InputTable, OutputTable, Column, DataType, ColumnMenuPosition } from '@/lib/types/logic-generator';

interface UnifiedTableProps {
  // Common props
  isOutput: boolean;
  editingColumnId: number | null;
  setEditingColumnId: (id: number | null) => void;
  
  // Input table specific props
  inputTable?: InputTable;
  onUpdateInputTableName?: (id: number, name: string) => void;
  onRemoveInputTable?: (id: number) => void;
  onAddInputColumn?: (tableId: number, event?: React.MouseEvent) => void;
  onRemoveInputColumn?: (tableId: number, colId: number) => void;
  onUpdateInputColumnName?: (tableId: number, colId: number, name: string) => void;
  onAddInputRow?: (tableId: number) => void;
  onRemoveInputRow?: (tableId: number, rowId: number) => void;
  onUpdateInputCell?: (tableId: number, rowId: number, colId: number, value: unknown) => void;
  
  // Output table specific props
  outputTable?: OutputTable;
  onUpdateOutputTableName?: (name: string) => void;
  onUpdateBaseLogic?: (logic: string) => void;
  onAddOutputColumn?: (event?: React.MouseEvent) => void;
  onRemoveOutputColumn?: (colId: number) => void;
  onUpdateOutputColumnName?: (colId: number, name: string) => void;
  onAddOutputRow?: () => void;
  onRemoveOutputRow?: (rowId: number) => void;
  onUpdateOutputCell?: (rowId: number, colId: number, value: unknown) => void;
  
  // Column type selector props
  showColumnTypeSelector: boolean;
  columnTypeSelectorPosition: ColumnMenuPosition;
  newColumnType: DataType;
  setNewColumnType: (type: DataType) => void;
  newColumnOptions: string;
  setNewColumnOptions: (options: string) => void;
  newColumnLogic: string;
  setNewColumnLogic: (logic: string) => void;
  onAddColumnWithType: () => void;
  onCloseColumnTypeSelector: () => void;
  
  // Column editing props
  editingColumnType: boolean;
  setEditingColumnType: (editing: boolean) => void;
  editingColumnData: {
    id: number;
    type: DataType;
    logic?: string;
    options?: string[];
  } | null;
  setEditingColumnData: (data: any) => void;
  onUpdateInputColumnType?: (tableId: number, colId: number, type: DataType, options?: string[]) => void;
  onUpdateOutputColumnType?: (colId: number, type: DataType, logic?: string, options?: string[]) => void;
}

export function UnifiedTableComponent({
  isOutput,
  editingColumnId,
  setEditingColumnId,
  
  // Input table props
  inputTable,
  onUpdateInputTableName,
  onRemoveInputTable,
  onAddInputColumn,
  onRemoveInputColumn,
  onUpdateInputColumnName,
  onAddInputRow,
  onRemoveInputRow,
  onUpdateInputCell,
  
  // Output table props
  outputTable,
  onUpdateOutputTableName,
  onUpdateBaseLogic,
  onAddOutputColumn,
  onRemoveOutputColumn,
  onUpdateOutputColumnName,
  onAddOutputRow,
  onRemoveOutputRow,
  onUpdateOutputCell,
  
  // Column type selector props
  showColumnTypeSelector,
  columnTypeSelectorPosition,
  newColumnType,
  setNewColumnType,
  newColumnOptions,
  setNewColumnOptions,
  newColumnLogic,
  setNewColumnLogic,
  onAddColumnWithType,
  onCloseColumnTypeSelector,
  
  // Column editing props
  editingColumnType,
  setEditingColumnType,
  editingColumnData,
  setEditingColumnData,
  onUpdateInputColumnType,
  onUpdateOutputColumnType,
}: UnifiedTableProps) {
  const table = isOutput ? outputTable : inputTable;
  if (!table) return null;

  const handleColumnTypeEdit = (col: Column) => {
    setEditingColumnData({
      id: col.id,
      type: col.type,
      logic: col.logic,
      options: col.options,
    });
    setEditingColumnType(true);
  };

  const handleColumnTypeUpdate = () => {
    if (editingColumnData) {
      if (isOutput) {
        onUpdateOutputColumnType?.(
          editingColumnData.id,
          editingColumnData.type,
          editingColumnData.logic,
          editingColumnData.options
        );
      } else {
        onUpdateInputColumnType?.(
          inputTable?.id || 0,
          editingColumnData.id,
          editingColumnData.type,
          editingColumnData.options
        );
      }
      setEditingColumnType(false);
      setEditingColumnData(null);
    }
  };

  const getColumnTypeIcon = (type: DataType) => {
    switch (type) {
      case 'text': return '≡';
      case 'number': return '#';
      case 'boolean': return '☐';
      case 'date': return '📅';
      case 'select': return '◉';
      default: return '?';
    }
  };

  return (
    <div className={`${isOutput ? 'bg-white rounded-lg shadow-lg p-6' : 'border border-gray-200 rounded-lg bg-gray-50'}`}>
      {isOutput && (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Output Table</h2>
          
          <input
            type="text"
            placeholder="Output table name"
            value={outputTable?.name || ''}
            onChange={(e) => onUpdateOutputTableName?.(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What constitutes the output list?
            </label>
            <textarea
              placeholder="Describe in natural language what rows should be in the output (e.g., 'same as Input Table')"
              value={outputTable?.baseLogic || ''}
              onChange={(e) => onUpdateBaseLogic?.(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </>
      )}

      {/* Table Header */}
      {!isOutput && (
        <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={inputTable?.name || ''}
              onChange={(e) => onUpdateInputTableName?.(inputTable?.id || 0, e.target.value)}
              className="text-lg font-semibold px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => onRemoveInputTable?.(inputTable?.id || 0)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className={`${isOutput ? 'border border-gray-200 rounded-lg bg-gray-50' : ''}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className={`${isOutput ? 'bg-purple-100' : 'bg-gray-100'}`}>
                <th className="w-12 px-2 py-2 text-center border-b border-r border-gray-200">#</th>
                {table.columns.map(col => (
                  <th key={col.id} className="px-2 py-2 text-left border-b border-r border-gray-200 min-w-32">
                    <div className="flex items-center justify-between group">
                      <div className="flex-1">
                        {editingColumnId === col.id ? (
                          <input
                            type="text"
                            value={col.name}
                            onChange={(e) => {
                              if (isOutput) {
                                onUpdateOutputColumnName?.(col.id, e.target.value);
                              } else {
                                onUpdateInputColumnName?.(inputTable?.id || 0, col.id, e.target.value);
                              }
                            }}
                            onBlur={() => setEditingColumnId(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setEditingColumnId(null);
                            }}
                            autoFocus
                            className={`font-semibold px-1 py-0 border ${isOutput ? 'border-purple-500' : 'border-blue-500'} rounded focus:outline-none`}
                          />
                        ) : (
                          <div 
                            onClick={() => setEditingColumnId(col.id)}
                            className="cursor-text"
                          >
                            <div className="font-semibold">{col.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <span>{getColumnTypeIcon(col.type)}</span>
                              {col.type}
                              {isOutput && col.logic && (
                                <span className="text-gray-400">•</span>
                              )}
                            </div>
                            {isOutput && col.logic && (
                              <div className="text-xs text-gray-400 truncate max-w-32" title={col.logic}>
                                {col.logic}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleColumnTypeEdit(col)}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-blue-100 text-blue-600 rounded"
                          title="Edit column type"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (isOutput) {
                              onRemoveOutputColumn?.(col.id);
                            } else {
                              onRemoveInputColumn?.(inputTable?.id || 0, col.id);
                            }
                          }}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-600 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
                <th className="px-2 py-2 border-b border-gray-200 relative">
                  <button
                    onClick={(e) => {
                      if (isOutput) {
                        onAddOutputColumn?.(e);
                      } else {
                        onAddInputColumn?.(inputTable?.id || 0, e);
                      }
                    }}
                    className={`flex items-center gap-1 ${isOutput ? 'text-purple-600 hover:text-purple-700' : 'text-blue-600 hover:text-blue-700'} text-sm font-medium`}
                  >
                    <Plus size={16} />
                    Column
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, idx) => (
                <tr key={row.id as React.Key} className="hover:bg-gray-50">
                  <td className="px-2 py-1 border-b border-r border-gray-200 text-center text-sm text-gray-500">
                    {idx + 1}
                  </td>
                  {table.columns.map(col => (
                    <td key={col.id} className="border-b border-r border-gray-200">
                      <CellRenderer
                        row={row}
                        col={col}
                        tableId={isOutput ? null : inputTable?.id}
                        isOutput={isOutput}
                        onUpdate={(value) => {
                          if (isOutput) {
                            onUpdateOutputCell?.(row.id as number, col.id, value);
                          } else {
                            onUpdateInputCell?.(inputTable?.id || 0, row.id as number, col.id, value);
                          }
                        }}
                      />
                    </td>
                  ))}
                  <td className="border-b border-gray-200 text-center">
                    <button
                      onClick={() => {
                        if (isOutput) {
                          onRemoveOutputRow?.(row.id as number);
                        } else {
                          onRemoveInputRow?.(inputTable?.id || 0, row.id as number);
                        }
                      }}
                      className="p-1 hover:bg-red-100 text-red-600 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row Button */}
        <div className="p-3">
          <button
            onClick={() => {
              if (isOutput) {
                onAddOutputRow?.();
              } else {
                onAddInputRow?.(inputTable?.id || 0);
              }
            }}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium"
            disabled={table.columns.length === 0}
          >
            <Plus size={16} />
            Add Row
          </button>
        </div>
      </div>

      {/* Column Type Selector */}
      {showColumnTypeSelector && (
        <ColumnTypeSelector
          isOutput={isOutput}
          onAdd={onAddColumnWithType}
          onClose={onCloseColumnTypeSelector}
          position={columnTypeSelectorPosition}
          newColumnType={newColumnType}
          setNewColumnType={setNewColumnType}
          newColumnOptions={newColumnOptions}
          setNewColumnOptions={setNewColumnOptions}
          newColumnLogic={newColumnLogic}
          setNewColumnLogic={setNewColumnLogic}
        />
      )}

      {/* Column Type Edit Modal */}
      {editingColumnType && editingColumnData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Column Type</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Property type</label>
              <div className="grid grid-cols-2 gap-2">
                {(['text', 'number', 'boolean', 'date', 'select'] as DataType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setEditingColumnData({...editingColumnData, type})}
                    className={`px-3 py-2 text-sm rounded-md text-left flex items-center gap-2 ${
                      editingColumnData.type === type 
                        ? 'bg-blue-100 border-2 border-blue-500' 
                        : 'bg-gray-50 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-gray-600">{getColumnTypeIcon(type)}</span>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {editingColumnData.type === 'select' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                <input
                  type="text"
                  placeholder="Option1, Option2, Option3"
                  value={editingColumnData.options?.join(', ') || ''}
                  onChange={(e) => setEditingColumnData({
                    ...editingColumnData,
                    options: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {isOutput && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How to generate this column&apos;s value?
                </label>
                <textarea
                  placeholder="Describe in natural language how to calculate or derive this column&apos;s value"
                  value={editingColumnData.logic || ''}
                  onChange={(e) => setEditingColumnData({...editingColumnData, logic: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setEditingColumnType(false);
                  setEditingColumnData(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleColumnTypeUpdate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
