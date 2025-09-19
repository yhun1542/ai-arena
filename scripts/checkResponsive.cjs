#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 색상 출력을 위한 ANSI 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}${colors.bright}📱 AI Arena - CSS 반응형 디자인 점검 스크립트${colors.reset}`);
console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

/**
 * CSS 파일을 찾는 함수
 */
function findCSSFiles(dir, cssFiles = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // node_modules와 .git 디렉토리는 제외
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
        findCSSFiles(filePath, cssFiles);
      }
    } else if (file.endsWith('.css') || file.endsWith('.scss') || file.endsWith('.sass')) {
      cssFiles.push(filePath);
    }
  }
  
  return cssFiles;
}

/**
 * TypeScript/JSX 파일에서 인라인 스타일과 Tailwind 클래스 찾기
 */
function findStyleFiles(dir, styleFiles = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
        findStyleFiles(filePath, styleFiles);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.js')) {
      styleFiles.push(filePath);
    }
  }
  
  return styleFiles;
}

/**
 * CSS 내용 분석
 */
function analyzeCSS(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  const suggestions = [];
  
  // 1. 고정 픽셀 단위 검사
  const pxMatches = content.match(/(\w+):\s*(\d+)px/g);
  if (pxMatches) {
    const problematicPx = pxMatches.filter(match => {
      // font-size, width, height, margin, padding 등에서 큰 픽셀 값
      const value = parseInt(match.match(/(\d+)px/)[1]);
      return value > 16; // 16px보다 큰 값들을 문제로 간주
    });
    
    if (problematicPx.length > 0) {
      issues.push(`고정 픽셀 단위 사용: ${problematicPx.length}개 발견`);
      suggestions.push('큰 픽셀 값을 rem, %, vw/vh 등 상대 단위로 변경 권장');
    }
  }
  
  // 2. 미디어 쿼리 검사
  const mediaQueries = content.match(/@media[^{]+{[^}]*}/g);
  const hasResponsiveQueries = mediaQueries && mediaQueries.some(query => 
    query.includes('max-width') || query.includes('min-width')
  );
  
  if (!hasResponsiveQueries) {
    issues.push('반응형 미디어 쿼리 없음');
    suggestions.push('@media (max-width: 768px) 등 모바일 대응 스타일 추가 필요');
  }
  
  // 3. 고정 너비 검사
  const fixedWidths = content.match(/width:\s*(\d{3,})px/g);
  if (fixedWidths) {
    issues.push(`고정 너비 사용: ${fixedWidths.length}개 발견`);
    suggestions.push('고정 너비를 max-width, %, vw 등으로 변경 권장');
  }
  
  // 4. overflow 처리 검사
  const hasOverflowHandling = content.includes('overflow') || content.includes('text-overflow');
  if (!hasOverflowHandling && content.length > 500) {
    issues.push('overflow 처리 없음');
    suggestions.push('긴 텍스트나 큰 요소에 대한 overflow 처리 추가 권장');
  }
  
  // 5. Flexbox/Grid 사용 검사
  const hasModernLayout = content.includes('display: flex') || 
                          content.includes('display: grid') ||
                          content.includes('flex-direction') ||
                          content.includes('grid-template');
  
  if (!hasModernLayout && content.length > 200) {
    suggestions.push('Flexbox나 CSS Grid 사용으로 반응형 레이아웃 개선 권장');
  }
  
  return { issues, suggestions, mediaQueries: mediaQueries || [] };
}

/**
 * Tailwind 클래스 분석
 */
function analyzeTailwindClasses(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  const suggestions = [];
  
  // Tailwind 클래스 패턴 찾기
  const classMatches = content.match(/className=["'][^"']*["']/g);
  if (!classMatches) return { issues, suggestions };
  
  const allClasses = classMatches.join(' ');
  
  // 1. 반응형 접두사 검사
  const hasResponsiveClasses = /\b(sm:|md:|lg:|xl:|2xl:)/.test(allClasses);
  if (!hasResponsiveClasses) {
    issues.push('Tailwind 반응형 클래스 없음');
    suggestions.push('sm:, md:, lg: 등 반응형 접두사 사용 권장');
  }
  
  // 2. 고정 크기 클래스 검사
  const fixedSizeClasses = allClasses.match(/\b(w-\d+|h-\d+|text-\d+xl|p-\d{2,}|m-\d{2,})\b/g);
  if (fixedSizeClasses && fixedSizeClasses.length > 5) {
    issues.push(`고정 크기 Tailwind 클래스: ${fixedSizeClasses.length}개 발견`);
    suggestions.push('w-full, h-auto, text-responsive 등 유연한 클래스 사용 권장');
  }
  
  // 3. 모바일 우선 설계 검사
  const mobileFirstPattern = /\b(w-full|flex-col|text-center|px-4|py-2)\b/;
  if (!mobileFirstPattern.test(allClasses)) {
    suggestions.push('모바일 우선(Mobile-First) 설계 적용 권장');
  }
  
  return { issues, suggestions };
}

/**
 * 반응형 디자인 권장사항 생성
 */
function generateRecommendations(allIssues, allSuggestions) {
  const recommendations = [];
  
  // 공통 문제 패턴 분석
  const commonIssues = {};
  allIssues.forEach(issue => {
    const key = issue.split(':')[0];
    commonIssues[key] = (commonIssues[key] || 0) + 1;
  });
  
  if (commonIssues['고정 픽셀 단위 사용'] > 0) {
    recommendations.push({
      priority: 'HIGH',
      title: '고정 픽셀 단위 개선',
      description: 'px 단위를 rem, %, vw/vh로 변경',
      example: 'width: 320px → width: 100% 또는 width: 20rem'
    });
  }
  
  if (commonIssues['반응형 미디어 쿼리 없음'] > 0) {
    recommendations.push({
      priority: 'HIGH',
      title: '미디어 쿼리 추가',
      description: '모바일, 태블릿, 데스크톱 대응 스타일 분리',
      example: '@media (max-width: 768px) { .container { padding: 1rem; } }'
    });
  }
  
  if (commonIssues['Tailwind 반응형 클래스 없음'] > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      title: 'Tailwind 반응형 클래스 활용',
      description: '화면 크기별 스타일 적용',
      example: 'className="w-full md:w-1/2 lg:w-1/3"'
    });
  }
  
  return recommendations;
}

/**
 * 자동 수정 함수
 */
function autoFixCSS(filePath, dryRun = true) {
  const content = fs.readFileSync(filePath, 'utf8');
  let fixedContent = content;
  const fixes = [];
  
  // 1. 큰 픽셀 값을 rem으로 변경
  fixedContent = fixedContent.replace(/(\w+):\s*(\d{2,})px/g, (match, property, value) => {
    const numValue = parseInt(value);
    if (numValue >= 16 && ['width', 'height', 'font-size', 'margin', 'padding'].some(prop => property.includes(prop))) {
      const remValue = (numValue / 16).toFixed(2);
      fixes.push(`${property}: ${value}px → ${property}: ${remValue}rem`);
      return `${property}: ${remValue}rem`;
    }
    return match;
  });
  
  // 2. 고정 너비에 max-width 추가
  fixedContent = fixedContent.replace(/width:\s*(\d{3,})px/g, (match, value) => {
    fixes.push(`width: ${value}px → max-width: ${value}px; width: 100%`);
    return `max-width: ${value}px; width: 100%`;
  });
  
  // 3. 기본 미디어 쿼리 추가 (파일에 없는 경우)
  if (!content.includes('@media') && content.length > 100) {
    const mediaQuery = `\n\n/* 모바일 대응 스타일 */\n@media (max-width: 768px) {\n  /* 모바일용 스타일을 여기에 추가하세요 */\n}\n\n@media (max-width: 480px) {\n  /* 작은 모바일용 스타일을 여기에 추가하세요 */\n}`;
    fixedContent += mediaQuery;
    fixes.push('기본 미디어 쿼리 추가');
  }
  
  if (!dryRun && fixes.length > 0) {
    fs.writeFileSync(filePath, fixedContent);
  }
  
  return { fixes, fixedContent };
}

/**
 * 메인 실행 함수
 */
function main() {
  const args = process.argv.slice(2);
  const projectDir = process.cwd();
  const autoFix = args.includes('--fix');
  const dryRun = !autoFix;
  
  console.log(`프로젝트 디렉토리: ${colors.cyan}${projectDir}${colors.reset}\n`);
  
  // CSS 파일 찾기
  const cssFiles = findCSSFiles(projectDir);
  const styleFiles = findStyleFiles(path.join(projectDir, 'src'));
  
  console.log(`${colors.blue}📄 발견된 파일들${colors.reset}`);
  console.log(`CSS 파일: ${colors.cyan}${cssFiles.length}개${colors.reset}`);
  console.log(`스타일 관련 파일: ${colors.cyan}${styleFiles.length}개${colors.reset}\n`);
  
  const allIssues = [];
  const allSuggestions = [];
  const analysisResults = [];
  
  // CSS 파일 분석
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}📋 CSS 파일 분석${colors.reset}\n`);
  
  cssFiles.forEach(filePath => {
    const relativePath = path.relative(projectDir, filePath);
    console.log(`${colors.yellow}📄 ${relativePath}${colors.reset}`);
    
    try {
      const analysis = analyzeCSS(filePath);
      analysisResults.push({ filePath, type: 'css', analysis });
      
      if (analysis.issues.length > 0) {
        console.log(`   ${colors.red}❌ 문제점:${colors.reset}`);
        analysis.issues.forEach(issue => {
          console.log(`      • ${issue}`);
          allIssues.push(issue);
        });
      } else {
        console.log(`   ${colors.green}✅ 문제 없음${colors.reset}`);
      }
      
      if (analysis.suggestions.length > 0) {
        console.log(`   ${colors.yellow}💡 제안사항:${colors.reset}`);
        analysis.suggestions.forEach(suggestion => {
          console.log(`      • ${suggestion}`);
          allSuggestions.push(suggestion);
        });
      }
      
      if (analysis.mediaQueries.length > 0) {
        console.log(`   ${colors.cyan}📱 미디어 쿼리: ${analysis.mediaQueries.length}개 발견${colors.reset}`);
      }
      
      // 자동 수정 시도
      if (autoFix) {
        const fixResult = autoFixCSS(filePath, dryRun);
        if (fixResult.fixes.length > 0) {
          console.log(`   ${colors.green}🔧 자동 수정:${colors.reset}`);
          fixResult.fixes.forEach(fix => {
            console.log(`      • ${fix}`);
          });
        }
      }
      
    } catch (error) {
      console.log(`   ${colors.red}❌ 분석 실패: ${error.message}${colors.reset}`);
    }
    
    console.log();
  });
  
  // TypeScript/JSX 파일 분석 (Tailwind)
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}🎨 Tailwind 클래스 분석${colors.reset}\n`);
  
  let tailwindIssueCount = 0;
  styleFiles.slice(0, 10).forEach(filePath => { // 처음 10개 파일만 분석
    const relativePath = path.relative(projectDir, filePath);
    
    try {
      const analysis = analyzeTailwindClasses(filePath);
      
      if (analysis.issues.length > 0 || analysis.suggestions.length > 0) {
        console.log(`${colors.yellow}📄 ${relativePath}${colors.reset}`);
        
        if (analysis.issues.length > 0) {
          console.log(`   ${colors.red}❌ 문제점:${colors.reset}`);
          analysis.issues.forEach(issue => {
            console.log(`      • ${issue}`);
            allIssues.push(issue);
            tailwindIssueCount++;
          });
        }
        
        if (analysis.suggestions.length > 0) {
          console.log(`   ${colors.yellow}💡 제안사항:${colors.reset}`);
          analysis.suggestions.forEach(suggestion => {
            console.log(`      • ${suggestion}`);
            allSuggestions.push(suggestion);
          });
        }
        
        console.log();
      }
    } catch (error) {
      // 파일 읽기 실패는 조용히 무시
    }
  });
  
  if (tailwindIssueCount === 0) {
    console.log(`${colors.green}✅ Tailwind 클래스 사용에 큰 문제 없음${colors.reset}\n`);
  }
  
  // 권장사항 생성
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}🎯 반응형 디자인 권장사항${colors.reset}\n`);
  
  const recommendations = generateRecommendations(allIssues, allSuggestions);
  
  if (recommendations.length > 0) {
    recommendations.forEach((rec, index) => {
      const priorityColor = rec.priority === 'HIGH' ? colors.red : 
                           rec.priority === 'MEDIUM' ? colors.yellow : colors.green;
      
      console.log(`${priorityColor}${rec.priority}${colors.reset} ${colors.bright}${index + 1}. ${rec.title}${colors.reset}`);
      console.log(`   ${rec.description}`);
      console.log(`   ${colors.cyan}예시: ${rec.example}${colors.reset}\n`);
    });
  } else {
    console.log(`${colors.green}🎉 반응형 디자인이 잘 구현되어 있습니다!${colors.reset}\n`);
  }
  
  // 최종 요약
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}📊 점검 결과 요약${colors.reset}`);
  
  console.log(`분석된 CSS 파일: ${colors.cyan}${cssFiles.length}개${colors.reset}`);
  console.log(`분석된 스타일 파일: ${colors.cyan}${Math.min(styleFiles.length, 10)}개${colors.reset}`);
  console.log(`발견된 문제점: ${colors.cyan}${allIssues.length}개${colors.reset}`);
  console.log(`제안사항: ${colors.cyan}${allSuggestions.length}개${colors.reset}`);
  console.log(`우선순위 권장사항: ${colors.cyan}${recommendations.length}개${colors.reset}`);
  
  const overallScore = Math.max(0, 100 - (allIssues.length * 10) - (recommendations.filter(r => r.priority === 'HIGH').length * 20));
  const scoreColor = overallScore >= 80 ? colors.green : overallScore >= 60 ? colors.yellow : colors.red;
  
  console.log(`\n${colors.bright}반응형 디자인 점수: ${scoreColor}${overallScore}/100${colors.reset}`);
  
  if (overallScore >= 80) {
    console.log(`${colors.green}🎉 반응형 디자인이 우수합니다!${colors.reset}`);
  } else if (overallScore >= 60) {
    console.log(`${colors.yellow}⚠️  일부 개선이 필요합니다.${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ 반응형 디자인 개선이 시급합니다.${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}💡 사용법:${colors.reset}`);
  console.log(`   기본 점검: ${colors.cyan}node scripts/checkResponsive.cjs${colors.reset}`);
  console.log(`   자동 수정: ${colors.cyan}node scripts/checkResponsive.cjs --fix${colors.reset}`);
  
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = {
  findCSSFiles,
  findStyleFiles,
  analyzeCSS,
  analyzeTailwindClasses,
  autoFixCSS
};
