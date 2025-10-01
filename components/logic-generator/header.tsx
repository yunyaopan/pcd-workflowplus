import { Play, Save, FolderOpen, AlertCircle, Edit2, Check, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  apiKeyStatus: 'checking' | 'valid' | 'missing';
  connectionTest: { success: boolean; message: string; model?: string } | null;
  isTestingConnection: boolean;
  isSaving: boolean;
  isLoading: boolean;
  saveError: string | null;
  loadError: string | null;
  currentTransformationId: string | null;
  transformationName: string;
  setTransformationName: (name: string) => void;
  isEditingName: boolean;
  setIsEditingName: (editing: boolean) => void;
  onTestConnection: () => void;
  onSaveTransformation: () => void;
}

export function Header({
  apiKeyStatus,
  connectionTest,
  isTestingConnection,
  isSaving,
  isLoading,
  saveError,
  loadError,
  transformationName,
  setTransformationName,
  isEditingName,
  setIsEditingName,
  onTestConnection,
  onSaveTransformation,
}: HeaderProps) {
  const handleNameEdit = () => {
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
  };

  return (
    <div className="mb-8">
      {/* Google Docs Style Header */}
      <div className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4">
        {/* Left side - Title and Star */}
        <div className="flex items-center gap-3">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={transformationName}
                onChange={(e) => setTransformationName(e.target.value)}
                className="text-lg font-semibold text-gray-900 border-none shadow-none focus-visible:ring-0 h-auto px-0"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleNameSave();
                  } else if (e.key === 'Escape') {
                    handleNameCancel();
                  }
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNameSave}
                className="h-6 w-6 text-green-600 hover:text-green-700"
              >
                <Check size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNameCancel}
                className="h-6 w-6 text-red-600 hover:text-red-700"
              >
                <X size={16} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-gray-900">{transformationName}</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNameEdit}
                className="h-6 w-6 text-gray-500 hover:text-gray-700"
              >
                <Edit2 size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-400 hover:text-gray-600"
              >
                <Star size={16} />
              </Button>
            </div>
          )}
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={onSaveTransformation}
            disabled={isSaving || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant="outline"
            asChild
          >
            <a href="/transformations">
              <FolderOpen size={16} />
              View Transformations
            </a>
          </Button>
        </div>
      </div>

      {/* Subtitle */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <p className="text-sm text-gray-600 mb-3">Define your inputs and outputs, describe the logic in plain English, and generate the code which would transform the data in your desired way. <br /> <br /> You can include LLM prompts to generate the data for your output table.</p>
        
        {/* Simple Steps */}
        <div className="text-xs text-gray-500">
          <p className="font-medium mb-2">How to get started:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Add your input data tables/ parameters</li>
            <li>Define your output table structure, column types and describe your transformation logic in plain English</li>
            <li>Add example data to your input data tables and output table</li>
            <li>Click &quot;Generate Code&quot; to create the code</li>
            <li>Test and validate if the output of the code match with the example data you provided</li>
          </ol>
        </div>
      </div>
      
      {/* API Key Status */}
      {apiKeyStatus === 'missing' && (
        <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
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
      <div className="mx-6 mt-4 flex justify-center">
        <Button
          onClick={onTestConnection}
          disabled={isTestingConnection}
          variant="outline"
          className="hidden"
        >
          <Play size={16} />
          {isTestingConnection ? 'Testing Connection...' : 'Test OpenRouter Connection'}
        </Button>
      </div>

      {/* Connection Test Results */}
      {connectionTest && (
        <div className={`mx-6 mt-4 p-4 rounded-lg border ${
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

      {/* Error Messages */}
      {saveError && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle size={20} />
            <span className="font-semibold">Save Error</span>
          </div>
          <p className="text-red-700 text-sm mt-2">{saveError}</p>
        </div>
      )}

      {loadError && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle size={20} />
            <span className="font-semibold">Load Error</span>
          </div>
          <p className="text-red-700 text-sm mt-2">{loadError}</p>
        </div>
      )}

      {isLoading && (
        <div className="mx-6 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
