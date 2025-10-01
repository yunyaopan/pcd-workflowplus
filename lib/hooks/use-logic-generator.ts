import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { openRouterClient } from '@/lib/api/openrouter';
import { transformationsAPI } from '@/lib/api/transformations';
import type { 
  InputTable, 
  InputParam, 
  OutputTable, 
  TestResults, 
  ConnectionTest,
  ColumnMenuPosition,
  DataType
} from '@/lib/types/logic-generator';

export function useLogicGenerator() {
  const searchParams = useSearchParams();
  
  // Core state
  const [inputTables, setInputTables] = useState<InputTable[]>([]);
  const [inputParams, setInputParams] = useState<InputParam[]>([]);
  const [outputTable, setOutputTable] = useState<OutputTable>({ 
    name: '', 
    baseLogic: '', 
    columns: [], 
    rows: [] 
  });
  
  // Code generation state
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Testing state
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  
  // API connection state
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'valid' | 'missing'>('checking');
  const [connectionTest, setConnectionTest] = useState<ConnectionTest | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  // Column editing state
  const [addingColumnTo, setAddingColumnTo] = useState<number | 'output' | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<number | null>(null);
  const [newColumnType, setNewColumnType] = useState<DataType>('text');
  const [newColumnOptions, setNewColumnOptions] = useState('');
  const [newColumnLogic, setNewColumnLogic] = useState('');
  const [newColumnIsLLM, setNewColumnIsLLM] = useState(false);
  const [columnMenuPosition, setColumnMenuPosition] = useState<ColumnMenuPosition>({ x: 0, y: 0 });
  
  // Column type editing state
  const [editingColumnType, setEditingColumnType] = useState(false);
  const [editingColumnData, setEditingColumnData] = useState<{
    id: number;
    type: DataType;
    logic?: string;
    options?: string[];
  } | null>(null);
  
  // Save/Load state
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentTransformationId, setCurrentTransformationId] = useState<string | null>(null);
  const [transformationName, setTransformationName] = useState('Untitled Transformation');
  const [transformationDescription, setTransformationDescription] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  // Check API key status on component mount
  useEffect(() => {
    const checkApiKey = () => {
      const hasApiKey = !!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
      setApiKeyStatus(hasApiKey ? 'valid' : 'missing');
    };
    checkApiKey();
  }, []);

  // Load transformation from URL parameter
  useEffect(() => {
    const loadId = searchParams.get('load');
    if (loadId) {
      loadTransformation(loadId);
    }
  }, [searchParams]);

  // Test OpenRouter Connection
  const testOpenRouterConnection = async () => {
    setIsTestingConnection(true);
    setConnectionTest(null);

    try {
      const result = await openRouterClient.testConnection();
      setConnectionTest(result);
      
      if (result.success) {
        setApiKeyStatus('valid');
      } else if (result.message.includes('API key is missing')) {
        setApiKeyStatus('missing');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionTest({
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Save transformation
  const saveTransformation = async () => {
    if (!transformationName.trim()) {
      setSaveError('Please enter a name for the transformation');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      if (currentTransformationId) {
        // Update existing transformation
        await transformationsAPI.updateTransformation(currentTransformationId, {
          name: transformationName.trim(),
          description: transformationDescription.trim() || undefined,
          input_tables: inputTables,
          input_params: inputParams,
          output_table: outputTable,
        });
      } else {
        // Create new transformation
        const response = await transformationsAPI.createTransformation({
          name: transformationName.trim(),
          description: transformationDescription.trim() || undefined,
          input_tables: inputTables,
          input_params: inputParams,
          output_table: outputTable,
        });
        setCurrentTransformationId(response.transformation.id);
      }
      
      alert('Transformation saved successfully!');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save transformation');
    } finally {
      setIsSaving(false);
    }
  };

  // Load transformation
  const loadTransformation = async (id: string) => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await transformationsAPI.getTransformation(id);
      const transformation = response.transformation;

      setCurrentTransformationId(transformation.id);
      setTransformationName(transformation.name);
      setTransformationDescription(transformation.description || '');
      setInputTables(transformation.input_tables);
      setInputParams(transformation.input_params);
      setOutputTable(transformation.output_table);
      setGeneratedCode('');
      setTestResults(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load transformation');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy code to clipboard
  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download code as file
  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-logic.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    // State
    inputTables,
    setInputTables,
    inputParams,
    setInputParams,
    outputTable,
    setOutputTable,
    generatedCode,
    setGeneratedCode,
    isGenerating,
    setIsGenerating,
    copied,
    isTesting,
    setIsTesting,
    testResults,
    setTestResults,
    apiKeyStatus,
    connectionTest,
    isTestingConnection,
    addingColumnTo,
    setAddingColumnTo,
    editingColumnId,
    setEditingColumnId,
    newColumnType,
    setNewColumnType,
    newColumnOptions,
    setNewColumnOptions,
    newColumnLogic,
    setNewColumnLogic,
    newColumnIsLLM,
    setNewColumnIsLLM,
    columnMenuPosition,
    setColumnMenuPosition,
    editingColumnType,
    setEditingColumnType,
    editingColumnData,
    setEditingColumnData,
    isSaving,
    isLoading,
    saveError,
    setSaveError,
    loadError,
    setLoadError,
    currentTransformationId,
    transformationName,
    setTransformationName,
    transformationDescription,
    setTransformationDescription,
    isEditingName,
    setIsEditingName,
    
    // Actions
    testOpenRouterConnection,
    saveTransformation,
    loadTransformation,
    copyCode,
    downloadCode,
  };
}
