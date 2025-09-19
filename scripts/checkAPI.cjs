#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { URL } = require('url');

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

console.log(`${colors.cyan}${colors.bright}🔗 AI Arena - API 연결 상태 점검 스크립트${colors.reset}`);
console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

/**
 * HTTP/HTTPS 요청을 Promise로 래핑하는 함수
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || 10000
    };
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          success: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

/**
 * AI API 엔드포인트 테스트
 */
async function testAIAPI(name, testUrl, expectedResponse = null) {
  console.log(`${colors.blue}🤖 ${name} API 테스트${colors.reset}`);
  
  try {
    const startTime = Date.now();
    const response = await makeRequest(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: "AI 테스트 질문입니다.",
        complex: false
      }),
      timeout: 30000 // 30초 타임아웃
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`   URL: ${colors.cyan}${testUrl}${colors.reset}`);
    console.log(`   상태 코드: ${response.success ? colors.green : colors.red}${response.statusCode}${colors.reset}`);
    console.log(`   응답 시간: ${colors.yellow}${responseTime}ms${colors.reset}`);
    
    if (response.success) {
      try {
        const jsonData = JSON.parse(response.data);
        if (jsonData.error) {
          console.log(`   ${colors.yellow}⚠️  API 오류: ${jsonData.error}${colors.reset}`);
          return { success: false, error: jsonData.error, responseTime };
        } else {
          console.log(`   ${colors.green}✅ API 정상 작동${colors.reset}`);
          return { success: true, responseTime, data: jsonData };
        }
      } catch (parseError) {
        console.log(`   ${colors.yellow}⚠️  JSON 파싱 오류 (하지만 응답은 받음)${colors.reset}`);
        return { success: true, responseTime, rawData: response.data.substring(0, 100) };
      }
    } else {
      console.log(`   ${colors.red}❌ HTTP 오류: ${response.statusCode}${colors.reset}`);
      return { success: false, error: `HTTP ${response.statusCode}`, responseTime };
    }
    
  } catch (error) {
    console.log(`   ${colors.red}❌ 연결 실패: ${error.message}${colors.reset}`);
    return { success: false, error: error.message, responseTime: null };
  }
}

/**
 * 웹사이트 접근성 테스트
 */
async function testWebsiteAccess(name, url) {
  console.log(`${colors.magenta}🌐 ${name} 접근성 테스트${colors.reset}`);
  
  try {
    const startTime = Date.now();
    const response = await makeRequest(url, {
      method: 'GET',
      timeout: 15000
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`   URL: ${colors.cyan}${url}${colors.reset}`);
    console.log(`   상태 코드: ${response.success ? colors.green : colors.red}${response.statusCode}${colors.reset}`);
    console.log(`   응답 시간: ${colors.yellow}${responseTime}ms${colors.reset}`);
    
    if (response.success) {
      const contentLength = response.data.length;
      const hasTitle = response.data.includes('<title>');
      const hasViewport = response.data.includes('viewport');
      
      console.log(`   콘텐츠 크기: ${colors.cyan}${(contentLength / 1024).toFixed(2)} KB${colors.reset}`);
      console.log(`   제목 태그: ${hasTitle ? colors.green + '✅' : colors.red + '❌'}${colors.reset}`);
      console.log(`   뷰포트 설정: ${hasViewport ? colors.green + '✅' : colors.red + '❌'}${colors.reset}`);
      
      return { 
        success: true, 
        responseTime, 
        contentLength, 
        hasTitle, 
        hasViewport,
        statusCode: response.statusCode
      };
    } else {
      console.log(`   ${colors.red}❌ 접근 실패${colors.reset}`);
      return { success: false, error: `HTTP ${response.statusCode}`, responseTime };
    }
    
  } catch (error) {
    console.log(`   ${colors.red}❌ 연결 실패: ${error.message}${colors.reset}`);
    return { success: false, error: error.message, responseTime: null };
  }
}

/**
 * 환경 변수 점검 (로컬 환경에서만)
 */
function checkEnvironmentVariables() {
  console.log(`${colors.yellow}🔐 환경 변수 점검 (로컬 환경)${colors.reset}`);
  
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'GOOGLE_API_KEY', 
    'ANTHROPIC_API_KEY',
    'XAI_API_KEY'
  ];
  
  const results = {};
  
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    const isSet = !!value;
    const maskedValue = isSet ? `${value.substring(0, 8)}...` : 'NOT SET';
    
    console.log(`   ${envVar}: ${isSet ? colors.green + '✅' : colors.red + '❌'} ${colors.cyan}${maskedValue}${colors.reset}`);
    results[envVar] = isSet;
  });
  
  return results;
}

/**
 * 네트워크 연결 상태 점검
 */
async function checkNetworkConnectivity() {
  console.log(`${colors.blue}🌍 네트워크 연결 상태 점검${colors.reset}`);
  
  const testSites = [
    { name: 'Google DNS', url: 'https://dns.google' },
    { name: 'Cloudflare', url: 'https://cloudflare.com' },
    { name: 'GitHub', url: 'https://github.com' }
  ];
  
  const results = [];
  
  for (const site of testSites) {
    try {
      const startTime = Date.now();
      const response = await makeRequest(site.url, { timeout: 5000 });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`   ${site.name}: ${response.success ? colors.green + '✅' : colors.red + '❌'} ${colors.yellow}${responseTime}ms${colors.reset}`);
      results.push({ ...site, success: response.success, responseTime });
      
    } catch (error) {
      console.log(`   ${site.name}: ${colors.red}❌ ${error.message}${colors.reset}`);
      results.push({ ...site, success: false, error: error.message });
    }
  }
  
  return results;
}

/**
 * 메인 실행 함수
 */
async function main() {
  const args = process.argv.slice(2);
  const skipAPI = args.includes('--skip-api');
  const skipWebsite = args.includes('--skip-website');
  const skipNetwork = args.includes('--skip-network');
  
  const results = {
    timestamp: new Date().toISOString(),
    api: {},
    website: {},
    environment: {},
    network: {}
  };
  
  // 1. 네트워크 연결 상태 점검
  if (!skipNetwork) {
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    results.network = await checkNetworkConnectivity();
    console.log();
  }
  
  // 2. 환경 변수 점검
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  results.environment = checkEnvironmentVariables();
  console.log();
  
  // 3. 웹사이트 접근성 테스트
  if (!skipWebsite) {
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    
    const websites = [
      { name: 'Production (jasoneye.com)', url: 'https://jasoneye.com' },
      { name: 'Vercel Preview', url: 'https://ai-arena-3tnyvmdwz-arena-d8417464.vercel.app' }
    ];
    
    for (const website of websites) {
      results.website[website.name] = await testWebsiteAccess(website.name, website.url);
      console.log();
    }
  }
  
  // 4. API 엔드포인트 테스트
  if (!skipAPI) {
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    
    const apiEndpoints = [
      { name: 'Synapse API (Production)', url: 'https://jasoneye.com/api/synapse' },
      { name: 'Test Environment API', url: 'https://jasoneye.com/api/test-env' }
    ];
    
    for (const api of apiEndpoints) {
      results.api[api.name] = await testAIAPI(api.name, api.url);
      console.log();
    }
  }
  
  // 5. 최종 요약
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}📊 종합 점검 결과${colors.reset}`);
  
  // 환경 변수 요약
  const envVarCount = Object.keys(results.environment).length;
  const envVarSet = Object.values(results.environment).filter(Boolean).length;
  console.log(`환경 변수: ${colors.cyan}${envVarSet}/${envVarCount}${colors.reset} 설정됨`);
  
  // 웹사이트 요약
  if (!skipWebsite) {
    const websiteResults = Object.values(results.website);
    const websiteSuccess = websiteResults.filter(r => r.success).length;
    console.log(`웹사이트: ${colors.cyan}${websiteSuccess}/${websiteResults.length}${colors.reset} 정상 접근`);
  }
  
  // API 요약
  if (!skipAPI) {
    const apiResults = Object.values(results.api);
    const apiSuccess = apiResults.filter(r => r.success).length;
    console.log(`API 엔드포인트: ${colors.cyan}${apiSuccess}/${apiResults.length}${colors.reset} 정상 작동`);
  }
  
  // 네트워크 요약
  if (!skipNetwork) {
    const networkSuccess = results.network.filter(r => r.success).length;
    console.log(`네트워크 연결: ${colors.cyan}${networkSuccess}/${results.network.length}${colors.reset} 정상`);
  }
  
  // 전체 상태 판정
  const allGood = (
    envVarSet === envVarCount &&
    (skipWebsite || Object.values(results.website).every(r => r.success)) &&
    (skipAPI || Object.values(results.api).every(r => r.success)) &&
    (skipNetwork || results.network.every(r => r.success))
  );
  
  if (allGood) {
    console.log(`\n${colors.green}🎉 모든 시스템이 정상 작동 중입니다!${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}⚠️  일부 시스템에 문제가 있습니다. 위 결과를 확인해주세요.${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}💡 사용법:${colors.reset}`);
  console.log(`   기본 점검: ${colors.cyan}node scripts/checkAPI.cjs${colors.reset}`);
  console.log(`   API 제외: ${colors.cyan}node scripts/checkAPI.cjs --skip-api${colors.reset}`);
  console.log(`   웹사이트 제외: ${colors.cyan}node scripts/checkAPI.cjs --skip-website${colors.reset}`);
  console.log(`   네트워크 제외: ${colors.cyan}node scripts/checkAPI.cjs --skip-network${colors.reset}`);
  
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  // JSON 결과 저장 (옵션)
  if (args.includes('--save-json')) {
    const fs = require('fs');
    const resultPath = `api-check-${Date.now()}.json`;
    fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
    console.log(`${colors.green}📄 결과가 ${resultPath}에 저장되었습니다.${colors.reset}\n`);
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(error => {
    console.error(`${colors.red}❌ 스크립트 실행 오류: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = {
  makeRequest,
  testAIAPI,
  testWebsiteAccess,
  checkEnvironmentVariables,
  checkNetworkConnectivity
};
