import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { provider } = request.body;
  const testPrompt = "안녕하세요. 간단한 테스트입니다.";

  try {
    let result: any = { provider, status: 'unknown' };

    switch (provider) {
      case 'openai':
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [{ role: 'user', content: testPrompt }],
              max_tokens: 50,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            result = {
              provider: 'openai',
              status: 'success',
              response: data.choices[0].message.content,
              usage: data.usage
            };
          } else {
            const errorData = await response.json().catch(() => ({}));
            result = {
              provider: 'openai',
              status: 'error',
              httpStatus: response.status,
              error: errorData
            };
          }
        } catch (error) {
          result = {
            provider: 'openai',
            status: 'exception',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
        break;

      case 'google':
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`;
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: testPrompt
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 50,
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            result = {
              provider: 'google',
              status: 'success',
              response: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response',
              usage: data.usageMetadata
            };
          } else {
            const errorData = await response.json().catch(() => ({}));
            result = {
              provider: 'google',
              status: 'error',
              httpStatus: response.status,
              error: errorData
            };
          }
        } catch (error) {
          result = {
            provider: 'google',
            status: 'exception',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
        break;

      case 'anthropic':
        try {
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.ANTHROPIC_API_KEY || '',
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 50,
              messages: [
                {
                  role: 'user',
                  content: testPrompt
                }
              ],
            }),
          });

          if (response.ok) {
            const data = await response.json();
            result = {
              provider: 'anthropic',
              status: 'success',
              response: data.content?.[0]?.text || 'No response',
              usage: data.usage
            };
          } else {
            const errorData = await response.json().catch(() => ({}));
            result = {
              provider: 'anthropic',
              status: 'error',
              httpStatus: response.status,
              error: errorData
            };
          }
        } catch (error) {
          result = {
            provider: 'anthropic',
            status: 'exception',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
        break;

      case 'xai':
        try {
          const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'grok-3',
              messages: [{ role: 'user', content: testPrompt }],
              max_tokens: 50,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            result = {
              provider: 'xai',
              status: 'success',
              response: data.choices?.[0]?.message?.content || 'No response',
              usage: data.usage
            };
          } else {
            const errorData = await response.json().catch(() => ({}));
            result = {
              provider: 'xai',
              status: 'error',
              httpStatus: response.status,
              error: errorData
            };
          }
        } catch (error) {
          result = {
            provider: 'xai',
            status: 'exception',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
        break;

      default:
        result = {
          provider: provider || 'unknown',
          status: 'unsupported',
          error: 'Unsupported provider'
        };
    }

    return response.status(200).json({
      success: true,
      result,
      environment: {
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        hasGoogle: !!process.env.GOOGLE_API_KEY,
        hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
        hasXAI: !!process.env.XAI_API_KEY,
        openaiPrefix: process.env.OPENAI_API_KEY?.substring(0, 6) || 'none',
        googlePrefix: process.env.GOOGLE_API_KEY?.substring(0, 6) || 'none',
        anthropicPrefix: process.env.ANTHROPIC_API_KEY?.substring(0, 6) || 'none',
        xaiPrefix: process.env.XAI_API_KEY?.substring(0, 6) || 'none',
      }
    });

  } catch (error) {
    return response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: provider || 'unknown'
    });
  }
}
