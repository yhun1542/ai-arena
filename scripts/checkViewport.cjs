#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// 확인할 올바른 뷰포트 meta 태그
const correctViewportTag = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';

// 대안 허용 가능한 뷰포트 태그들
const acceptableViewportTags = [
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
  '<meta name="viewport" content="width=device-width,initial-scale=1.0">',
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  '<meta name="viewport" content="width=device-width,initial-scale=1">',
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">',
  '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">'
];

console.log(`${colors.cyan}${colors.bright}🔍 AI Arena - 뷰포트 점검 스크립트${colors.reset}`);
console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

/**
 * HTML 파일에서 뷰포트 meta 태그를 찾는 함수
 */
function checkViewportInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // meta viewport 태그 찾기 (대소문자 무시, 공백 허용)
    const viewportRegex = /<meta\s+name=["']viewport["']\s+content=["'][^"']*["']\s*\/?>/gi;
    const matches = content.match(viewportRegex);
    
    if (!matches) {
      return {
        found: false,
        tag: null,
        isCorrect: false,
        message: '뷰포트 meta 태그를 찾을 수 없습니다.'
      };
    }
    
    const foundTag = matches[0];
    
    // 정규화된 태그로 비교 (공백 제거, 소문자 변환)
    const normalizedFound = foundTag.toLowerCase().replace(/\s+/g, ' ').replace(/\s*\/?>$/, '>');
    const isCorrect = acceptableViewportTags.some(acceptable => 
      normalizedFound.includes(acceptable.toLowerCase().replace(/\s+/g, ' '))
    );
    
    return {
      found: true,
      tag: foundTag,
      isCorrect: isCorrect,
      message: isCorrect ? '올바른 뷰포트 태그입니다.' : '뷰포트 태그가 권장 형식과 다릅니다.'
    };
    
  } catch (error) {
    return {
      found: false,
      tag: null,
      isCorrect: false,
      message: `파일 읽기 오류: ${error.message}`
    };
  }
}

/**
 * 디렉토리에서 HTML 파일들을 재귀적으로 찾는 함수
 */
function findHtmlFiles(dir, excludeDirs = ['node_modules', '.git', 'dist', 'build']) {
  const htmlFiles = [];
  
  function scanDirectory(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          const dirName = path.basename(fullPath);
          if (!excludeDirs.includes(dirName) && !dirName.startsWith('.')) {
            scanDirectory(fullPath);
          }
        } else if (item.endsWith('.html') || item === 'index.html') {
          htmlFiles.push(fullPath);
        }
      }
    } catch (error) {
      console.log(`${colors.yellow}⚠️  디렉토리 스캔 오류: ${currentDir} - ${error.message}${colors.reset}`);
    }
  }
  
  scanDirectory(dir);
  return htmlFiles;
}

/**
 * Vite/React 프로젝트의 index.html 확인
 */
function checkViteProject() {
  const indexPath = path.join(process.cwd(), 'index.html');
  
  if (fs.existsSync(indexPath)) {
    console.log(`${colors.magenta}📄 Vite 프로젝트 index.html 확인${colors.reset}`);
    const result = checkViewportInFile(indexPath);
    
    console.log(`파일: ${colors.cyan}${indexPath}${colors.reset}`);
    
    if (result.found) {
      if (result.isCorrect) {
        console.log(`${colors.green}✅ ${result.message}${colors.reset}`);
        console.log(`   태그: ${colors.green}${result.tag}${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️  ${result.message}${colors.reset}`);
        console.log(`   현재: ${colors.yellow}${result.tag}${colors.reset}`);
        console.log(`   권장: ${colors.green}${correctViewportTag}${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}❌ ${result.message}${colors.reset}`);
      console.log(`   추가 필요: ${colors.green}${correctViewportTag}${colors.reset}`);
    }
    
    return result;
  }
  
  return null;
}

/**
 * 빌드된 파일들 확인
 */
function checkBuiltFiles() {
  const distPath = path.join(process.cwd(), 'dist');
  
  if (fs.existsSync(distPath)) {
    console.log(`\n${colors.magenta}📦 빌드된 파일들 확인 (dist/)${colors.reset}`);
    const htmlFiles = findHtmlFiles(distPath);
    
    if (htmlFiles.length === 0) {
      console.log(`${colors.yellow}⚠️  dist/ 디렉토리에 HTML 파일이 없습니다.${colors.reset}`);
      return [];
    }
    
    const results = [];
    
    htmlFiles.forEach(filePath => {
      const result = checkViewportInFile(filePath);
      const relativePath = path.relative(process.cwd(), filePath);
      
      console.log(`\n파일: ${colors.cyan}${relativePath}${colors.reset}`);
      
      if (result.found) {
        if (result.isCorrect) {
          console.log(`${colors.green}✅ ${result.message}${colors.reset}`);
        } else {
          console.log(`${colors.yellow}⚠️  ${result.message}${colors.reset}`);
          console.log(`   현재: ${colors.yellow}${result.tag}${colors.reset}`);
        }
      } else {
        console.log(`${colors.red}❌ ${result.message}${colors.reset}`);
      }
      
      results.push({ file: relativePath, ...result });
    });
    
    return results;
  }
  
  return [];
}

/**
 * 자동 수정 기능
 */
function fixViewportTag(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 기존 viewport 태그 제거
    content = content.replace(/<meta\s+name=["']viewport["']\s+content=["'][^"']*["']\s*\/?>/gi, '');
    
    // <head> 태그 안에 올바른 viewport 태그 추가
    if (content.includes('<head>')) {
      content = content.replace('<head>', `<head>\n    ${correctViewportTag}`);
    } else if (content.includes('<head ')) {
      content = content.replace(/(<head[^>]*>)/, `$1\n    ${correctViewportTag}`);
    } else {
      // head 태그가 없으면 html 태그 다음에 추가
      content = content.replace(/(<html[^>]*>)/i, `$1\n<head>\n    ${correctViewportTag}\n</head>`);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ 파일 수정 실패: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * 메인 실행 함수
 */
function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix') || args.includes('-f');
  const shouldBuild = args.includes('--build') || args.includes('-b');
  
  console.log(`${colors.blue}프로젝트 디렉토리: ${colors.cyan}${process.cwd()}${colors.reset}\n`);
  
  // 1. Vite 프로젝트 index.html 확인
  const viteResult = checkViteProject();
  
  // 2. 빌드가 필요한 경우 빌드 실행
  if (shouldBuild && viteResult && !viteResult.isCorrect) {
    console.log(`\n${colors.yellow}🔧 빌드 실행 중...${colors.reset}`);
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log(`${colors.green}✅ 빌드 완료${colors.reset}`);
    } catch (error) {
      console.log(`${colors.red}❌ 빌드 실패: ${error.message}${colors.reset}`);
    }
  }
  
  // 3. 빌드된 파일들 확인
  const builtResults = checkBuiltFiles();
  
  // 4. 자동 수정 옵션
  if (shouldFix) {
    console.log(`\n${colors.yellow}🔧 자동 수정 모드${colors.reset}`);
    
    if (viteResult && !viteResult.isCorrect) {
      const indexPath = path.join(process.cwd(), 'index.html');
      console.log(`\n${colors.blue}index.html 수정 중...${colors.reset}`);
      
      if (fixViewportTag(indexPath)) {
        console.log(`${colors.green}✅ index.html 수정 완료${colors.reset}`);
      }
    }
  }
  
  // 5. 최종 요약
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}📊 점검 결과 요약${colors.reset}`);
  
  let totalFiles = 0;
  let correctFiles = 0;
  
  if (viteResult) {
    totalFiles++;
    if (viteResult.isCorrect) correctFiles++;
  }
  
  totalFiles += builtResults.length;
  correctFiles += builtResults.filter(r => r.isCorrect).length;
  
  if (totalFiles === 0) {
    console.log(`${colors.yellow}⚠️  확인할 HTML 파일을 찾을 수 없습니다.${colors.reset}`);
  } else {
    console.log(`총 파일: ${colors.cyan}${totalFiles}개${colors.reset}`);
    console.log(`올바른 파일: ${colors.green}${correctFiles}개${colors.reset}`);
    console.log(`수정 필요: ${colors.yellow}${totalFiles - correctFiles}개${colors.reset}`);
    
    if (correctFiles === totalFiles) {
      console.log(`\n${colors.green}🎉 모든 파일의 뷰포트 설정이 올바릅니다!${colors.reset}`);
    } else {
      console.log(`\n${colors.yellow}💡 수정이 필요한 파일이 있습니다.${colors.reset}`);
      console.log(`${colors.cyan}자동 수정: node scripts/checkViewport.js --fix${colors.reset}`);
      console.log(`${colors.cyan}빌드 후 확인: node scripts/checkViewport.js --build${colors.reset}`);
    }
  }
  
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = {
  checkViewportInFile,
  findHtmlFiles,
  fixViewportTag
};
