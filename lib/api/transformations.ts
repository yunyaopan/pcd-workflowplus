import { 
  Transformation, 
  CreateTransformationRequest, 
  UpdateTransformationRequest 
} from '@/lib/database/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export class TransformationsAPI {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getTransformations(): Promise<{ transformations: Transformation[] }> {
    return this.request('/transformations');
  }

  async getTransformation(id: string): Promise<{ transformation: Transformation }> {
    return this.request(`/transformations/${id}`);
  }

  async createTransformation(data: CreateTransformationRequest): Promise<{ transformation: Transformation }> {
    return this.request('/transformations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTransformation(id: string, data: UpdateTransformationRequest): Promise<{ transformation: Transformation }> {
    return this.request(`/transformations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTransformation(id: string): Promise<{ success: boolean }> {
    return this.request(`/transformations/${id}`, {
      method: 'DELETE',
    });
  }
}

export const transformationsAPI = new TransformationsAPI();
