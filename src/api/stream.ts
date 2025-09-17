// Chunked Streaming API Implementation
export interface StreamChunk {
  id: string;
  content: string;
  timestamp: number;
  type: 'text' | 'data' | 'end';
}

export class StreamingAPI {
  private baseUrl: string;
  
  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async *streamResponse(query: string): AsyncGenerator<StreamChunk, void, unknown> {
    const response = await fetch(`${this.baseUrl}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Stream failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No readable stream available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          if (buffer.trim()) {
            yield {
              id: `chunk-${Date.now()}`,
              content: buffer,
              timestamp: Date.now(),
              type: 'text'
            };
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            yield {
              id: `chunk-${Date.now()}-${Math.random()}`,
              content: line,
              timestamp: Date.now(),
              type: 'text'
            };
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    yield {
      id: `end-${Date.now()}`,
      content: '',
      timestamp: Date.now(),
      type: 'end'
    };
  }

  async search(query: string): Promise<{ status: number; data: any; location?: string }> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    
    return {
      status: response.status,
      data,
      location: response.headers.get('Location') || undefined
    };
  }
}

export default StreamingAPI;

