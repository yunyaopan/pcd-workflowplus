import type { Column } from '@/lib/types/logic-generator';

interface CellRendererProps {
  row: Record<string, unknown>;
  col: Column;
  tableId: number | null;
  isOutput: boolean;
  onUpdate: (value: unknown) => void;
}

export function CellRenderer({ row, col, tableId, isOutput, onUpdate }: CellRendererProps) {
  const value = row[col.id];
  
  switch(col.type) {
    case 'text':
      return (
        <input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => onUpdate(e.target.value)}
          className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      );
    case 'number':
      return (
        <input
          type="number"
          value={(value as string) || ''}
          onChange={(e) => onUpdate(e.target.value)}
          className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      );
    case 'date':
      return (
        <input
          type="date"
          value={(value as string) || ''}
          onChange={(e) => onUpdate(e.target.value)}
          className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      );
    case 'select':
      return (
        <select
          value={(value as string) || ''}
          onChange={(e) => onUpdate(e.target.value)}
          className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
        >
          <option value="">Select...</option>
          {col.options?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    case 'boolean':
      return (
        <input
          type="checkbox"
          checked={(value as boolean) || false}
          onChange={(e) => onUpdate(e.target.checked)}
          className="ml-2"
        />
      );
    default:
      return (
        <input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => onUpdate(e.target.value)}
          className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      );
  }
}
