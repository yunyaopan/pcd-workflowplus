import { Plus, Trash2 } from 'lucide-react';
import { DATA_TYPES } from '@/lib/types/logic-generator';
import type { InputParam } from '@/lib/types/logic-generator';

interface InputParametersProps {
  inputParams: InputParam[];
  onAddParam: () => void;
  onRemoveParam: (id: number) => void;
  onUpdateParam: (id: number, field: string, value: string) => void;
}

export function InputParameters({
  inputParams,
  onAddParam,
  onRemoveParam,
  onUpdateParam,
}: InputParametersProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Input Parameters</h2>
        <button
          onClick={onAddParam}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Plus size={20} />
          Add Parameter
        </button>
      </div>

      <div className="space-y-3">
        {inputParams.map(param => (
          <div key={param.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Parameter name"
                value={param.name}
                onChange={(e) => onUpdateParam(param.id, 'name', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <select
                value={param.type}
                onChange={(e) => onUpdateParam(param.id, 'type', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {DATA_TYPES.filter(t => t !== 'select').map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <button
                onClick={() => onRemoveParam(param.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Example value"
              value={param.value}
              onChange={(e) => onUpdateParam(param.id, 'value', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={param.description}
              onChange={(e) => onUpdateParam(param.id, 'description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        ))}

        {inputParams.length === 0 && (
          <p className="text-gray-500 text-center py-8">No input parameters defined yet</p>
        )}
      </div>
    </div>
  );
}
