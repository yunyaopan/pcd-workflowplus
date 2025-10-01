import { openRouterClient } from '@/lib/api/openrouter';
import type { InputTable, InputParam, OutputTable, TestResults } from '@/lib/types/logic-generator';

export function buildPrompt(inputTables: InputTable[], inputParams: InputParam[], outputTable: OutputTable): string {
  const hasLLMColumns = outputTable.columns.some(col => col.isLLM);
  
  let prompt = `Generate a JavaScript function that transforms input data into output data based on the following specifications.

CRITICAL REQUIREMENTS:
- Generate ONLY pure JavaScript function code (ES6+), NO TypeScript
- Do NOT use TypeScript types, interfaces, or type annotations
- Do NOT wrap the code in markdown code blocks or backticks
- The function should be production-ready
- Include clear comments explaining the logic
- Handle edge cases gracefully
- The function name MUST be "transformData"
- The function signature MUST be: ${hasLLMColumns ? 'async function transformData({ inputTables, params }) { ... }' : 'function transformData({ inputTables, params }) { ... }'}
- Return an array of objects representing the output table
${hasLLMColumns ? `
- For LLM columns, use the provided openRouterClient to generate values
- The openRouterClient will be available as a global variable
- Use async/await for LLM column generation
- Handle LLM API errors gracefully` : `
- The function should be deterministic`}

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
    prompt += `\n${col.name} (${col.type})${col.isLLM ? ' [LLM-GENERATED]' : ''}:\n`;
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
${hasLLMColumns ? `
- For LLM columns, use: await openRouterClient.generateCode(prompt, 'deepseek/deepseek-chat-v3.1:free')
- The openRouterClient is available globally
- Handle LLM errors gracefully with try-catch blocks` : ''}

EXAMPLE STRUCTURE:
${hasLLMColumns ? 'async ' : ''}function transformData({ inputTables, params }) {
  const output = [];
  
  // Process each row
  for (const row of inputTables['TableName'] || []) {
    const outputRow = {};
    
    // Deterministic columns
    outputRow.deterministicColumn = /* your logic */;
    
    ${hasLLMColumns ? `// LLM columns
    try {
      const llmPrompt = \`Your prompt here using row data: \${row.someField}\`;
      outputRow.llmColumn = await openRouterClient.generateCode(llmPrompt, 'deepseek/deepseek-chat-v3.1:free');
    } catch (error) {
      outputRow.llmColumn = 'Error generating content';
    }` : ''}
    
    output.push(outputRow);
  }
  
  return output;
}`;

  return prompt;
}

export async function generateCode(inputTables: InputTable[], inputParams: InputParam[], outputTable: OutputTable): Promise<string> {
  if (!outputTable.name || outputTable.columns.length === 0) {
    throw new Error('Please define at least an output table name and one column');
  }

  const prompt = buildPrompt(inputTables, inputParams, outputTable);
  const code = await openRouterClient.generateCode(prompt, 'deepseek/deepseek-chat-v3.1:free');
  return code;
}

export async function testGeneratedCode(
  generatedCode: string,
  inputTables: InputTable[],
  inputParams: InputParam[],
  outputTable: OutputTable
): Promise<TestResults> {
  if (!generatedCode) {
    throw new Error('Please generate code first');
  }

  if (outputTable.rows.length === 0) {
    throw new Error('Please provide expected output data to test against');
  }

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
        return await transformData({ inputTables: inputData, params });
      `;
      const testFunction = new AsyncFunction('inputData', 'params', 'openRouterClient', wrappedCode);
      
      // Make openRouterClient available globally for LLM columns
      const actualOutput = await testFunction(inputData, params, openRouterClient);

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

      // Compare outputs, handling LLM columns differently
      let matches = true;
      let comparisonDetails = '';
      
      if (actualOutput.length !== expectedOutput.length) {
        matches = false;
        comparisonDetails = `Row count mismatch: expected ${expectedOutput.length}, got ${actualOutput.length}`;
      } else {
        for (let i = 0; i < actualOutput.length; i++) {
          const actualRow = actualOutput[i];
          const expectedRow = expectedOutput[i];
          
          for (const col of outputTable.columns) {
            const colName = col.name;
            const actualValue = actualRow[colName];
            const expectedValue = expectedRow[colName];
            
            if (col.isLLM) {
              // For LLM columns, just check that they're not empty/undefined
              if (!actualValue || actualValue === '' || actualValue === 'Error generating content') {
                matches = false;
                comparisonDetails = `LLM column '${colName}' in row ${i + 1} is empty or errored`;
                break;
              }
            } else {
              // For deterministic columns, do exact comparison
              if (actualValue !== expectedValue) {
                matches = false;
                comparisonDetails = `Column '${colName}' in row ${i + 1}: expected '${expectedValue}', got '${actualValue}'`;
                break;
              }
            }
          }
          if (!matches) break;
        }
      }
      
      return {
        success: matches,
        expected: expectedOutput,
        actual: actualOutput,
        message: matches 
          ? 'Test passed! Generated code produces expected output.' 
          : `Test failed. ${comparisonDetails}`
      };

    } catch (execError) {
      return {
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
      };
    }

  } catch (error) {
    console.error('Error testing code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Error during testing: ' + (error instanceof Error ? error.message : String(error))
    };
  }
}
