'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, FileText, Calendar, User, Building, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { SpreadsheetWithData } from '@/lib/database/types';

interface ContractData {
  id: string;
  rowId: string;
  spreadsheetId: string;
  data: Record<string, string>;
  columns: Array<{ id: string; name: string; data_type: string }>;
}

interface ContractDetailProps {
  contractId: string;
}

export function ContractDetail({ contractId }: ContractDetailProps) {
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContract = useCallback(async () => {
    try {
      // First, find the "Contracts" spreadsheet
      const spreadsheetsResponse = await fetch('/api/spreadsheets');
      if (spreadsheetsResponse.ok) {
        const spreadsheets = await spreadsheetsResponse.json();
        const contractsSpreadsheet = spreadsheets.find((s: any) => 
          s.name.toLowerCase().includes('contract')
        );
        
        if (contractsSpreadsheet) {
          // Get the full data for the contracts spreadsheet
          const dataResponse = await fetch(`/api/spreadsheets/${contractsSpreadsheet.id}/data`);
          if (dataResponse.ok) {
            const spreadsheetData = await dataResponse.json();
            
            // Find the specific contract row
            const contractRow = spreadsheetData.rows.find((row: any) => row.id === contractId);
            
            if (contractRow) {
              const contractData = contractRow.cells.reduce((acc: Record<string, string>, cell: any) => {
                const column = spreadsheetData.columns.find((col: any) => col.id === cell.column_id);
                if (column) {
                  acc[column.name] = cell.value || '';
                }
                return acc;
              }, {});

              setContract({
                id: contractId,
                rowId: contractRow.id,
                spreadsheetId: contractsSpreadsheet.id,
                data: contractData,
                columns: spreadsheetData.columns.map((col: any) => ({
                  id: col.id,
                  name: col.name,
                  data_type: col.data_type
                }))
              });
            } else {
              setError('Contract not found');
            }
          } else {
            setError('Failed to load contract data');
          }
        } else {
          setError('Contracts spreadsheet not found');
        }
      } else {
        setError('Failed to load spreadsheets');
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
      setError('An error occurred while loading the contract');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value: string) => {
    if (!value) return 'N/A';
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const getFieldIcon = (fieldName: string) => {
    const name = fieldName.toLowerCase();
    if (name.includes('date') || name.includes('time')) return <Calendar size={16} />;
    if (name.includes('client') || name.includes('customer') || name.includes('user')) return <User size={16} />;
    if (name.includes('company') || name.includes('organization')) return <Building size={16} />;
    if (name.includes('amount') || name.includes('price') || name.includes('cost') || name.includes('value')) return <DollarSign size={16} />;
    return <FileText size={16} />;
  };

  const getFieldValue = (fieldName: string, value: string) => {
    const name = fieldName.toLowerCase();
    if (name.includes('date') || name.includes('time')) return formatDate(value);
    if (name.includes('amount') || name.includes('price') || name.includes('cost') || name.includes('value')) return formatCurrency(value);
    return value || 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading contract...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => window.location.href = '/contracts'}>
          Back to Contracts
        </Button>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-500 mb-4">Contract not found</div>
        <Button onClick={() => window.location.href = '/contracts'}>
          Back to Contracts
        </Button>
      </div>
    );
  }

  const contractTitle = contract.data.title || contract.data.name || contract.data.contract_name || `Contract ${contract.id.slice(-8)}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/contracts'}
            className="mb-4"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Contracts
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{contractTitle}</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Contract Details */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Contract Details</h2>
              <div className="space-y-4">
                {contract.columns.map((column) => {
                  const value = contract.data[column.name];
                  if (!value) return null;
                  
                  return (
                    <div key={column.id} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1 text-gray-500">
                        {getFieldIcon(column.name)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700 capitalize">
                          {column.name.replace(/_/g, ' ')}
                        </div>
                        <div className="text-gray-900">
                          {getFieldValue(column.name, value)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = `/spreadsheets/${contract.spreadsheetId}`}
                  className="w-full justify-start"
                >
                  <FileText size={16} className="mr-2" />
                  Edit in Spreadsheet
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/contracts'}
                  className="w-full justify-start"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Contracts
                </Button>
              </div>
            </Card>
            
            {/* Contract Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contract Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Contract ID:</span>
                  <span className="font-mono text-xs">{contract.id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Row ID:</span>
                  <span className="font-mono text-xs">{contract.rowId.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fields:</span>
                  <span>{Object.keys(contract.data).length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
