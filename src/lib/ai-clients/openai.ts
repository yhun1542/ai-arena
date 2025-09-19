const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callOpenAI(prompt: string, model: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const requestBody = {
    model: model,
    messages: [
      {
        role: 'user' as const,
        content: prompt
      }
    ],
    max_tokens: 4000,
    temperature: 0.7,
    top_p: 0.9,
    frequency_penalty: 0.1,
    presence_penalty: 0.1
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API call failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: OpenAIResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response choices returned from OpenAI');
    }

    const content = data.choices[0].message.content;
    
    if (!content) {
      throw new Error('Empty content returned from OpenAI');
    }

    console.log(`✅ OpenAI ${model} 응답 완료 (${data.usage?.total_tokens || 0} tokens)`);
    
    return content;

  } catch (error) {
    console.error('❌ OpenAI API 호출 실패:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Unknown error occurred while calling OpenAI API');
  }
}
