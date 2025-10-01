import { Copy, Check, Download } from 'lucide-react';

interface GeneratedCodeProps {
  generatedCode: string;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
}

export function GeneratedCode({ generatedCode, copied, onCopy, onDownload }: GeneratedCodeProps) {
  if (!generatedCode) return null;

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Generated Code</h2>
        <div className="flex gap-2">
          <button
            onClick={onCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Download size={20} />
            Download
          </button>
        </div>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm">
        <code>{generatedCode}</code>
      </pre>
    </div>
  );
}
