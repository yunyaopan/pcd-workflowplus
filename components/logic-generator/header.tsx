import { Play, Save, FolderOpen, AlertCircle } from 'lucide-react';

interface HeaderProps {
  apiKeyStatus: 'checking' | 'valid' | 'missing';
  connectionTest: { success: boolean; message: string; model?: string } | null;
  isTestingConnection: boolean;
  isSaving: boolean;
  isLoading: boolean;
  saveError: string | null;
  loadError: string | null;
  onTestConnection: () => void;
  onShowSaveModal: () => void;
}

export function Header({
  apiKeyStatus,
  connectionTest,
  isTestingConnection,
  isSaving,
  isLoading,
  saveError,
  loadError,
  onTestConnection,
  onShowSaveModal,
}: HeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Natural Language Logic Generator</h1>
      <p className="text-gray-600">Define your inputs and outputs, describe the logic in plain English, and generate Next.js code</p>
      
      {/* API Key Status */}
      {apiKeyStatus === 'missing' && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle size={20} />
            <span className="font-semibold">OpenRouter API Key Required</span>
          </div>
          <p className="text-yellow-700 text-sm mt-2">
            To generate code, you need to set up your OpenRouter API key. 
            <br />
            <strong>Steps:</strong>
            <br />
            1. Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline">https://openrouter.ai/keys</a>
            <br />
            2. Add <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_OPENROUTER_API_KEY=your_key_here</code> to your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file
            <br />
            3. Restart your development server
          </p>
        </div>
      )}

      {/* Connection Test */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={onTestConnection}
          disabled={isTestingConnection}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play size={16} />
          {isTestingConnection ? 'Testing Connection...' : 'Test OpenRouter Connection'}
        </button>
      </div>

      {/* Connection Test Results */}
      {connectionTest && (
        <div className={`mt-4 p-4 rounded-lg border ${
          connectionTest.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className={`flex items-center gap-2 ${
            connectionTest.success ? 'text-green-800' : 'text-red-800'
          }`}>
            <AlertCircle size={20} />
            <span className="font-semibold">
              {connectionTest.success ? 'Connection Test Passed' : 'Connection Test Failed'}
            </span>
          </div>
          <p className={`text-sm mt-2 ${
            connectionTest.success ? 'text-green-700' : 'text-red-700'
          }`}>
            {connectionTest.message}
          </p>
        </div>
      )}

      {/* Save/Load Actions */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={onShowSaveModal}
          disabled={isSaving || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Transformation'}
        </button>
        <a
          href="/transformations"
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          <FolderOpen size={16} />
          View Saved
        </a>
      </div>

      {/* Error Messages */}
      {saveError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle size={20} />
            <span className="font-semibold">Save Error</span>
          </div>
          <p className="text-red-700 text-sm mt-2">{saveError}</p>
        </div>
      )}

      {loadError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle size={20} />
            <span className="font-semibold">Load Error</span>
          </div>
          <p className="text-red-700 text-sm mt-2">{loadError}</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <AlertCircle size={20} />
            <span className="font-semibold">Loading Transformation...</span>
          </div>
          <p className="text-blue-700 text-sm mt-2">Please wait while we load your saved transformation.</p>
        </div>
      )}
    </div>
  );
}
