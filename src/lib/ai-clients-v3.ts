// Synapse v3 - 완전한 AI 클라이언트 시스템

interface AIResponse {
  content: string;
  model: string;
  provider: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: {
    finishReason: string;
    responseTime: number;
  };
}

interface AIClientConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

// OpenAI 클라이언트
export class OpenAIClient {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }
  }

  async call(prompt: string, config: AIClientConfig): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: config.temperature || 0.7,
          max_tokens: config.maxTokens || 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        content: data.choices[0].message.content,
        model: config.model,
        provider: 'openai',
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        metadata: {
          finishReason: data.choices[0].finish_reason,
          responseTime,
        },
      };
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }
}

// Google Gemini 클라이언트
export class GeminiClient {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor() {
    this.apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Google Gemini API key is not configured');
    }
  }

  async call(prompt: string, config: AIClientConfig): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const modelName = config.model.includes('gemini') ? config.model : 'gemini-1.5-pro';
      const url = `${this.baseUrl}/${modelName}:generateContent?key=${this.apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: config.temperature || 0.7,
            maxOutputTokens: config.maxTokens || 2000,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid Gemini API response structure');
      }

      return {
        content: data.candidates[0].content.parts[0].text,
        model: config.model,
        provider: 'google',
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0,
        },
        metadata: {
          finishReason: data.candidates[0].finishReason || 'STOP',
          responseTime,
        },
      };
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw error;
    }
  }
}

// Anthropic Claude 클라이언트
export class ClaudeClient {
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1/messages';

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Anthropic Claude API key is not configured');
    }
  }

  async call(prompt: string, config: AIClientConfig): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: config.maxTokens || 2000,
          temperature: config.temperature || 0.7,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        content: data.content[0].text,
        model: config.model,
        provider: 'anthropic',
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
        metadata: {
          finishReason: data.stop_reason || 'end_turn',
          responseTime,
        },
      };
    } catch (error) {
      console.error('Claude API call failed:', error);
      throw error;
    }
  }
}

// xAI Grok 클라이언트
export class GrokClient {
  private apiKey: string;
  private baseUrl = 'https://api.x.ai/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.XAI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('xAI Grok API key is not configured');
    }
  }

  async call(prompt: string, config: AIClientConfig): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: config.temperature || 0.7,
          max_tokens: config.maxTokens || 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Grok API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        content: data.choices[0].message.content,
        model: config.model,
        provider: 'xai',
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        metadata: {
          finishReason: data.choices[0].finish_reason,
          responseTime,
        },
      };
    } catch (error) {
      console.error('Grok API call failed:', error);
      throw error;
    }
  }
}

// AI 클라이언트 팩토리
export class AIClientFactory {
  private static clients: Map<string, any> = new Map();

  static getClient(provider: string): any {
    if (!this.clients.has(provider)) {
      switch (provider) {
        case 'openai':
          this.clients.set(provider, new OpenAIClient());
          break;
        case 'google':
          this.clients.set(provider, new GeminiClient());
          break;
        case 'anthropic':
          this.clients.set(provider, new ClaudeClient());
          break;
        case 'xai':
          this.clients.set(provider, new GrokClient());
          break;
        default:
          throw new Error(`Unsupported AI provider: ${provider}`);
      }
    }
    return this.clients.get(provider);
  }

  static async callAI(provider: string, model: string, prompt: string, config?: Partial<AIClientConfig>): Promise<AIResponse> {
    const client = this.getClient(provider);
    const fullConfig: AIClientConfig = {
      model,
      temperature: 0.7,
      maxTokens: 2000,
      timeout: 30000,
      ...config,
    };

    return await client.call(prompt, fullConfig);
  }
}

// 모든 AI 모델 병렬 호출 유틸리티
export async function callAllAIs(
  prompt: string,
  models: { [provider: string]: string },
  config?: Partial<AIClientConfig>
): Promise<{ [provider: string]: AIResponse }> {
  const promises = Object.entries(models).map(async ([provider, model]) => {
    try {
      const response = await AIClientFactory.callAI(provider, model, prompt, config);
      return [provider, response];
    } catch (error) {
      console.error(`Failed to call ${provider}:`, error);
      // 실패한 경우 fallback 응답 생성
      return [provider, {
        content: `[${provider.toUpperCase()} 오류] API 호출에 실패했습니다. 네트워크 연결이나 API 키를 확인해주세요.`,
        model: model,
        provider: provider,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        metadata: { finishReason: 'error', responseTime: 0 },
      } as AIResponse];
    }
  });

  const results = await Promise.all(promises);
  return Object.fromEntries(results);
}
