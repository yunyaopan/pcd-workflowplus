import { DATA_TYPES } from '@/lib/types/logic-generator';
import type { DataType, ColumnMenuPosition } from '@/lib/types/logic-generator';

interface ColumnTypeSelectorProps {
  isOutput: boolean;
  onAdd: () => void;
  onClose: () => void;
  position: ColumnMenuPosition;
  newColumnType: DataType;
  setNewColumnType: (type: DataType) => void;
  newColumnOptions: string;
  setNewColumnOptions: (options: string) => void;
  newColumnLogic: string;
  setNewColumnLogic: (logic: string) => void;
}

export function ColumnTypeSelector({
  isOutput,
  onAdd,
  onClose,
  position,
  newColumnType,
  setNewColumnType,
  newColumnOptions,
  setNewColumnOptions,
  newColumnLogic,
  setNewColumnLogic,
}: ColumnTypeSelectorProps) {
  // Calculate if menu would go off-screen and adjust
  const menuWidth = 320;
  const menuHeight = 280; // Approximate height of the menu
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  let adjustedX = position.x;
  let adjustedY = position.y;
  
  // Adjust horizontal position if menu would go off-screen
  if (adjustedX + menuWidth > viewportWidth - 20) {
    adjustedX = viewportWidth - menuWidth - 20;
  }
  
  // Adjust vertical position if menu would go off-screen
  if (adjustedY + menuHeight > viewportHeight - 20) {
    // Position above the button instead of below
    adjustedY = position.y - menuHeight - 8;
  }
  
  return (
    <>
      {/* Invisible overlay to detect clicks outside */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Menu positioned below the button */}
      <div 
        className="fixed bg-white border border-gray-300 rounded-lg shadow-xl z-50 p-4"
        style={{
          left: `${adjustedX}px`,
          top: `${adjustedY}px`,
          width: '320px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3">
          <div className="text-sm font-medium text-gray-700 mb-2">Property type</div>
          <div className="grid grid-cols-2 gap-2">
            {DATA_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setNewColumnType(type)}
                className={`px-3 py-2 text-sm rounded-md text-left flex items-center gap-2 ${
                  newColumnType === type 
                    ? 'bg-blue-100 border-2 border-blue-500' 
                    : 'bg-gray-50 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                <span className="text-gray-600">
                  {type === 'text' && '≡'}
                  {type === 'number' && '#'}
                  {type === 'boolean' && '☐'}
                  {type === 'date' && '📅'}
                  {type === 'select' && '◉'}
                </span>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {newColumnType === 'select' && (
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Options</div>
            <input
              type="text"
              placeholder="Option1, Option2, Option3"
              value={newColumnOptions}
              onChange={(e) => setNewColumnOptions(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {isOutput && (
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-700 mb-2">
              How to generate this column&apos;s value?
            </div>
            <textarea
              placeholder="Describe in natural language how to calculate or derive this column&apos;s value. For example: &apos;Multiply the Value column by the multiplier parameter&apos; or &apos;true if Item exists in the BQ table&apos;"
              value={newColumnLogic}
              onChange={(e) => setNewColumnLogic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
          </div>
        )}

        <button
          onClick={() => {
            onAdd();
            onClose();
          }}
          className="w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          Add Property
        </button>
      </div>
    </>
  );
}
