'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Plus, Trash2, Code, Download, Copy, Check, Play, AlertCircle, Save, FolderOpen } from 'lucide-react';
import { openRouterClient } from '@/lib/api/openrouter';
import { transformationsAPI } from '@/lib/api/transformations';
import { useSearchParams } from 'next/navigation';

const DATA_TYPES = ['text', 'number', 'boolean', 'date', 'select'];

interface Column {
  id: number;
  name: string;
  type: string;
  logic?: string;
  options?: string[];
}

interface InputTable {
  id: number;
  name: string;
  columns: Column[];
  rows: Record<string, unknown>[];
}

interface InputParam {
  id: number;
  name: string;
  type: string;
  value: string;
  description: string;
}

interface OutputTable {
  name: string;
  baseLogic: string;
  columns: Column[];
  rows: Record<string, unknown>[];
}

interface TestResults {
  success: boolean;
  actual?: Record<string, unknown>[];
  expected?: Record<string, unknown>[];
  error?: string;
  message: string;
}

function LogicGeneratorContent() {
  const searchParams = useSearchParams();
  const [inputTables, setInputTables] = useState<InputTable[]>([]);
  const [inputParams, setInputParams] = useState<InputParam[]>([]);
  const [outputTable, setOutputTable] = useState<OutputTable>({ name: '', baseLogic: '', columns: [], rows: [] });
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'valid' | 'missing'>('checking');
  const [connectionTest, setConnectionTest] = useState<{ success: boolean; message: string; model?: string } | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [addingColumnTo, setAddingColumnTo] = useState<number | 'output' | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<number | null>(null);
  const [newColumnType, setNewColumnType] = useState('text');
  const [newColumnOptions, setNewColumnOptions] = useState('');
  const [newColumnLogic, setNewColumnLogic] = useState('');
  const [columnMenuPosition, setColumnMenuPosition] = useState({ x: 0, y: 0 });
  
  // Save/Load state
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');

  // Check API key status on component mount
  React.useEffect(() => {
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
      
      // Update API key status based on test result
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
    if (!saveName.trim()) {
      setSaveError('Please enter a name for the transformation');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await transformationsAPI.createTransformation({
        name: saveName.trim(),
        description: saveDescription.trim() || undefined,
        input_tables: inputTables,
        input_params: inputParams,
        output_table: outputTable,
      });

      setShowSaveModal(false);
      setSaveName('');
      setSaveDescription('');
      
      // Show success message (you could add a toast notification here)
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

      setInputTables(transformation.input_tables);
      setInputParams(transformation.input_params);
      setOutputTable(transformation.output_table);
      setGeneratedCode(''); // Clear any generated code
      setTestResults(null); // Clear test results

      // Transformation loaded successfully (popup removed)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load transformation');
    } finally {
      setIsLoading(false);
    }
  };

  // Column Type Selector Component - Positioned below button
  const ColumnTypeSelector = ({ isOutput, onAdd, onClose, position }: {
    isOutput: boolean;
    onAdd: () => void;
    onClose: () => void;
    position: { x: number; y: number };
  }) => {
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
  };

  // Input Tables Management
  const addInputTable = () => {
    setInputTables([...inputTables, { id: Date.now(), name: 'New Table', columns: [], rows: [] }]);
  };

  const removeInputTable = (id: number) => {
    setInputTables(inputTables.filter(t => t.id !== id));
  };

  const updateTableName = (id: number, name: string) => {
    setInputTables(inputTables.map(t => t.id === id ? { ...t, name } : t));
  };

  const addInputTableColumn = (tableId: number) => {
    setInputTables(inputTables.map(t => {
      if (t.id === tableId) {
        const newCol = { 
          id: Date.now(), 
          name: 'New Column', 
          type: newColumnType,
          ...(newColumnType === 'select' && { options: newColumnOptions.split(',').map(o => o.trim()).filter(o => o) })
        };
        const newRows = t.rows.map(row => ({ 
          ...row, 
          [newCol.id]: newColumnType === 'boolean' ? false : newColumnType === 'number' ? '0' : '' 
        }));
        // Set this column as editing
        setEditingColumnId(newCol.id);
        return { ...t, columns: [...t.columns, newCol], rows: newRows };
      }
      return t;
    }));
    // Reset form
    setNewColumnType('text');
    setNewColumnOptions('');
    setNewColumnLogic('');
  };

  const removeTableColumn = (tableId: number, colId: number) => {
    setInputTables(inputTables.map(t => {
      if (t.id === tableId) {
        const newRows = t.rows.map(row => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [colId]: _unused, ...rest } = row;
          return rest;
        });
        return { ...t, columns: t.columns.filter(c => c.id !== colId), rows: newRows };
      }
      return t;
    }));
    if (editingColumnId === colId) {
      setEditingColumnId(null);
    }
  };


  const addTableRow = (tableId: number) => {
    setInputTables(inputTables.map(t => {
      if (t.id === tableId) {
        const newRow: Record<string, unknown> = { id: Date.now() };
        t.columns.forEach(col => {
          newRow[col.id] = col.type === 'boolean' ? false : col.type === 'number' ? '0' : '';
        });
        return { ...t, rows: [...t.rows, newRow] };
      }
      return t;
    }));
  };

  const removeTableRow = (tableId: number, rowId: number) => {
    setInputTables(inputTables.map(t => 
      t.id === tableId 
        ? { ...t, rows: t.rows.filter(r => r.id !== rowId) }
        : t
    ));
  };

  const updateTableCell = (tableId: number, rowId: number, colId: number, value: unknown) => {
    setInputTables(inputTables.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          rows: t.rows.map(r => 
            r.id === rowId ? { ...r, [colId]: value } : r
          )
        };
      }
      return t;
    }));
  };

  // Input Parameters Management
  const addInputParam = () => {
    setInputParams([...inputParams, { 
      id: Date.now(), 
      name: 'parameter', 
      type: 'text', 
      value: '',
      description: '' 
    }]);
  };

  const removeInputParam = (id: number) => {
    setInputParams(inputParams.filter(p => p.id !== id));
  };

  const updateInputParam = (id: number, field: string, value: string) => {
    setInputParams(inputParams.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Output Table Management
  const addOutputColumn = () => {
    const newCol = { 
      id: Date.now(), 
      name: 'New Column', 
      type: newColumnType, 
      logic: newColumnLogic,
      ...(newColumnType === 'select' && { options: newColumnOptions.split(',').map(o => o.trim()).filter(o => o) })
    };
    const newRows = outputTable.rows.map(row => ({ 
      ...row, 
      [newCol.id]: newColumnType === 'boolean' ? false : newColumnType === 'number' ? '0' : '' 
    }));
    setOutputTable({
      ...outputTable,
      columns: [...outputTable.columns, newCol],
      rows: newRows
    });
    // Set this column as editing
    setEditingColumnId(newCol.id);
    // Reset form
    setNewColumnType('text');
    setNewColumnOptions('');
    setNewColumnLogic('');
  };

  const removeOutputColumn = (colId: number) => {
    const newRows = outputTable.rows.map(row => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [colId]: _unused, ...rest } = row;
      return rest;
    });
    setOutputTable({
      ...outputTable,
      columns: outputTable.columns.filter(c => c.id !== colId),
      rows: newRows
    });
    if (editingColumnId === colId) {
      setEditingColumnId(null);
    }
  };


  const addOutputRow = () => {
    const newRow: Record<string, unknown> = { id: Date.now() };
    outputTable.columns.forEach(col => {
      newRow[col.id] = col.type === 'boolean' ? false : col.type === 'number' ? '0' : '';
    });
    setOutputTable({
      ...outputTable,
      rows: [...outputTable.rows, newRow]
    });
  };

  const removeOutputRow = (rowId: number) => {
    setOutputTable({
      ...outputTable,
      rows: outputTable.rows.filter(r => r.id !== rowId)
    });
  };

  const updateOutputCell = (rowId: number, colId: number, value: unknown) => {
    setOutputTable({
      ...outputTable,
      rows: outputTable.rows.map(r => 
        r.id === rowId ? { ...r, [colId]: value } : r
      )
    });
  };

  const updateInputTableColumnName = (tableId: number, colId: number, name: string) => {
    setInputTables(inputTables.map(t => 
      t.id === tableId 
        ? { ...t, columns: t.columns.map(c => c.id === colId ? { ...c, name } : c) }
        : t
    ));
  };

  const updateOutputColumnName = (colId: number, name: string) => {
    setOutputTable({
      ...outputTable,
      columns: outputTable.columns.map(c => c.id === colId ? { ...c, name } : c)
    });
  };

  // Render Cell based on type
  const renderCell = (row: Record<string, unknown>, col: Column, tableId: number | null, isOutput: boolean) => {
    const value = row[col.id];
    const updateFn = isOutput 
      ? (val: unknown) => updateOutputCell(row.id as number, col.id, val)
      : (val: unknown) => updateTableCell(tableId!, row.id as number, col.id, val);
    
    switch(col.type) {
      case 'text':
        return (
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => updateFn(e.target.value)}
            className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={(value as string) || ''}
            onChange={(e) => updateFn(e.target.value)}
            className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={(value as string) || ''}
            onChange={(e) => updateFn(e.target.value)}
            className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );
      case 'select':
        return (
          <select
            value={(value as string) || ''}
            onChange={(e) => updateFn(e.target.value)}
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
            onChange={(e) => updateFn(e.target.checked)}
            className="ml-2"
          />
        );
      default:
        return (
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => updateFn(e.target.value)}
            className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );
    }
  };

  // Generate Code
  const generateCode = async () => {
    if (!outputTable.name || outputTable.columns.length === 0) {
      alert('Please define at least an output table name and one column');
      return;
    }

    setIsGenerating(true);
    setGeneratedCode('');

    try {
      const prompt = buildPrompt();
      const code = await openRouterClient.generateCode(prompt, 'deepseek/deepseek-chat-v3.1:free');
      setGeneratedCode(code);
    } catch (error) {
      console.error('Error generating code:', error);
      alert(`Failed to generate code: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const buildPrompt = () => {
    let prompt = `Generate a JavaScript function that transforms input data into output data based on the following specifications.

CRITICAL REQUIREMENTS:
- Generate ONLY pure JavaScript function code (ES6+), NO TypeScript
- Do NOT use TypeScript types, interfaces, or type annotations
- Do NOT wrap the code in markdown code blocks or backticks
- The function should be deterministic and production-ready
- Include clear comments explaining the logic
- Handle edge cases gracefully
- The function name MUST be "transformData"
- The function signature MUST be: function transformData({ inputTables, params }) { ... }
- Return an array of objects representing the output table

`;

    // Input Tables with Example Data
    if (inputTables.length > 0) {
      prompt += `INPUT DATA TABLES:\n`;
      inputTables.forEach(table => {
        prompt += `\n${table.name}:\n`;
        prompt += `Columns:\n`;
        table.columns.forEach(col => {
          prompt += `  - ${col.name} (${col.type})`;
          if (col.options) {
            prompt += ` [options: ${col.options.join(', ')}]`;
          }
          prompt += '\n';
        });
        if (table.rows.length > 0) {
          prompt += `Example data:\n`;
          table.rows.forEach((row, idx) => {
            prompt += `  Row ${idx + 1}: `;
            const rowData = table.columns.map(col => `${col.name}=${row[col.id]}`).join(', ');
            prompt += rowData + '\n';
          });
        }
      });
    }

    // Input Parameters
    if (inputParams.length > 0) {
      prompt += `\nINPUT PARAMETERS:\n`;
      inputParams.forEach(param => {
        prompt += `  - ${param.name} (${param.type})${param.description ? ': ' + param.description : ''}`;
        if (param.value) {
          prompt += ` [Example value: ${param.value}]`;
        }
        prompt += '\n';
      });
    }

    // Output Table
    prompt += `\nOUTPUT TABLE: ${outputTable.name}\n`;
    if (outputTable.baseLogic) {
      prompt += `\nBase Logic (what rows should be in output):\n${outputTable.baseLogic}\n`;
    }
    prompt += `\nOutput Columns:\n`;
    outputTable.columns.forEach(col => {
      prompt += `\n${col.name} (${col.type}):\n`;
      if (col.logic) {
        prompt += `  Logic: ${col.logic}\n`;
      }
    });

    if (outputTable.rows.length > 0) {
      prompt += `\nExpected output example data:\n`;
      outputTable.rows.forEach((row, idx) => {
        prompt += `  Row ${idx + 1}: `;
        const rowData = outputTable.columns.map(col => `${col.name}=${row[col.id]}`).join(', ');
        prompt += rowData + '\n';
      });
    }

    prompt += `\n\nGenerate a pure JavaScript function named "transformData" that:
- Accepts a single parameter: an object with { inputTables, params }
- inputTables is an object where keys are table names and values are arrays of objects
- params is an object where keys are parameter names and values are the parameter values
- Returns an array of objects representing the output table
- Uses NO TypeScript syntax - pure JavaScript only
- Match the expected output data as closely as possible

EXAMPLE STRUCTURE:
function transformData({ inputTables, params }) {
  // Your logic here
  const output = [];
  // Process the data
  return output;
}`;

    return prompt;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-logic.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Test Generated Code
  const testGeneratedCode = async () => {
    if (!generatedCode) {
      alert('Please generate code first');
      return;
    }

    if (outputTable.rows.length === 0) {
      alert('Please provide expected output data to test against');
      return;
    }

    setIsTesting(true);
    setTestResults(null);

    try {
      // Prepare test data
      const inputData: Record<string, Record<string, unknown>[]> = {};
      inputTables.forEach(table => {
        const tableData = table.rows.map(row => {
          const obj: Record<string, unknown> = {};
          table.columns.forEach(col => {
            let value = row[col.id];
            // Convert to appropriate type
            if (col.type === 'number') {
              value = value === '' ? 0 : parseFloat(value as string);
            } else if (col.type === 'boolean') {
              value = value === true || value === 'true';
            }
            obj[col.name] = value;
          });
          return obj;
        });
        inputData[table.name] = tableData;
      });

      const params: Record<string, unknown> = {};
      inputParams.forEach(param => {
        let value: unknown = param.value;
        if (param.type === 'number') {
          value = value === '' ? 0 : parseFloat(value as string);
        } else if (param.type === 'boolean') {
          value = value === 'true' || value === true;
        }
        params[param.name] = value;
      });

      // Execute generated code
      try {
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const wrappedCode = `
          ${generatedCode}
          return transformData({ inputTables: inputData, params });
        `;
        const testFunction = new AsyncFunction('inputData', 'params', wrappedCode);
        const actualOutput = await testFunction(inputData, params);

        // Compare with expected output
        const expectedOutput = outputTable.rows.map(row => {
          const obj: Record<string, unknown> = {};
          outputTable.columns.forEach(col => {
            let value = row[col.id];
            if (col.type === 'number') {
              value = value === '' ? 0 : parseFloat(value as string);
            } else if (col.type === 'boolean') {
              value = value === true || value === 'true';
            }
            obj[col.name] = value;
          });
          return obj;
        });

        // Deep comparison
        const matches = JSON.stringify(actualOutput) === JSON.stringify(expectedOutput);
        
        setTestResults({
          success: matches,
          expected: expectedOutput,
          actual: actualOutput,
          message: matches 
            ? 'Test passed! Generated code produces expected output.' 
            : 'Test failed. Generated output does not match expected output.'
        });

      } catch (execError) {
        setTestResults({
          success: false,
          error: execError instanceof Error ? execError.message : String(execError),
          message: 'Error executing generated code: ' + (execError instanceof Error ? execError.message : String(execError)),
          expected: outputTable.rows.map(row => {
            const obj: Record<string, unknown> = {};
            outputTable.columns.forEach(col => {
              let value = row[col.id];
              if (col.type === 'number') {
                value = value === '' ? 0 : parseFloat(value as string);
              } else if (col.type === 'boolean') {
                value = value === true || value === 'true';
              }
              obj[col.name] = value;
            });
            return obj;
          }),
          actual: undefined
        });
      }

    } catch (error) {
      console.error('Error testing code:', error);
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: 'Error during testing: ' + (error instanceof Error ? error.message : String(error))
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
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
              onClick={testOpenRouterConnection}
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
              onClick={() => setShowSaveModal(true)}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Inputs */}
          <div className="space-y-6">
            {/* Input Tables Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Input Data Tables</h2>
                <button
                  onClick={addInputTable}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus size={20} />
                  Add Table
                </button>
              </div>

              <div className="space-y-6">
                {inputTables.map(table => (
                  <div key={table.id} className="border border-gray-200 rounded-lg bg-gray-50">
                    {/* Table Header */}
                    <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={table.name}
                          onChange={(e) => updateTableName(table.id, e.target.value)}
                          className="text-lg font-semibold px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => removeInputTable(table.id)}
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
                                        onChange={(e) => updateInputTableColumnName(table.id, col.id, e.target.value)}
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
                                    onClick={() => removeTableColumn(table.id, col.id)}
                                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-600 rounded"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </th>
                            ))}
                            <th className="px-2 py-2 border-b border-gray-200 relative">
                              <button
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setColumnMenuPosition({
                                    x: rect.left,
                                    y: rect.bottom + 4
                                  });
                                  setAddingColumnTo(table.id);
                                }}
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
                                  {renderCell(row, col, table.id, false)}
                                </td>
                              ))}
                              <td className="border-b border-gray-200 text-center">
                                <button
                                  onClick={() => removeTableRow(table.id, row.id as number)}
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
                        onClick={() => addTableRow(table.id)}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium"
                        disabled={table.columns.length === 0}
                      >
                        <Plus size={16} />
                        Add Row
                      </button>
                    </div>
                  </div>
                ))}

                {inputTables.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No input tables defined yet</p>
                )}
              </div>
            </div>

            {/* Input Parameters Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Input Parameters</h2>
                <button
                  onClick={addInputParam}
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
                        onChange={(e) => updateInputParam(param.id, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <select
                        value={param.type}
                        onChange={(e) => updateInputParam(param.id, 'type', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {DATA_TYPES.filter(t => t !== 'select').map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeInputParam(param.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Example value"
                      value={param.value}
                      onChange={(e) => updateInputParam(param.id, 'value', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={param.description}
                      onChange={(e) => updateInputParam(param.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                ))}

                {inputParams.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No input parameters defined yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="space-y-6">
            {/* Output Table Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Output Table</h2>

              <input
                type="text"
                placeholder="Output table name"
                value={outputTable.name}
                onChange={(e) => setOutputTable({ ...outputTable, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What constitutes the output list?
                </label>
                <textarea
                  placeholder="Describe in natural language what rows should be in the output (e.g., 'same as Input Table')"
                  value={outputTable.baseLogic}
                  onChange={(e) => setOutputTable({ ...outputTable, baseLogic: e.target.value })}
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
                                    onChange={(e) => updateOutputColumnName(col.id, e.target.value)}
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
                                    <div className="font-semibold">{col.name}</div>
                                    <div className="text-xs text-gray-500">{col.type}</div>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => removeOutputColumn(col.id)}
                                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-600 rounded"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </th>
                        ))}
                        <th className="px-2 py-2 border-b border-gray-200 relative">
                          <button
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setColumnMenuPosition({
                                x: rect.left,
                                y: rect.bottom + 4
                              });
                              setAddingColumnTo('output');
                            }}
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
                              {renderCell(row, col, null, true)}
                            </td>
                          ))}
                          <td className="border-b border-gray-200 text-center">
                            <button
                              onClick={() => removeOutputRow(row.id as number)}
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
                    onClick={addOutputRow}
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium"
                    disabled={outputTable.columns.length === 0}
                  >
                    <Plus size={16} />
                    Add Row
                  </button>
                </div>
              </div>
            </div>

            {/* Generate & Test Buttons */}
            <div className="space-y-3">
              <button
                onClick={generateCode}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
              >
                <Code size={24} />
                {isGenerating ? 'Generating Code...' : 'Generate Next.js Code'}
              </button>

              {generatedCode && (
                <button
                  onClick={testGeneratedCode}
                  disabled={isTesting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  <Play size={24} />
                  {isTesting ? 'Testing Code...' : 'Test Generated Code'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Generated Code Section */}
        {generatedCode && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Generated Code</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyCode}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={downloadCode}
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
        )}

        {/* Test Results - Side by Side Comparison */}
        {testResults && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <div className={`flex items-center gap-3 mb-6 p-4 rounded-lg ${testResults.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <AlertCircle size={24} className={testResults.success ? 'text-green-600' : 'text-red-600'} />
              <div>
                <h3 className={`font-semibold ${testResults.success ? 'text-green-900' : 'text-red-900'}`}>
                  {testResults.success ? 'Test Passed ✓' : 'Test Failed ✗'}
                </h3>
                <p className={`text-sm ${testResults.success ? 'text-green-800' : 'text-red-800'}`}>
                  {testResults.message}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expected Output Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Expected Output</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-green-100">
                        <th className="px-3 py-2 text-left border-b border-r border-gray-300">#</th>
                        {outputTable.columns.map(col => (
                          <th key={col.id} className="px-3 py-2 text-left border-b border-r border-gray-300">
                            <div className="font-semibold">{col.name}</div>
                            <div className="text-xs text-gray-600">{col.type}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {testResults.expected?.map((row: Record<string, unknown>, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2 border-b border-r border-gray-300 text-gray-500">{idx + 1}</td>
                          {outputTable.columns.map(col => (
                            <td key={col.name} className="px-3 py-2 border-b border-r border-gray-300">
                              {row[col.name] !== undefined ? String(row[col.name]) : '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actual Output Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Actual Output</h3>
                {testResults.actual ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className={testResults.success ? 'bg-green-100' : 'bg-red-100'}>
                          <th className="px-3 py-2 text-left border-b border-r border-gray-300">#</th>
                          {Object.keys(testResults.actual?.[0] || {}).map(key => (
                            <th key={key} className="px-3 py-2 text-left border-b border-r border-gray-300">
                              <div className="font-semibold">{key}</div>
                              <div className="text-xs text-gray-600">
                                {typeof testResults.actual?.[0]?.[key]}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {testResults.actual.map((row: Record<string, unknown>, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-3 py-2 border-b border-r border-gray-300 text-gray-500">{idx + 1}</td>
                            {Object.keys(row).map(key => (
                              <td key={key} className="px-3 py-2 border-b border-r border-gray-300">
                                {row[key] !== undefined ? String(row[key]) : '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <p className="text-red-800 text-sm font-semibold mb-2">Error executing code</p>
                    {testResults.error && (
                      <pre className="bg-white p-3 rounded border border-red-300 overflow-x-auto text-xs text-red-900">
                        {testResults.error}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Column Editor - Positioned below button */}
      {addingColumnTo !== null && (
        <ColumnTypeSelector
          isOutput={addingColumnTo === 'output'}
          position={columnMenuPosition}
          onAdd={() => {
            if (addingColumnTo === 'output') {
              addOutputColumn();
            } else {
              addInputTableColumn(addingColumnTo);
            }
          }}
          onClose={() => {
            setAddingColumnTo(null);
            setNewColumnType('text');
            setNewColumnOptions('');
            setNewColumnLogic('');
          }}
        />
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Transformation</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Enter transformation name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  placeholder="Enter description (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>

            {saveError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{saveError}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveName('');
                  setSaveDescription('');
                  setSaveError(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={saveTransformation}
                disabled={isSaving || !saveName.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LogicGenerator() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LogicGeneratorContent />
    </Suspense>
  );
}
