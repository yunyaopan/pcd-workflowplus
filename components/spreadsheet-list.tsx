'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Spreadsheet } from '@/lib/database/types';

interface CreateSpreadsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
}

function CreateSpreadsheetModal({ isOpen, onClose, onCreate }: CreateSpreadsheetModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Create New Spreadsheet</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter spreadsheet name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Create
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SpreadsheetList() {
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchSpreadsheets = async () => {
    try {
      const response = await fetch('/api/spreadsheets');
      if (response.ok) {
        const data = await response.json();
        setSpreadsheets(data);
      }
    } catch (error) {
      console.error('Error fetching spreadsheets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpreadsheets();
  }, []);

  const handleCreateSpreadsheet = async (name: string, description?: string) => {
    try {
      const response = await fetch('/api/spreadsheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        const newSpreadsheet = await response.json();
        setSpreadsheets(prev => [newSpreadsheet, ...prev]);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
    }
  };

  const handleDeleteSpreadsheet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this spreadsheet?')) {
      return;
    }

    try {
      const response = await fetch(`/api/spreadsheets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSpreadsheets(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting spreadsheet:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading spreadsheets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus size={18} />
          New Spreadsheet
        </Button>
      </div>

      {spreadsheets.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500 mb-4">
            <Calendar size={48} className="mx-auto mb-2 opacity-50" />
            <p>No spreadsheets yet</p>
            <p className="text-sm">Create your first spreadsheet to get started</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            Create Spreadsheet
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {spreadsheets.map((spreadsheet) => (
            <Card key={spreadsheet.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg truncate">{spreadsheet.name}</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = `/spreadsheets/${spreadsheet.id}`}
                  >
                    <Edit3 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSpreadsheet(spreadsheet.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              
              {spreadsheet.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {spreadsheet.description}
                </p>
              )}
              
              <div className="text-xs text-gray-500">
                Created {formatDate(spreadsheet.created_at)}
              </div>
              
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = `/spreadsheets/${spreadsheet.id}`}
                  className="w-full"
                >
                  Open Spreadsheet
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateSpreadsheetModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateSpreadsheet}
      />
    </div>
  );
}
