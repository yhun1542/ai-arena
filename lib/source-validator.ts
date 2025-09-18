// 증거 기반 소싱(EBS) 알고리즘 - Gemini 설계에 따른 구현

export interface Source {
  id: number;
  url: string;
  isValid?: boolean;
  trustScore?: number;
  domainType?: 'Academic' | 'Government' | 'News' | 'Other';
}

// 텍스트에서 [Source N: URL] 패턴을 추출하는 함수
export function extractSources(text: string): Source[] {
  const sources: Source[] = [];
  const regex = /\[Source\s*(\d+):\s*(https?:\/\/[^\s\]]+)\]/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    sources.push({
      id: parseInt(match[1], 10),
      url: match[2],
    });
  }
  
  // 중복 제거
  const uniqueSources = sources.filter((source, index, self) => 
    index === self.findIndex(s => s.url === source.url)
  );
  
  return uniqueSources;
}

// 도메인 신뢰도를 평가하는 규칙
function getDomainScore(url: string): { score: number; type: Source['domainType'] } {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    
    // 정부/교육 기관 (최고 신뢰도)
    if (domain.endsWith('.gov') || domain.endsWith('.edu') || domain.endsWith('ac.kr')) {
      return { score: 3, type: 'Government' };
    }
    
    // 학술 기관 (최고 신뢰도)
    if (domain.includes('arxiv.org') || domain.includes('nature.com') || 
        domain.includes('science.org') || domain.includes('pubmed.ncbi.nlm.nih.gov')) {
      return { score: 3, type: 'Academic' };
    }
    
    // 주요 뉴스 기관 (높은 신뢰도)
    if (domain.includes('reuters.com') || domain.includes('apnews.com') || 
        domain.includes('bbc.com') || domain.includes('nytimes.com') ||
        domain.includes('wsj.com') || domain.includes('ft.com')) {
      return { score: 2, type: 'News' };
    }
    
    // 일반 도메인 (보통 신뢰도)
    return { score: 1, type: 'Other' };
  } catch {
    return { score: 0, type: 'Other' };
  }
}

// URL의 유효성과 신뢰도를 검증하는 메인 함수
export async function validateAndScoreSources(sources: Source[]): Promise<Source[]> {
  const validationPromises = sources.map(async (source) => {
    try {
      // 1. 접근성 검사 (깨진 링크 확인)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
      
      const response = await fetch(source.url, { 
        method: 'HEAD', 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SynapseBot/1.0)'
        }
      });
      
      clearTimeout(timeoutId);
      source.isValid = response.ok;

      if (source.isValid) {
        // 2. 도메인 권위 평가
        const { score, type } = getDomainScore(source.url);
        source.trustScore = score;
        source.domainType = type;
        
        // 3. 최신성 평가 (Last-Modified 헤더 확인)
        const lastModified = response.headers.get('last-modified');
        if (lastModified) {
          const modifiedDate = new Date(lastModified);
          const now = new Date();
          const daysDiff = (now.getTime() - modifiedDate.getTime()) / (1000 * 60 * 60 * 24);
          
          // 최신성에 따른 가산점
          if (daysDiff <= 365) { // 1년 이내
            source.trustScore += 2;
          } else if (daysDiff <= 1095) { // 3년 이내
            source.trustScore += 1;
          }
        }
      } else {
        source.trustScore = 0;
      }
    } catch (error) {
      console.warn(`Source validation failed for ${source.url}:`, error);
      source.isValid = false;
      source.trustScore = 0;
      source.domainType = 'Other';
    }
    
    return source;
  });

  const validatedSources = await Promise.all(validationPromises);
  
  // 신뢰도 점수 순으로 정렬
  return validatedSources.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
}

// 출처 목록을 사용자 친화적인 형태로 포맷팅
export function formatSourcesForDisplay(sources: Source[]): Array<{
  url: string;
  domain: string;
  trustLevel: 'High' | 'Medium' | 'Low';
  icon: string;
  isValid: boolean;
}> {
  return sources.map(source => {
    const domain = new URL(source.url).hostname;
    const trustScore = source.trustScore || 0;
    
    let trustLevel: 'High' | 'Medium' | 'Low' = 'Low';
    let icon = '🌐';
    
    if (trustScore >= 3) {
      trustLevel = 'High';
      icon = source.domainType === 'Government' ? '🏛️' : 
             source.domainType === 'Academic' ? '🎓' : '📰';
    } else if (trustScore >= 2) {
      trustLevel = 'Medium';
      icon = '📰';
    }
    
    return {
      url: source.url,
      domain,
      trustLevel,
      icon,
      isValid: source.isValid || false
    };
  });
}
