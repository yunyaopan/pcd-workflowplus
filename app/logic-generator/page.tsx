'use client';

import React, { Suspense } from 'react';
import { Plus } from 'lucide-react';
import { useLogicGenerator } from '@/lib/hooks/use-logic-generator';
import { generateCode, testGeneratedCode } from '@/lib/utils/code-generation';
import type { DataType } from '@/lib/types/logic-generator';
import {
  addInputTable,
  removeInputTable,
  updateTableName,
  addInputTableColumn,
  removeTableColumn,
  addTableRow,
  removeTableRow,
  updateTableCell,
  updateInputTableColumnName,
  updateInputTableColumnType,
  addInputParam,
  removeInputParam,
  updateInputParam,
  addOutputColumn,
  removeOutputColumn,
  addOutputRow,
  removeOutputRow,
  updateOutputCell,
  updateOutputColumnName,
  toggleOutputColumnLLM,
  updateOutputTableColumnType,
} from '@/lib/utils/table-management';
import { Header } from '@/components/logic-generator/header';
import { UnifiedTableComponent } from '@/components/logic-generator/unified-table';
import { InputParameters } from '@/components/logic-generator/input-parameters';
import { ActionButtons } from '@/components/logic-generator/action-buttons';
import { GeneratedCode } from '@/components/logic-generator/generated-code';
import { TestResultsComponent } from '@/components/logic-generator/test-results';

function LogicGeneratorContent() {
  const {
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
    loadError,
    currentTransformationId,
    transformationName,
    setTransformationName,
    isEditingName,
    setIsEditingName,
    
    // Actions
    testOpenRouterConnection,
    saveTransformation,
    copyCode,
    downloadCode,
  } = useLogicGenerator();

  // Handler functions for table management
  const handleAddInputTable = () => {
    setInputTables(addInputTable(inputTables));
  };

  const handleRemoveInputTable = (id: number) => {
    setInputTables(removeInputTable(inputTables, id));
  };

  const handleUpdateTableName = (id: number, name: string) => {
    setInputTables(updateTableName(inputTables, id, name));
  };

  const handleAddInputTableColumn = (tableId: number) => {
    setInputTables(addInputTableColumn(inputTables, tableId, newColumnType, newColumnOptions));
    setEditingColumnId(Date.now()); // Set the new column as editing
    setNewColumnType('text');
    setNewColumnOptions('');
    setNewColumnLogic('');
  };

  const handleRemoveTableColumn = (tableId: number, colId: number) => {
    setInputTables(removeTableColumn(inputTables, tableId, colId));
    if (editingColumnId === colId) {
      setEditingColumnId(null);
    }
  };

  const handleAddTableRow = (tableId: number) => {
    setInputTables(addTableRow(inputTables, tableId));
  };

  const handleRemoveTableRow = (tableId: number, rowId: number) => {
    setInputTables(removeTableRow(inputTables, tableId, rowId));
  };

  const handleUpdateTableCell = (tableId: number, rowId: number, colId: number, value: unknown) => {
    setInputTables(updateTableCell(inputTables, tableId, rowId, colId, value));
  };

  const handleUpdateInputTableColumnName = (tableId: number, colId: number, name: string) => {
    setInputTables(updateInputTableColumnName(inputTables, tableId, colId, name));
  };

  const handleAddInputParam = () => {
    setInputParams(addInputParam(inputParams));
  };

  const handleRemoveInputParam = (id: number) => {
    setInputParams(removeInputParam(inputParams, id));
  };

  const handleUpdateInputParam = (id: number, field: string, value: string) => {
    setInputParams(updateInputParam(inputParams, id, field, value));
  };

  const handleAddOutputColumn = () => {
    const newOutputTable = addOutputColumn(outputTable, newColumnType, newColumnOptions, newColumnLogic, newColumnIsLLM);
    setOutputTable(newOutputTable);
    setEditingColumnId(Date.now()); // Set the new column as editing
    setNewColumnType('text');
    setNewColumnOptions('');
    setNewColumnLogic('');
    setNewColumnIsLLM(false);
  };

  const handleRemoveOutputColumn = (colId: number) => {
    setOutputTable(removeOutputColumn(outputTable, colId));
    if (editingColumnId === colId) {
      setEditingColumnId(null);
    }
  };

  const handleAddOutputRow = () => {
    setOutputTable(addOutputRow(outputTable));
  };

  const handleRemoveOutputRow = (rowId: number) => {
    setOutputTable(removeOutputRow(outputTable, rowId));
  };

  const handleUpdateOutputCell = (rowId: number, colId: number, value: unknown) => {
    setOutputTable(updateOutputCell(outputTable, rowId, colId, value));
  };

  const handleUpdateOutputColumnName = (colId: number, name: string) => {
    setOutputTable(updateOutputColumnName(outputTable, colId, name));
  };

  const handleToggleOutputColumnLLM = (colId: number) => {
    setOutputTable(toggleOutputColumnLLM(outputTable, colId));
  };

  const handleUpdateOutputTableName = (name: string) => {
    setOutputTable({ ...outputTable, name });
  };

  const handleUpdateOutputBaseLogic = (logic: string) => {
    setOutputTable({ ...outputTable, baseLogic: logic });
  };

  const handleUpdateInputColumnType = (tableId: number, colId: number, type: DataType, options?: string[]) => {
    setInputTables(updateInputTableColumnType(inputTables, tableId, colId, type, options));
  };

  const handleUpdateOutputColumnType = (colId: number, type: DataType, logic?: string, options?: string[]) => {
    setOutputTable(updateOutputTableColumnType(outputTable, colId, type, logic, options));
  };

  // Code generation handlers
  const handleGenerateCode = async () => {
    setIsGenerating(true);
    setGeneratedCode('');

    try {
      const code = await generateCode(inputTables, inputParams, outputTable);
      setGeneratedCode(code);
    } catch (error) {
      console.error('Error generating code:', error);
      alert(`Failed to generate code: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestGeneratedCode = async () => {
    setIsTesting(true);
    setTestResults(null);

    try {
      const results = await testGeneratedCode(generatedCode, inputTables, inputParams, outputTable);
      setTestResults(results);
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


  const handleAddColumnClick = (tableId: number | 'output', event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setColumnMenuPosition({
      x: rect.left,
      y: rect.bottom + 4
    });
    setAddingColumnTo(tableId);
  };

  const handleCloseColumnMenu = () => {
    setAddingColumnTo(null);
    setNewColumnType('text');
    setNewColumnOptions('');
    setNewColumnLogic('');
    setNewColumnIsLLM(false);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Header
          apiKeyStatus={apiKeyStatus}
          connectionTest={connectionTest}
          isTestingConnection={isTestingConnection}
          isSaving={isSaving}
          isLoading={isLoading}
          saveError={saveError}
          loadError={loadError}
          currentTransformationId={currentTransformationId}
          transformationName={transformationName}
          setTransformationName={setTransformationName}
          isEditingName={isEditingName}
          setIsEditingName={setIsEditingName}
          onTestConnection={testOpenRouterConnection}
          onSaveTransformation={saveTransformation}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Inputs */}
          <div className="space-y-6">
            {/* Input Tables Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Input Data Tables</h2>
                <button
                  onClick={handleAddInputTable}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus size={20} />
                  Add Table
                </button>
              </div>

              <div className="space-y-6">
                {inputTables.map(table => (
                  <UnifiedTableComponent
                    key={table.id}
                    isOutput={false}
                    inputTable={table}
                    editingColumnId={editingColumnId}
                    setEditingColumnId={setEditingColumnId}
                    onUpdateInputTableName={handleUpdateTableName}
                    onRemoveInputTable={handleRemoveInputTable}
                    onAddInputColumn={(tableId, event) => handleAddColumnClick(tableId, event!)}
                    onRemoveInputColumn={handleRemoveTableColumn}
                    onUpdateInputColumnName={handleUpdateInputTableColumnName}
                    onAddInputRow={handleAddTableRow}
                    onRemoveInputRow={handleRemoveTableRow}
                    onUpdateInputCell={handleUpdateTableCell}
                    showColumnTypeSelector={addingColumnTo === table.id}
                    columnTypeSelectorPosition={columnMenuPosition}
                    newColumnType={newColumnType}
                    setNewColumnType={setNewColumnType}
                    newColumnOptions={newColumnOptions}
                    setNewColumnOptions={setNewColumnOptions}
                    newColumnLogic={newColumnLogic}
                    setNewColumnLogic={setNewColumnLogic}
                    newColumnIsLLM={newColumnIsLLM}
                    setNewColumnIsLLM={setNewColumnIsLLM}
                    onAddColumnWithType={() => {
                      if (typeof addingColumnTo === 'number') {
                        handleAddInputTableColumn(addingColumnTo);
                      }
                    }}
                    onCloseColumnTypeSelector={handleCloseColumnMenu}
                    editingColumnType={editingColumnType}
                    setEditingColumnType={setEditingColumnType}
                    editingColumnData={editingColumnData}
                    setEditingColumnData={setEditingColumnData}
                    onUpdateInputColumnType={handleUpdateInputColumnType}
                  />
                ))}

                {inputTables.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No input tables defined yet</p>
                )}
              </div>
            </div>

            {/* Input Parameters Section */}
            <InputParameters
              inputParams={inputParams}
              onAddParam={handleAddInputParam}
              onRemoveParam={handleRemoveInputParam}
              onUpdateParam={handleUpdateInputParam}
            />
          </div>

          {/* Right Column: Output */}
          <div className="space-y-6">
            <UnifiedTableComponent
              isOutput={true}
              outputTable={outputTable}
              editingColumnId={editingColumnId}
              setEditingColumnId={setEditingColumnId}
              onUpdateOutputTableName={handleUpdateOutputTableName}
              onUpdateBaseLogic={handleUpdateOutputBaseLogic}
              onAddOutputColumn={(event) => handleAddColumnClick('output', event!)}
              onRemoveOutputColumn={handleRemoveOutputColumn}
              onUpdateOutputColumnName={handleUpdateOutputColumnName}
              onToggleOutputColumnLLM={handleToggleOutputColumnLLM}
              onAddOutputRow={handleAddOutputRow}
              onRemoveOutputRow={handleRemoveOutputRow}
              onUpdateOutputCell={handleUpdateOutputCell}
              showColumnTypeSelector={addingColumnTo === 'output'}
              columnTypeSelectorPosition={columnMenuPosition}
              newColumnType={newColumnType}
              setNewColumnType={setNewColumnType}
              newColumnOptions={newColumnOptions}
              setNewColumnOptions={setNewColumnOptions}
              newColumnLogic={newColumnLogic}
              setNewColumnLogic={setNewColumnLogic}
              newColumnIsLLM={newColumnIsLLM}
              setNewColumnIsLLM={setNewColumnIsLLM}
              onAddColumnWithType={() => {
                if (addingColumnTo === 'output') {
                  handleAddOutputColumn();
                }
              }}
              onCloseColumnTypeSelector={handleCloseColumnMenu}
              editingColumnType={editingColumnType}
              setEditingColumnType={setEditingColumnType}
              editingColumnData={editingColumnData}
              setEditingColumnData={setEditingColumnData}
              onUpdateOutputColumnType={handleUpdateOutputColumnType}
            />

            <ActionButtons
              isGenerating={isGenerating}
              isTesting={isTesting}
              hasGeneratedCode={!!generatedCode}
              onGenerateCode={handleGenerateCode}
              onTestCode={handleTestGeneratedCode}
            />
          </div>
        </div>

        <GeneratedCode
          generatedCode={generatedCode}
          copied={copied}
          onCopy={copyCode}
          onDownload={downloadCode}
        />

        {testResults && (
          <TestResultsComponent
            testResults={testResults}
            outputTable={outputTable}
          />
        )}
      </div>


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
