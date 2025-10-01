import { Plus, Trash2, Brain } from 'lucide-react';
import { CellRenderer } from './cell-renderer';
import type { OutputTable, Column } from '@/lib/types/logic-generator';

interface OutputTableProps {
  outputTable: OutputTable;
  editingColumnId: number | null;
  setEditingColumnId: (id: number | null) => void;
  onUpdateTableName: (name: string) => void;
  onUpdateBaseLogic: (logic: string) => void;
  onAddColumn: () => void;
  onRemoveColumn: (colId: number) => void;
  onUpdateColumnName: (colId: number, name: string) => void;
  onToggleColumnLLM: (colId: number) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: number) => void;
  onUpdateCell: (rowId: number, colId: number, value: unknown) => void;
}

export function OutputTableComponent({
  outputTable,
  editingColumnId,
  setEditingColumnId,
  onUpdateTableName,
  onUpdateBaseLogic,
  onAddColumn,
  onRemoveColumn,
  onUpdateColumnName,
  onToggleColumnLLM,
  onAddRow,
  onRemoveRow,
  onUpdateCell,
}: OutputTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Output Table</h2>

      <input
        type="text"
        placeholder="Output table name"
        value={outputTable.name}
        onChange={(e) => onUpdateTableName(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          What constitutes the output list?
        </label>
        <textarea
          placeholder="Describe in natural language what rows should be in the output (e.g., 'same as Input Table')"
          value={outputTable.baseLogic}
          onChange={(e) => onUpdateBaseLogic(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* Output Data Table */}
      <div className="border border-gray-200 rounded-lg bg-gray-50">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-purple-100">
                <th className="w-12 px-2 py-2 text-center border-b border-r border-gray-200">#</th>
                {outputTable.columns.map(col => (
                  <th key={col.id} className="px-2 py-2 text-left border-b border-r border-gray-200 min-w-32">
                    <div className="flex items-center justify-between group">
                      <div className="flex-1">
                        {editingColumnId === col.id ? (
                          <input
                            type="text"
                            value={col.name}
                            onChange={(e) => onUpdateColumnName(col.id, e.target.value)}
                            onBlur={() => setEditingColumnId(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setEditingColumnId(null);
                            }}
                            autoFocus
                            className="font-semibold px-1 py-0 border border-purple-500 rounded focus:outline-none"
                          />
                        ) : (
                          <div 
                            onClick={() => setEditingColumnId(col.id)}
                            className="cursor-text"
                          >
                            <div className="font-semibold flex items-center gap-2">
                              {col.name}
                              {col.isLLM && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                  LLM
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{col.type}</div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onToggleColumnLLM(col.id)}
                          className={`p-1 opacity-0 group-hover:opacity-100 rounded ${
                            col.isLLM 
                              ? 'bg-purple-100 text-purple-600' 
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                          title={col.isLLM ? 'Mark as deterministic' : 'Mark as LLM-generated'}
                        >
                          <Brain size={14} />
                        </button>
                        <button
                          onClick={() => onRemoveColumn(col.id)}
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
                    onClick={onAddColumn}
                    className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    <Plus size={16} />
                    Column
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {outputTable.rows.map((row, idx) => (
                <tr key={row.id as React.Key} className="hover:bg-gray-50">
                  <td className="px-2 py-1 border-b border-r border-gray-200 text-center text-sm text-gray-500">
                    {idx + 1}
                  </td>
                  {outputTable.columns.map(col => (
                    <td key={col.id} className="border-b border-r border-gray-200">
                      <CellRenderer
                        row={row}
                        col={col}
                        tableId={null}
                        isOutput={true}
                        onUpdate={(value) => onUpdateCell(row.id as number, col.id, value)}
                      />
                    </td>
                  ))}
                  <td className="border-b border-gray-200 text-center">
                    <button
                      onClick={() => onRemoveRow(row.id as number)}
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
            onClick={onAddRow}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium"
            disabled={outputTable.columns.length === 0}
          >
            <Plus size={16} />
            Add Row
          </button>
        </div>
      </div>
    </div>
  );
}
