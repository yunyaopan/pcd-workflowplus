'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, Calendar, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { SpreadsheetWithData } from '@/lib/database/types';

interface Contract {
  id: string;
  rowId: string;
  data: Record<string, string>;
}

export function ContractsList() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [contractsSpreadsheet, setContractsSpreadsheet] = useState<SpreadsheetWithData | null>(null);

  const fetchContracts = useCallback(async () => {
    try {
      // First, find the "Contracts" spreadsheet
      const spreadsheetsResponse = await fetch('/api/spreadsheets');
      if (spreadsheetsResponse.ok) {
        const spreadsheets = await spreadsheetsResponse.json();
        const contractsSpreadsheet = spreadsheets.find((s: { id: string; name: string }) => 
          s.name.toLowerCase().includes('contract')
        );
        
        if (contractsSpreadsheet) {
          // Get the full data for the contracts spreadsheet
          const dataResponse = await fetch(`/api/spreadsheets/${contractsSpreadsheet.id}/data`);
          if (dataResponse.ok) {
            const spreadsheetData = await dataResponse.json();
            setContractsSpreadsheet(spreadsheetData);
            
            // Convert rows to contracts
            const contractsData = spreadsheetData.rows.map((row: { id: string; cells: Array<{ column_id: string; value?: string }> }) => ({
              id: row.id,
              rowId: row.id,
              data: row.cells.reduce((acc: Record<string, string>, cell: { column_id: string; value?: string }) => {
                const column = spreadsheetData.columns.find((col: { id: string; name: string }) => col.id === cell.column_id);
                if (column) {
                  acc[column.name] = cell.value || '';
                }
                return acc;
              }, {})
            }));
            
            setContracts(contractsData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getContractTitle = (contract: Contract) => {
    // Try to find common title fields
    const titleFields = ['title', 'name', 'contract_name', 'contract_title', 'subject'];
    for (const field of titleFields) {
      if (contract.data[field]) {
        return contract.data[field];
      }
    }
    return `Contract ${contract.id.slice(-8)}`;
  };

  const getContractStatus = (contract: Contract) => {
    const statusFields = ['status', 'state', 'contract_status'];
    for (const field of statusFields) {
      if (contract.data[field]) {
        return contract.data[field];
      }
    }
    return 'Unknown';
  };

  const getContractDate = (contract: Contract) => {
    const dateFields = ['date', 'created_date', 'start_date', 'contract_date', 'created_at'];
    for (const field of dateFields) {
      if (contract.data[field]) {
        return contract.data[field];
      }
    }
    return null;
  };

  const getContractClient = (contract: Contract) => {
    const clientFields = ['client', 'client_name', 'customer', 'customer_name', 'company'];
    for (const field of clientFields) {
      if (contract.data[field]) {
        return contract.data[field];
      }
    }
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading contracts...</div>
      </div>
    );
  }

  if (!contractsSpreadsheet) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500 mb-4">
          <FileText size={48} className="mx-auto mb-2 opacity-50" />
          <p>No Contracts spreadsheet found</p>
          <p className="text-sm">Create a spreadsheet named &quot;Contracts&quot; to view contracts here</p>
        </div>
        <Button onClick={() => window.location.href = '/spreadsheets'}>
          Go to Spreadsheets
        </Button>
      </Card>
    );
  }

  if (contracts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500 mb-4">
          <FileText size={48} className="mx-auto mb-2 opacity-50" />
          <p>No contracts found</p>
          <p className="text-sm">Add some rows to your Contracts spreadsheet to see them here</p>
        </div>
        <Button onClick={() => window.location.href = `/spreadsheets/${contractsSpreadsheet.id}`}>
          Open Contracts Spreadsheet
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contracts.map((contract) => (
          <Card key={contract.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg truncate pr-2">
                {getContractTitle(contract)}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = `/contracts/${contract.id}`}
              >
                <Eye size={16} />
              </Button>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User size={14} />
                <span className="truncate">{getContractClient(contract)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{formatDate(getContractDate(contract) || '')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  getContractStatus(contract).toLowerCase() === 'active' ? 'bg-green-500' :
                  getContractStatus(contract).toLowerCase() === 'pending' ? 'bg-yellow-500' :
                  getContractStatus(contract).toLowerCase() === 'completed' ? 'bg-blue-500' :
                  'bg-gray-500'
                }`} />
                <span>{getContractStatus(contract)}</span>
              </div>
            </div>
            
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = `/contracts/${contract.id}`}
                className="w-full"
              >
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="text-center text-sm text-gray-500">
        Showing {contracts.length} contract{contracts.length !== 1 ? 's' : ''} from &quot;{contractsSpreadsheet.name}&quot; spreadsheet
      </div>
    </div>
  );
}
