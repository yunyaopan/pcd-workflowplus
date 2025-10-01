import type { InputTable, InputParam, OutputTable, Column, DataType } from '@/lib/types/logic-generator';

// Input Tables Management
export function addInputTable(inputTables: InputTable[]): InputTable[] {
  return [...inputTables, { id: Date.now(), name: 'New Table', columns: [], rows: [] }];
}

export function removeInputTable(inputTables: InputTable[], id: number): InputTable[] {
  return inputTables.filter(t => t.id !== id);
}

export function updateTableName(inputTables: InputTable[], id: number, name: string): InputTable[] {
  return inputTables.map(t => t.id === id ? { ...t, name } : t);
}

export function addInputTableColumn(
  inputTables: InputTable[], 
  tableId: number, 
  newColumnType: DataType, 
  newColumnOptions: string
): InputTable[] {
  return inputTables.map(t => {
    if (t.id === tableId) {
      const newCol: Column = { 
        id: Date.now(), 
        name: 'New Column', 
        type: newColumnType,
        ...(newColumnType === 'select' && { options: newColumnOptions.split(',').map(o => o.trim()).filter(o => o) })
      };
      const newRows = t.rows.map(row => ({ 
        ...row, 
        [newCol.id]: newColumnType === 'boolean' ? false : newColumnType === 'number' ? '0' : '' 
      }));
      return { ...t, columns: [...t.columns, newCol], rows: newRows };
    }
    return t;
  });
}

export function removeTableColumn(inputTables: InputTable[], tableId: number, colId: number): InputTable[] {
  return inputTables.map(t => {
    if (t.id === tableId) {
      const newRows = t.rows.map(row => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [colId]: _unused, ...rest } = row;
        return rest;
      });
      return { ...t, columns: t.columns.filter(c => c.id !== colId), rows: newRows };
    }
    return t;
  });
}

export function addTableRow(inputTables: InputTable[], tableId: number): InputTable[] {
  return inputTables.map(t => {
    if (t.id === tableId) {
      const newRow: Record<string, unknown> = { id: Date.now() };
      t.columns.forEach(col => {
        newRow[col.id] = col.type === 'boolean' ? false : col.type === 'number' ? '0' : '';
      });
      return { ...t, rows: [...t.rows, newRow] };
    }
    return t;
  });
}

export function removeTableRow(inputTables: InputTable[], tableId: number, rowId: number): InputTable[] {
  return inputTables.map(t => 
    t.id === tableId 
      ? { ...t, rows: t.rows.filter(r => r.id !== rowId) }
      : t
  );
}

export function updateTableCell(
  inputTables: InputTable[], 
  tableId: number, 
  rowId: number, 
  colId: number, 
  value: unknown
): InputTable[] {
  return inputTables.map(t => {
    if (t.id === tableId) {
      return {
        ...t,
        rows: t.rows.map(r => 
          r.id === rowId ? { ...r, [colId]: value } : r
        )
      };
    }
    return t;
  });
}

export function updateInputTableColumnName(
  inputTables: InputTable[], 
  tableId: number, 
  colId: number, 
  name: string
): InputTable[] {
  return inputTables.map(t => 
    t.id === tableId 
      ? { ...t, columns: t.columns.map(c => c.id === colId ? { ...c, name } : c) }
      : t
  );
}

export function updateInputTableColumnType(
  inputTables: InputTable[], 
  tableId: number, 
  colId: number, 
  type: DataType,
  options?: string[]
): InputTable[] {
  return inputTables.map(t => {
    if (t.id === tableId) {
      const updatedColumns = t.columns.map(c => 
        c.id === colId 
          ? { 
              ...c, 
              type, 
              ...(type === 'select' && options ? { options } : type !== 'select' ? { options: undefined } : {})
            } 
          : c
      );
      
      // Update existing cell values to match new type
      const updatedRows = t.rows.map(row => {
        const currentValue = row[colId];
        let newValue: unknown;
        
        if (type === 'boolean') {
          newValue = typeof currentValue === 'boolean' ? currentValue : false;
        } else if (type === 'number') {
          newValue = typeof currentValue === 'number' || !isNaN(Number(currentValue)) ? String(currentValue) : '0';
        } else if (type === 'select') {
          newValue = options && options.includes(String(currentValue)) ? currentValue : (options?.[0] || '');
        } else {
          newValue = String(currentValue || '');
        }
        
        return { ...row, [colId]: newValue };
      });
      
      return { ...t, columns: updatedColumns, rows: updatedRows };
    }
    return t;
  });
}

// Input Parameters Management
export function addInputParam(inputParams: InputParam[]): InputParam[] {
  return [...inputParams, { 
    id: Date.now(), 
    name: 'parameter', 
    type: 'text', 
    value: '',
    description: '' 
  }];
}

export function removeInputParam(inputParams: InputParam[], id: number): InputParam[] {
  return inputParams.filter(p => p.id !== id);
}

export function updateInputParam(inputParams: InputParam[], id: number, field: string, value: string): InputParam[] {
  return inputParams.map(p => p.id === id ? { ...p, [field]: value } : p);
}

// Output Table Management
export function addOutputColumn(
  outputTable: OutputTable, 
  newColumnType: DataType, 
  newColumnOptions: string, 
  newColumnLogic: string,
  newColumnIsLLM: boolean = false
): OutputTable {
  const newCol: Column = { 
    id: Date.now(), 
    name: 'New Column', 
    type: newColumnType, 
    logic: newColumnLogic,
    isLLM: newColumnIsLLM,
    ...(newColumnType === 'select' && { options: newColumnOptions.split(',').map(o => o.trim()).filter(o => o) })
  };
  const newRows = outputTable.rows.map(row => ({ 
    ...row, 
    [newCol.id]: newColumnType === 'boolean' ? false : newColumnType === 'number' ? '0' : '' 
  }));
  return {
    ...outputTable,
    columns: [...outputTable.columns, newCol],
    rows: newRows
  };
}

export function removeOutputColumn(outputTable: OutputTable, colId: number): OutputTable {
  const newRows = outputTable.rows.map(row => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [colId]: _unused, ...rest } = row;
    return rest;
  });
  return {
    ...outputTable,
    columns: outputTable.columns.filter(c => c.id !== colId),
    rows: newRows
  };
}

export function addOutputRow(outputTable: OutputTable): OutputTable {
  const newRow: Record<string, unknown> = { id: Date.now() };
  outputTable.columns.forEach(col => {
    newRow[col.id] = col.type === 'boolean' ? false : col.type === 'number' ? '0' : '';
  });
  return {
    ...outputTable,
    rows: [...outputTable.rows, newRow]
  };
}

export function removeOutputRow(outputTable: OutputTable, rowId: number): OutputTable {
  return {
    ...outputTable,
    rows: outputTable.rows.filter(r => r.id !== rowId)
  };
}

export function updateOutputCell(outputTable: OutputTable, rowId: number, colId: number, value: unknown): OutputTable {
  return {
    ...outputTable,
    rows: outputTable.rows.map(r => 
      r.id === rowId ? { ...r, [colId]: value } : r
    )
  };
}

export function updateOutputColumnName(outputTable: OutputTable, colId: number, name: string): OutputTable {
  return {
    ...outputTable,
    columns: outputTable.columns.map(c => c.id === colId ? { ...c, name } : c)
  };
}

export function toggleOutputColumnLLM(outputTable: OutputTable, colId: number): OutputTable {
  return {
    ...outputTable,
    columns: outputTable.columns.map(c => c.id === colId ? { ...c, isLLM: !c.isLLM } : c)
  };
}

export function updateOutputTableColumnType(
  outputTable: OutputTable, 
  colId: number, 
  type: DataType,
  logic?: string,
  options?: string[]
): OutputTable {
  const updatedColumns = outputTable.columns.map(c => 
    c.id === colId 
      ? { 
          ...c, 
          type, 
          logic,
          ...(type === 'select' && options ? { options } : type !== 'select' ? { options: undefined } : {})
        } 
      : c
  );
  
  // Update existing cell values to match new type
  const updatedRows = outputTable.rows.map(row => {
    const currentValue = row[colId];
    let newValue: unknown;
    
    if (type === 'boolean') {
      newValue = typeof currentValue === 'boolean' ? currentValue : false;
    } else if (type === 'number') {
      newValue = typeof currentValue === 'number' || !isNaN(Number(currentValue)) ? String(currentValue) : '0';
    } else if (type === 'select') {
      newValue = options && options.includes(String(currentValue)) ? currentValue : (options?.[0] || '');
    } else {
      newValue = String(currentValue || '');
    }
    
    return { ...row, [colId]: newValue };
  });
  
  return {
    ...outputTable,
    columns: updatedColumns,
    rows: updatedRows
  };
}
