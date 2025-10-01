interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    finish_reason: string | null;
    message: {
      content: string | null;
      role: string;
    };
  }>;
  created: number;
  model: string;
  object: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenRouter API key not found. Please set NEXT_PUBLIC_OPENROUTER_API_KEY environment variable.');
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; model?: string }> {
    if (!this.apiKey) {
      return {
        success: false,
        message: 'API key is missing. Please set NEXT_PUBLIC_OPENROUTER_API_KEY environment variable.'
      };
    }

    const request: OpenRouterRequest = {
      model: 'deepseek/deepseek-chat-v3.1:free',
      messages: [
        {
          role: 'user',
          content: 'Hello! Please respond with "OpenRouter integration test successful"'
        }
      ],
      max_tokens: 50,
      temperature: 0.1,
      stream: false
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
          'X-Title': 'Workflow Plus Logic Generator'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: `API Error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`
        };
      }

      const data: OpenRouterResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        return {
          success: false,
          message: 'No response from OpenRouter API'
        };
      }

      const content = data.choices[0].message.content;
      if (!content) {
        return {
          success: false,
          message: 'Empty response from OpenRouter API'
        };
      }

      return {
        success: true,
        message: `✅ Connection successful! Model: ${data.model}`,
        model: data.model
      };
    } catch (error) {
      console.error('OpenRouter test error:', error);
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async generateCode(prompt: string, model: string = 'deepseek/deepseek-chat-v3.1:free'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required. Please set NEXT_PUBLIC_OPENROUTER_API_KEY environment variable.');
    }

    const request: OpenRouterRequest = {
      model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.1, // Lower temperature for more deterministic code generation
      stream: false
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
          'X-Title': 'Workflow Plus Logic Generator'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenRouter API');
      }

      const content = data.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from OpenRouter API');
      }

      return content;
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw error;
    }
  }

  async getAvailableModels(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
          'X-Title': 'Workflow Plus Logic Generator'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const openRouterClient = new OpenRouterClient();
