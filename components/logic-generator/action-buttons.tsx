import { Code, Play } from 'lucide-react';

interface ActionButtonsProps {
  isGenerating: boolean;
  isTesting: boolean;
  hasGeneratedCode: boolean;
  onGenerateCode: () => void;
  onTestCode: () => void;
}

export function ActionButtons({
  isGenerating,
  isTesting,
  hasGeneratedCode,
  onGenerateCode,
  onTestCode,
}: ActionButtonsProps) {
  return (
    <div className="space-y-3">
      <button
        onClick={onGenerateCode}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
      >
        <Code size={24} />
        {isGenerating ? 'Generating Code...' : 'Generate Next.js Code'}
      </button>

      {hasGeneratedCode && (
        <button
          onClick={onTestCode}
          disabled={isTesting}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
        >
          <Play size={24} />
          {isTesting ? 'Testing Code...' : 'Test Generated Code'}
        </button>
      )}
    </div>
  );
}
