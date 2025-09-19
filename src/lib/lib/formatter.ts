// 적응형 콘텐츠 포맷팅 시스템 - Gemini 설계에 따른 구현

import { callOpenAI } from './ai-clients/openai';

export type ContentFormat = 'DEFAULT' | 'TABLE' | 'TIMELINE' | 'CODE_BLOCK';

const FORMATTING_PROMPT = `
You are a content format specialist. Analyze the following text and determine the best way to visually present it.
Choose one format from this list: TABLE, TIMELINE, CODE_BLOCK, DEFAULT.

- Use TABLE for direct comparisons (pros/cons, features, specifications).
- Use TIMELINE for chronological events, historical sequences, or step-by-step processes.
- Use CODE_BLOCK for code snippets, programming examples, or technical configurations.
- Use DEFAULT for all other standard text content.

Return only the single best format name and nothing else.

Content: """
{content}
"""

Format:`;

export async function determineOptimalFormat(content: string): Promise<ContentFormat> {
  try {
    const prompt = FORMATTING_PROMPT.replace('{content}', content.substring(0, 1000)); // 처음 1000자만 분석
    
    // 빠른 모델을 사용하여 분류 작업 수행
    const result = await callOpenAI(prompt, 'gpt-4o-mini');
    const format = result.trim().toUpperCase() as ContentFormat;

    const validFormats: ContentFormat[] = ['TABLE', 'TIMELINE', 'CODE_BLOCK', 'DEFAULT'];
    if (validFormats.includes(format)) {
      return format;
    }
    return 'DEFAULT'; // 폴백
  } catch (error) {
    console.warn('Format determination failed, using DEFAULT:', error);
    return 'DEFAULT';
  }
}

// 테이블 형식 데이터 추출
export function extractTableData(content: string): {
  headers: string[];
  rows: string[][];
} {
  // 간단한 테이블 추출 로직 (실제로는 더 정교한 파싱 필요)
  const lines = content.split('\n').filter(line => line.trim());
  const tableLines = lines.filter(line => line.includes('|') || line.includes('\t'));
  
  if (tableLines.length === 0) {
    // 테이블이 없으면 기본 구조 생성
    return {
      headers: ['항목', '내용'],
      rows: [['분석 결과', content.substring(0, 200) + '...']]
    };
  }
  
  const headers = tableLines[0].split('|').map(h => h.trim()).filter(h => h);
  const rows = tableLines.slice(1).map(line => 
    line.split('|').map(cell => cell.trim()).filter(cell => cell)
  );
  
  return { headers, rows };
}

// 타임라인 형식 데이터 추출
export function extractTimelineData(content: string): {
  events: Array<{ date: string; event: string; }>;
} {
  // 날짜 패턴 찾기
  const datePattern = /(\d{4}[-년]\d{1,2}[-월]\d{1,2}일?|\d{1,2}[-월]\d{1,2}일?|\d{4}년|\d{1,2}월)/g;
  const lines = content.split('\n').filter(line => line.trim());
  
  const events: Array<{ date: string; event: string; }> = [];
  
  lines.forEach(line => {
    const dateMatch = line.match(datePattern);
    if (dateMatch) {
      events.push({
        date: dateMatch[0],
        event: line.replace(dateMatch[0], '').trim()
      });
    }
  });
  
  // 이벤트가 없으면 기본 구조 생성
  if (events.length === 0) {
    return {
      events: [
        { date: '현재', event: '분석 완료' },
        { date: '다음 단계', event: '실행 계획 수립' }
      ]
    };
  }
  
  return { events };
}

// 코드 블록 데이터 추출
export function extractCodeData(content: string): {
  code: string;
  language: string;
} {
  // 코드 블록 패턴 찾기
  const codeBlockPattern = /```(\w+)?\n([\s\S]*?)```/g;
  const match = codeBlockPattern.exec(content);
  
  if (match) {
    return {
      code: match[2].trim(),
      language: match[1] || 'javascript'
    };
  }
  
  // 인라인 코드 찾기
  const inlineCodePattern = /`([^`]+)`/g;
  const inlineMatches = content.match(inlineCodePattern);
  
  if (inlineMatches) {
    return {
      code: inlineMatches.join('\n').replace(/`/g, ''),
      language: 'text'
    };
  }
  
  // 코드가 없으면 전체 내용을 텍스트로 처리
  return {
    code: content,
    language: 'text'
  };
}

// 포맷에 따른 데이터 추출 통합 함수
export function extractFormattedData(content: string, format: ContentFormat): any {
  switch (format) {
    case 'TABLE':
      return extractTableData(content);
    case 'TIMELINE':
      return extractTimelineData(content);
    case 'CODE_BLOCK':
      return extractCodeData(content);
    default:
      return { content };
  }
}
