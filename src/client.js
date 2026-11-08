// Gori public site: language and theme toggles, copy buttons, terminal tabs.
// English lives in the HTML; Korean strings are keyed by data-i18n below.
(() => {
  const KO = {
    'release.notice': '출시 준비 중 — Gori는 현재 비공개 개발 중입니다. 아래에서 제품 미리보기를 살펴보세요. 저장소와 공개 버전은 아직 제공되지 않습니다.',
    'launch.status': '출시 준비 중',
    'launch.title': '한국의 서비스와<br>AI 에이전트를 연결합니다.',
    'launch.body': 'Gori는 AI 에이전트가 네이버, 카카오 등 한국의 서비스를 활용할 수 있도록 만드는 도구 계층입니다.',
    'launch.note': '현재 비공개 개발 중입니다. 코드, 문서, 직접 호스팅은 공개 출시와 함께 제공할 예정이며, 출시일은 아직 정해지지 않았습니다.',
    'launch.contact': '문의하기',
    'launch.direction': '우리가 준비하는 것',
    'launch.tools': '한국 서비스 연동',
    'launch.tools.body': '네이버와 카카오를 시작으로, 에이전트가 사용할 수 있는 도구를 준비합니다.',
    'launch.agents': '에이전트를 위한 인터페이스',
    'launch.agents.body': '명확한 스키마와 HTTP 및 MCP 인터페이스로 도구를 연결할 계획입니다.',
    'launch.control': '직접 운영하는 인프라',
    'launch.control.body': '자체 인프라에서 운영할 수 있는 플랫폼을 목표로 개발하고 있습니다.',

    'skip': '본문으로 건너뛰기',
    'nav.how': '작동 방식', 'nav.providers': '제공자', 'nav.pricing': '요금', 'nav.docs': '문서',
    'hero.eyebrow': '오픈 소스 · AGPL-3.0',
    'hero.title': '한국 서비스를<br>에이전트와 잇습니다.',
    'hero.sub': 'AI 에이전트를 위한 도구 계층. 네이버와 카카오를 타입이 정의된 도구로 제공하고, 에이전트는 MCP나 일반 HTTP API로 호출합니다. 내 Cloudflare 계정이나 Docker 호스트에서 실행됩니다.',
    'hero.noacct': 'Gori 계정 불필요',
    'cta.selfhost': 'Gori 직접 호스팅하기', 'cta.github': 'GitHub에서 보기', 'cta.guide': '배포 가이드 읽기', 'cta.docs': '문서 읽기',
    'name.eyebrow': '이름', 'name.title': '고리는 둥근 고리, 연결을 뜻합니다.',
    'name.body': '작은 조각이 여러 것을 이어 더 큰 것을 만듭니다. 에이전트는 무엇을 할지 정할 수 있지만, 실제로 실행하려면 현실의 서비스에 닿아야 합니다. 연동 하나하나가 의도와 실행을 잇는 고리입니다.',
    'how.eyebrow': '작동 방식', 'how.title': '클론부터 첫 도구 호출까지 세 단계.',
    'how.s1.t': '배포', 'how.s1.d': 'Docker Compose와 PostgreSQL로 Node 서버를 실행하거나, 같은 코어를 Cloudflare Workers에 배포하세요.',
    'how.s2.t': '제공자 인증 정보 추가', 'how.s2.d': 'NAVER API HUB 애플리케이션과 카카오 REST API 키를 사용합니다. 인증 정보는 내 인프라에만 저장됩니다.',
    'how.s3.t': '에이전트에서 도구 호출', 'how.s3.d': '카탈로그를 에이전트에 도구로 제공하고 호출을 Gori로 전달하세요. 입력값은 각 도구의 JSON Schema로 검증됩니다. MCP 지원은 준비 중입니다.',
    'feat.eyebrow': '구성', 'feat.title': '지금 제공하는 것과 다음에 올 것.',
    'feat.lede': '각 항목에 실제 상태를 표시했습니다. Gori는 초기 단계이며, 그 사실을 숨기지 않습니다.',
    'st.ok': '출시 준비 중', 'st.plan': '예정', 'st.soon': '준비 중',
    'feat.core': '도구 탐색, 입력 검증, 요청 인가, 제공자 API 호출. 고정된 도구 ID와 snake_case 오류 코드를 제공합니다.',
    'feat.infra.t': '내 인프라에서 실행', 'feat.infra': 'Docker와 Cloudflare Workers가 하나의 코어를 공유합니다. SQLite, PostgreSQL, D1 스토리지 어댑터를 지원합니다.',
    'feat.vault': '갱신과 폐기를 지원하는 암호화된 인증 정보와 OAuth 연결. 현재는 환경 변수에서 인증 정보를 읽습니다.',
    'feat.hub': '버전이 관리되는 커넥터, 도구 스키마, 설정 가이드, 호환성 정보를 한곳에 모읍니다.',
    'prov.eyebrow': '제공자', 'prov.title': '한국에서 이미 쓰는 서비스부터 시작합니다.',
    'prov.naver': '한국 뉴스 기사를 검색합니다.', 'prov.kakao': '키워드로 장소를 검색합니다.',
    'prov.more.t': '더 추가될 예정', 'prov.more': '커넥터는 검증된 도구 단위로 하나씩 추가됩니다. 다음에 필요한 서비스를 알려 주세요.', 'prov.more.link': '이슈 남기기',
    'price.eyebrow': '요금', 'price.title': '직접 호스팅은 무료. 관리형 클라우드는 준비 중입니다.',
    'price.lede': '직접 호스팅 버전은 체험판이 아닌 전체 제품입니다. 호스팅과 지원은 선택 사항입니다.',
    'price.more': '요금제 비교와 자주 묻는 질문',
    'plan.self.t': '직접 호스팅', 'plan.self.price': '무료',
    'plan.self.d': '저장소의 모든 기능을 내 Cloudflare 계정이나 Docker 호스트에서 사용합니다.',
    'plan.self.f1': '모든 도구와 제공자', 'plan.self.f2': 'Docker 또는 Cloudflare Workers', 'plan.self.f3': 'Gori가 정한 사용량 제한 없음', 'plan.self.f4': 'Gori 계정 불필요', 'plan.self.f5': 'GitHub 커뮤니티 지원',
    'plan.cloud.price': '미정', 'plan.cloud.unit': '요금 미정',
    'plan.cloud.d': '같은 코어를 대신 호스팅하고 운영합니다. 오픈 소스 코드로 만듭니다.',
    'plan.cloud.f1': '관리형 호스팅과 업그레이드', 'plan.cloud.f2': '영어·한국어 대시보드', 'plan.cloud.f3': '사용량 보고와 할당량',
    'plan.cloud.notify': '저장소를 Watch하면 출시 소식을 받을 수 있습니다. Cloud 출시 알림을 원하시면 이메일을 보내 주세요.',
    'plan.cloud.watch': 'GitHub에서 Watch', 'plan.cloud.email': '이메일 보내기',
    'plan.sup.t': '지원', 'plan.sup.price': '맞춤형', 'plan.sup.unit': '팀 대상',
    'plan.sup.d': '프로덕션 운영 지원이나 비즈니스에 필요한 커넥터를 도와드립니다.',
    'plan.sup.f1': '배포와 업그레이드 지원', 'plan.sup.f2': '맞춤형 한국 서비스 커넥터', 'plan.sup.f3': '영어 또는 한국어 지원',
    'price.note': '제공자(네이버, 카카오) 사용료는 내 애플리케이션 기준으로 각 제공자가 청구하며 Gori 요금에 포함되지 않습니다.',
    'pricing.title': '직접 호스팅은 무료입니다. 앞으로도 그렇습니다.',
    'pricing.lede': 'Gori는 AGPL-3.0 오픈 소스입니다. 관리형 Cloud와 팀 지원은 선택 사항이며, 요금이 정해지면 이 페이지에 공개합니다.',
    'cmp.eyebrow': '비교', 'cmp.title': '요금제 비교',
    'cmp.feature': '항목', 'cmp.self': '직접 호스팅', 'cmp.sup': '지원',
    'cmp.price': '가격', 'cmp.price.self': '무료', 'cmp.price.cloud': '미정', 'cmp.price.sup': '맞춤형',
    'cmp.tools': '도구 카탈로그 (네이버, 카카오)', 'cmp.tools.cloud': '예정',
    'cmp.where': '실행 위치', 'cmp.where.self': '내 Cloudflare 또는 Docker', 'cmp.where.cloud': 'Gori가 호스팅', 'cmp.where.sup': '내 인프라',
    'cmp.ops': '운영과 업그레이드', 'cmp.ops.self': '직접 운영', 'cmp.ops.cloud': '관리형 (예정)', 'cmp.ops.sup': '지원 제공',
    'cmp.dash': '대시보드 (영어·한국어)', 'cmp.vault': 'OAuth 연결 (Vault)', 'cmp.usage': '사용량 보고와 할당량',
    'cmp.planned': '예정', 'cmp.na': '해당 없음',
    'cmp.help': '지원 채널', 'cmp.help.self': 'GitHub 이슈', 'cmp.help.cloud': '미정', 'cmp.help.sup': '직접 지원, 영어 또는 한국어',
    'cmp.lic': '라이선스', 'cmp.lic.cloud': '서비스 약관 미정',
    'faq.title': '요금에 대해 자주 묻는 질문',
    'faq.q1': '직접 호스팅은 정말 무료인가요?', 'faq.a1': '네. Gori는 AGPL-3.0-only 라이선스입니다. 비용 없이 실행하고, 살펴보고, 수정할 수 있습니다. 호스팅 비용과 제공자 요금만 부담하면 됩니다.',
    'faq.q2': 'AGPL은 우리 회사에 어떤 의미인가요?', 'faq.a2': 'Gori를 수정하지 않고 사용하는 경우, API를 호출하는 비공개 에이전트를 포함해 내 코드에 추가 의무가 생기지 않습니다. Gori를 수정해 다른 사람이 네트워크로 사용하게 하면 수정한 소스를 그 사용자에게 제공해야 합니다. 구체적인 경우는 법률 자문을 받으세요.',
    'faq.q3': 'Gori Cloud는 언제 출시되나요?', 'faq.a3': '아직 정해진 날짜는 없습니다. 개발자 API가 먼저이고, 그다음이 대시보드입니다. 저장소를 Watch하거나 이메일을 보내 주시면 출시 때 알려 드립니다.',
    'faq.q4': '직접 호스팅에 Gori 계정이 필요한가요?', 'faq.a4': '아니요. 직접 호스팅한 배포는 Gori 서비스에 접속하지 않습니다. 제공자 인증 정보와 데이터는 내 인프라에만 남습니다.',
    'faq.q5': '네이버와 카카오 API 요금은 누가 내나요?', 'faq.a5': '내 애플리케이션과 인증 정보로 호출하므로, 각 제공자가 내 계정 기준으로 청구합니다. Gori는 제공자 요금에 추가 비용을 붙이지 않습니다.',
    'cta.title': '오늘 바로 직접 호스팅하세요.', 'cta.body': 'Docker나 Cloudflare Workers에 배포하고 몇 분 안에 첫 도구를 호출하세요.',
    'deploy.eyebrow': '배포', 'deploy.title': '런타임을 고르세요. 코어는 같습니다.',
    'docs.eyebrow': '문서', 'docs.title': 'Gori 문서',
    'docs.lede': '에이전트 연결, API 레퍼런스, 설정, 운영, 개발 가이드. 문서는 현재 영어로만 제공됩니다.',
    'docs.overview': '개요', 'docs.onpage': '이 페이지에서', 'docs.edit': 'GitHub에서 이 페이지 수정',
    'docs.start': '처음이라면', 'docs.start.body': 'README의 로컬 개발 절차로 시작한 뒤, 에이전트 가이드로 에이전트를 연결해 보세요.',
    'docs.readme': 'GitHub에서 README 보기',
    'nav.agents': '에이전트',
    'home.agents.eyebrow': '에이전트를 위해',
    'home.agents.title': '에이전트가 호출하도록 만들었습니다. 스크립트에서도 간단합니다.',
    'home.agents.lede': '모든 도구에 고정된 ID, JSON Schema, 읽기 쉬운 오류 코드가 있어 모델이 알맞은 도구를 찾고, 호출하고, 스스로 복구할 수 있습니다.',
    'home.agents.mcp.t': 'MCP 서버', 'home.agents.mcp.d': 'Claude Code, Cursor 등 MCP 클라이언트를 내 Gori 주소에 연결하세요. 코드 없이 에이전트에 도구가 나타납니다.',
    'home.agents.tools.t': '도구 호출', 'home.agents.tools.d': '카탈로그의 JSON Schema를 Claude나 OpenAI 도구 정의에 그대로 넣고, 각 호출을 Gori로 전달하세요.',
    'home.agents.api.t': '일반 HTTP API', 'home.agents.api.d': '에이전트가 없어도 됩니다. 스크립트, 백엔드, 크론 작업이 어떤 HTTP 클라이언트로든 같은 경로를 호출합니다.',
    'home.agents.more': '에이전트가 Gori에 연결하는 방법',
    'agents.eyebrow': '에이전트용',
    'agents.title': '에이전트가 호출할 수 있는 도구로 만든 한국 서비스.',
    'agents.lede': 'Gori는 네이버, 카카오 등을 JSON Schema와 고정된 오류 코드를 갖춘 도구로 바꿉니다. 에이전트는 제공자마다 연동 코드를 짜지 않고도 도구를 찾고, 호출하고, 결과를 읽습니다.',
    'agents.cta.guide': '에이전트 가이드 읽기',
    'agents.loop.eyebrow': '흐름', 'agents.loop.title': '에이전트가 Gori를 쓰는 방식',
    'agents.l1.t': '탐색', 'agents.l1.d': '카탈로그를 가져옵니다. 모든 도구에 ID, 설명, 입력용 JSON Schema가 있습니다.',
    'agents.l2.t': '제공', 'agents.l2.d': '도구를 모델에 도구 정의로 넘깁니다. 스키마는 그대로 사용할 수 있습니다.',
    'agents.l3.t': '호출', 'agents.l3.d': '모델이 도구를 고르면 인자를 Gori로 보냅니다. Gori가 검증한 뒤 제공자를 호출합니다.',
    'agents.l4.t': '반환', 'agents.l4.d': '결과를 모델에 돌려줍니다. 제공자 데이터이거나, 모델이 대응할 수 있는 오류 코드입니다.',
    'agents.paths.eyebrow': '연결', 'agents.paths.title': '에이전트를 연결하는 두 가지 방법',
    'agents.http.t': 'HTTP 도구 호출', 'agents.http.d': 'Claude, OpenAI 등 도구 호출을 지원하는 모든 모델에서 지금 바로 동작합니다. 카탈로그의 도구를 도구 정의로 바꾸고 호출을 실행 경로로 전달하세요.',
    'agents.http.more': '설정을 포함한 전체 예제',
    'agents.mcp.t': 'MCP 서버', 'agents.mcp.d': 'Claude Code, Cursor 등 MCP 클라이언트를 Gori 키로 내 Gori 주소에 연결합니다. 코드 없이 에이전트에 도구가 나타납니다. Docker와 Cloudflare Workers에서 실행됩니다.',
    'agents.mcp.preview': '예정된 설정 · 미리 보기',
    'agents.mcp.note': '설계는 끝났고 아직 출시 전입니다. 출시 전까지는 HTTP 도구 호출을 사용하세요. 도구 이름과 오류는 동일합니다.',
    'agents.err.eyebrow': '복구', 'agents.err.title': '모델이 대응할 수 있는 오류',
    'agents.err.lede': 'Gori는 제공자의 원시 오류 대신 고정된 snake_case 코드로 응답하므로, 모델이 무엇이 잘못됐고 다음에 무엇을 할지 판단할 수 있습니다.',
    'agents.err.code': '코드', 'agents.err.means': '에이전트에게 의미하는 것',
    'agents.err.e1': '인자가 도구의 스키마와 맞지 않습니다. 고쳐서 다시 호출하세요.',
    'agents.err.e2': '카탈로그에 없는 도구 ID입니다. 도구 목록을 다시 읽으세요.',
    'agents.err.e3': '운영자가 이 제공자의 인증 정보를 추가하지 않았습니다. 사용자에게 알리세요. 다시 시도해도 해결되지 않습니다.',
    'agents.err.e4': '제공자의 요청 한도에 도달했습니다. 기다렸다가 다시 시도하세요.',
    'agents.err.e5': '제공자가 제때 응답하지 않았습니다. 나중에 다시 시도하세요.',
    'agents.err.more': '전체 오류 코드',
    'agents.api.eyebrow': '에이전트가 없나요?', 'agents.api.title': '일반 HTTP API로도 쓸 수 있습니다.',
    'agents.api.lede': 'Gori는 에이전트를 위해 만들었지만, 스크립트, 백엔드, 크론 작업도 어떤 HTTP 클라이언트로든 같은 경로를 호출할 수 있습니다.',
    'agents.api.cta': 'HTTP API 레퍼런스',
    'copied': '복사했습니다',
  };
  const T_COPIED_EN = 'Copied';

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
  };
  const root = document.documentElement;
  const EN = new Map();
  document.querySelectorAll('[data-i18n]').forEach(el => EN.set(el, el.innerHTML));

  let lang = store.get('gori-lang') === 'ko' ? 'ko' : 'en';

  // Terminal examples. Requests match docs/api.md; responses are shortened and the place name is an example.
  const COMMENT = { en: 'Call a tool from any agent or app', ko: '어떤 에이전트나 앱에서든 도구를 호출하세요' };
  const EX = {
    kakao: ['kakao.search_places', '성수 카페', '"documents"', '{ <span class="t-k">"place_name"</span>: <span class="t-s">"카페 고리"</span>,\n        <span class="t-k">"road_address_name"</span>: <span class="t-s">"서울 성동구 …"</span> }'],
    naver: ['naver.search_news', '고리', '"items"', '{ <span class="t-k">"title"</span>: <span class="t-s">"…"</span>,\n        <span class="t-k">"pubDate"</span>: <span class="t-s">"…"</span> }'],
  };
  let tab = 'kakao';
  const term = document.getElementById('term-code');
  function renderTerm() {
    if (!term) return;
    const [id, query, key, row] = EX[tab];
    term.innerHTML = `<span class="t-c"># ${COMMENT[lang]}</span>
<span class="t-g">curl</span> localhost:3000/v1/tools/<span class="t-k">${id}</span>/execute \\
  -H <span class="t-s">"Authorization: Bearer $GORI_API_KEY"</span> \\
  -H <span class="t-s">'Content-Type: application/json'</span> \\
  -d <span class="t-s">'{"query":"${query}"}'</span>

<span class="t-c">→ 200 OK</span>
{
  <span class="t-k">"data"</span>: {
    <span class="t-k">${key}</span>: [
      ${row}
    ]
  }
}<span class="cursor" aria-hidden="true"></span>`;
  }
  document.querySelectorAll('.tabs [role=tab]').forEach(b => b.addEventListener('click', () => {
    tab = b.dataset.tab;
    document.querySelectorAll('.tabs [role=tab]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    renderTerm();
  }));

  function applyLang() {
    root.lang = lang;
    EN.forEach((en, el) => { el.innerHTML = lang === 'ko' && KO[el.dataset.i18n] ? KO[el.dataset.i18n] : en; });
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    renderTerm();
  }
  document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => {
    lang = b.dataset.lang; store.set('gori-lang', lang); applyLang();
  }));

  // Theme: explicit choice persists; otherwise follow the OS.
  const tbtn = document.getElementById('theme-toggle');
  const SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>';
  const MOON = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>';
  const mq = matchMedia('(prefers-color-scheme: light)');
  const effective = () => root.dataset.theme || (mq.matches ? 'light' : 'dark');
  function syncIcon() {
    const dark = effective() === 'dark';
    tbtn.querySelector('svg').innerHTML = dark ? SUN : MOON;
    tbtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }
  tbtn.addEventListener('click', () => {
    root.dataset.theme = effective() === 'dark' ? 'light' : 'dark';
    store.set('gori-theme', root.dataset.theme);
    syncIcon();
  });
  mq.addEventListener?.('change', syncIcon);
  syncIcon();

  // Copy buttons
  const announce = document.getElementById('announce');
  const CHECK = '<path d="M20 6 9 17l-5-5"/>';
  document.querySelectorAll('[data-copy-from]').forEach(btn => btn.addEventListener('click', async () => {
    const src = document.getElementById(btn.dataset.copyFrom);
    const text = src.innerText.trim();
    const svg = btn.querySelector('svg'), prev = svg.innerHTML;
    try { await navigator.clipboard.writeText(text); }
    catch {
      const r = document.createRange(); r.selectNodeContents(src);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    }
    svg.innerHTML = CHECK;
    announce.textContent = lang === 'ko' ? KO.copied : T_COPIED_EN;
    setTimeout(() => { svg.innerHTML = prev; announce.textContent = ''; }, 2000);
  }));

  applyLang();
})();
