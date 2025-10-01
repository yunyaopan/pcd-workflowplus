import { AlertCircle } from 'lucide-react';
import type { TestResults, OutputTable } from '@/lib/types/logic-generator';

interface TestResultsProps {
  testResults: TestResults;
  outputTable: OutputTable;
}

export function TestResultsComponent({ testResults, outputTable }: TestResultsProps) {
  return (
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
  );
}
