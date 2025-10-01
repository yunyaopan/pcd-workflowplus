import { Plus, Trash2 } from 'lucide-react';
import { CellRenderer } from './cell-renderer';
import type { InputTable } from '@/lib/types/logic-generator';

interface InputTableProps {
  table: InputTable;
  editingColumnId: number | null;
  setEditingColumnId: (id: number | null) => void;
  onUpdateTableName: (id: number, name: string) => void;
  onRemoveTable: (id: number) => void;
  onAddColumn: (tableId: number) => void;
  onRemoveColumn: (tableId: number, colId: number) => void;
  onUpdateColumnName: (tableId: number, colId: number, name: string) => void;
  onAddRow: (tableId: number) => void;
  onRemoveRow: (tableId: number, rowId: number) => void;
  onUpdateCell: (tableId: number, rowId: number, colId: number, value: unknown) => void;
}

export function InputTableComponent({
  table,
  editingColumnId,
  setEditingColumnId,
  onUpdateTableName,
  onRemoveTable,
  onAddColumn,
  onRemoveColumn,
  onUpdateColumnName,
  onAddRow,
  onRemoveRow,
  onUpdateCell,
}: InputTableProps) {
  return (
    <div className="border border-gray-200 rounded-lg bg-gray-50">
      {/* Table Header */}
      <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={table.name}
            onChange={(e) => onUpdateTableName(table.id, e.target.value)}
            className="text-lg font-semibold px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => onRemoveTable(table.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="w-12 px-2 py-2 text-center border-b border-r border-gray-200">#</th>
              {table.columns.map(col => (
                <th key={col.id} className="px-2 py-2 text-left border-b border-r border-gray-200 min-w-32">
                  <div className="flex items-center justify-between group">
                    <div className="flex-1">
                      {editingColumnId === col.id ? (
                        <input
                          type="text"
                          value={col.name}
                          onChange={(e) => onUpdateColumnName(table.id, col.id, e.target.value)}
                          onBlur={() => setEditingColumnId(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setEditingColumnId(null);
                          }}
                          autoFocus
                          className="font-semibold px-1 py-0 border border-blue-500 rounded focus:outline-none"
                        />
                      ) : (
                        <div 
                          onClick={() => setEditingColumnId(col.id)}
                          className="cursor-text"
                        >
                          <div className="font-semibold">{col.name}</div>
                          <div className="text-xs text-gray-500">{col.type}</div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onRemoveColumn(table.id, col.id)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-600 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </th>
              ))}
              <th className="px-2 py-2 border-b border-gray-200 relative">
                <button
                  onClick={() => onAddColumn(table.id)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
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
                      onUpdate={(value) => onUpdateCell(table.id, row.id as number, col.id, value)}
                    />
                  </td>
                ))}
                <td className="border-b border-gray-200 text-center">
                  <button
                    onClick={() => onRemoveRow(table.id, row.id as number)}
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
          onClick={() => onAddRow(table.id)}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium"
          disabled={table.columns.length === 0}
        >
          <Plus size={16} />
          Add Row
        </button>
      </div>
    </div>
  );
}
