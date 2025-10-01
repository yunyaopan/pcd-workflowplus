'use client';

import React, { Suspense } from 'react';
import { Plus } from 'lucide-react';
import { useLogicGenerator } from '@/lib/hooks/use-logic-generator';
import { generateCode, testGeneratedCode } from '@/lib/utils/code-generation';
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
  addInputParam,
  removeInputParam,
  updateInputParam,
  addOutputColumn,
  removeOutputColumn,
  addOutputRow,
  removeOutputRow,
  updateOutputCell,
  updateOutputColumnName,
} from '@/lib/utils/table-management';
import { Header } from '@/components/logic-generator/header';
import { InputTableComponent } from '@/components/logic-generator/input-table';
import { InputParameters } from '@/components/logic-generator/input-parameters';
import { OutputTableComponent } from '@/components/logic-generator/output-table';
import { ActionButtons } from '@/components/logic-generator/action-buttons';
import { GeneratedCode } from '@/components/logic-generator/generated-code';
import { TestResultsComponent } from '@/components/logic-generator/test-results';
import { ColumnTypeSelector } from '@/components/logic-generator/column-type-selector';
import { SaveModal } from '@/components/logic-generator/save-modal';

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
    columnMenuPosition,
    setColumnMenuPosition,
    isSaving,
    isLoading,
    saveError,
    setSaveError,
    loadError,
    setLoadError,
    showSaveModal,
    setShowSaveModal,
    saveName,
    setSaveName,
    saveDescription,
    setSaveDescription,
    
    // Actions
    testOpenRouterConnection,
    saveTransformation,
    loadTransformation,
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
    const newOutputTable = addOutputColumn(outputTable, newColumnType, newColumnOptions, newColumnLogic);
    setOutputTable(newOutputTable);
    setEditingColumnId(Date.now()); // Set the new column as editing
    setNewColumnType('text');
    setNewColumnOptions('');
    setNewColumnLogic('');
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

  const handleUpdateOutputTableName = (name: string) => {
    setOutputTable({ ...outputTable, name });
  };

  const handleUpdateOutputBaseLogic = (logic: string) => {
    setOutputTable({ ...outputTable, baseLogic: logic });
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

  const handleColumnMenuClick = (e: React.MouseEvent, tableId: number | 'output') => {
    const rect = e.currentTarget.getBoundingClientRect();
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
  };

  const handleSaveModalCancel = () => {
    setShowSaveModal(false);
    setSaveName('');
    setSaveDescription('');
    setSaveError(null);
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
          onTestConnection={testOpenRouterConnection}
          onShowSaveModal={() => setShowSaveModal(true)}
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
                  <InputTableComponent
                    key={table.id}
                    table={table}
                    editingColumnId={editingColumnId}
                    setEditingColumnId={setEditingColumnId}
                    onUpdateTableName={handleUpdateTableName}
                    onRemoveTable={handleRemoveInputTable}
                    onAddColumn={(tableId) => handleColumnMenuClick({ currentTarget: { getBoundingClientRect: () => ({ left: 0, bottom: 0 }) } } as any, tableId)}
                    onRemoveColumn={handleRemoveTableColumn}
                    onUpdateColumnName={handleUpdateInputTableColumnName}
                    onAddRow={handleAddTableRow}
                    onRemoveRow={handleRemoveTableRow}
                    onUpdateCell={handleUpdateTableCell}
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
            <OutputTableComponent
              outputTable={outputTable}
              editingColumnId={editingColumnId}
              setEditingColumnId={setEditingColumnId}
              onUpdateTableName={handleUpdateOutputTableName}
              onUpdateBaseLogic={handleUpdateOutputBaseLogic}
              onAddColumn={() => handleColumnMenuClick({ currentTarget: { getBoundingClientRect: () => ({ left: 0, bottom: 0 }) } } as any, 'output')}
              onRemoveColumn={handleRemoveOutputColumn}
              onUpdateColumnName={handleUpdateOutputColumnName}
              onAddRow={handleAddOutputRow}
              onRemoveRow={handleRemoveOutputRow}
              onUpdateCell={handleUpdateOutputCell}
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

      {/* Column Editor */}
      {addingColumnTo !== null && (
        <ColumnTypeSelector
          isOutput={addingColumnTo === 'output'}
          position={columnMenuPosition}
          newColumnType={newColumnType}
          setNewColumnType={setNewColumnType}
          newColumnOptions={newColumnOptions}
          setNewColumnOptions={setNewColumnOptions}
          newColumnLogic={newColumnLogic}
          setNewColumnLogic={setNewColumnLogic}
          onAdd={() => {
            if (addingColumnTo === 'output') {
              handleAddOutputColumn();
            } else {
              handleAddInputTableColumn(addingColumnTo);
            }
          }}
          onClose={handleCloseColumnMenu}
        />
      )}

      <SaveModal
        showSaveModal={showSaveModal}
        saveName={saveName}
        setSaveName={setSaveName}
        saveDescription={saveDescription}
        setSaveDescription={setSaveDescription}
        saveError={saveError}
        isSaving={isSaving}
        onSave={saveTransformation}
        onCancel={handleSaveModalCancel}
      />
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
