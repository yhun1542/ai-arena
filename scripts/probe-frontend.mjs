#!/usr/bin/env node
const url = process.argv[2] || 'https://jasoneye.com';

const must = (cond, msg) => console.log(`${cond?'✅':'❌'} ${msg}`);

const get = async (u) => {
  const res = await fetch(u, { redirect:'manual' });
  return { status: res.status, text: await res.text() };
};

const findChunk = (html) => {
  const m = html.match(/\/_next\/static\/.+?\.js/g);
  return m?.[0];
};

(async () => {
  console.log(`\n[PROBE] ${url} 프론트엔드 상태 점검:`);
  
  const page = await get(url);
  must(page.status===200, `GET ${url} → ${page.status}`);
  
  const hasNextData = /__NEXT_DATA__/.test(page.text);
  must(hasNextData, '__NEXT_DATA__ 스크립트 존재(SSR 빌드 산출물)');
  
  const chunk = findChunk(page.text);
  if (chunk) {
    const c = await get(new URL(chunk, url).href);
    must(c.status===200, `정적 청크 로드 ${chunk} → ${c.status}`);
  } else {
    console.log('⚠️  정적 청크 경로를 찾지 못함 → 빌드/라우팅 점검 필요');
  }
  
  // Check for common errors in HTML
  const hasError = /error|Error|ERROR/.test(page.text);
  must(!hasError, '페이지에 에러 메시지 없음');
  
  console.log('\n끝. 문제가 있다면 빌드/라우팅/하이드레이션을 점검하세요.');
})();
