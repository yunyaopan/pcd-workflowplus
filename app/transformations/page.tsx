'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Database, Settings } from 'lucide-react';
import { transformationsAPI } from '@/lib/api/transformations';
import { Transformation } from '@/lib/database/types';
import Link from 'next/link';

export default function TransformationsPage() {
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadTransformations();
  }, []);

  const loadTransformations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transformationsAPI.getTransformations();
      setTransformations(response.transformations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transformations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await transformationsAPI.deleteTransformation(id);
      setTransformations(transformations.filter(t => t.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transformation');
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transformations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Transformations</h1>
            <p className="text-gray-600">Manage your saved data transformation configurations</p>
          </div>
          <Link
            href="/logic-generator"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            <Plus size={20} />
            Create New Transformation
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <Settings size={20} />
              <span className="font-semibold">Error</span>
            </div>
            <p className="text-red-700 text-sm mt-2">{error}</p>
            <button
              onClick={loadTransformations}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Transformations Grid */}
        {transformations.length === 0 ? (
          <div className="text-center py-12">
            <Database size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No transformations yet</h3>
            <p className="text-gray-600 mb-6">Create your first transformation to get started</p>
            <Link
              href="/logic-generator"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
            >
              <Plus size={20} />
              Create Transformation
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transformations.map((transformation) => (
              <div key={transformation.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {transformation.name}
                    </h3>
                    {transformation.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {transformation.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Link
                      href={`/logic-generator?load=${transformation.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit transformation"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(transformation.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete transformation"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Database size={14} />
                    <span>{transformation.input_tables.length} input table{transformation.input_tables.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Settings size={14} />
                    <span>{transformation.input_params.length} parameter{transformation.input_params.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Database size={14} />
                    <span>{transformation.output_table.columns.length} output column{transformation.output_table.columns.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>Updated {formatDate(transformation.updated_at)}</span>
                  </div>
                  <Link
                    href={`/logic-generator?load=${transformation.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Edit →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Transformation</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this transformation? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
