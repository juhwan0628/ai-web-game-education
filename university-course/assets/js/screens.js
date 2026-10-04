import { appConfig } from "./config.js?v=202606032322";
import { lessonSlides } from "./slides.js?v=202606031355";
import { antigravitySlides } from "./antigravity-slides.js?v=202606032322";
import { assetsSlides } from "./assets-slides.js?v=202606031355";
import { aetherForgeSlides } from "./aetherforge-slides.js?v=202606031515";
import { nanobananaSlides } from "./nanobanana-slides.js";
import { formatTimer, getTimer } from "./timer.js?v=202606031355";

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (match) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[match]));
}

export function getScreenIndex(id) {
  return Math.max(0, appConfig.screens.findIndex((screen) => screen.id === id));
}

export function screenHeader(id, title, lead, wide = false) {
  const number = String(getScreenIndex(id) + 1).padStart(2, "0");
  const screen = appConfig.screens[getScreenIndex(id)];
  return `
    <span class="screen-kicker">${number} · ${screen.label}</span>
    <h1>${escapeHtml(title)}</h1>
    <p class="${wide ? "lead wide" : "lead"}">${escapeHtml(lead)}</p>
  `;
}

export function activityTimer(screenId) {
  const minutes = appConfig.activityTimers[screenId];
  if (!minutes) return "";
  const timer = getTimer(screenId, minutes);
  return `
    <div class="activity-timer" data-timer-screen="${screenId}">
      <div class="timer-status">
        <strong>교사용 타이머</strong>
        <span>기본 ${minutes}분 · 시작을 눌러야 시간이 흐릅니다</span>
      </div>
      <div class="timer-display" data-timer-display>${formatTimer(timer.seconds)}</div>
      <div class="timer-controls" aria-label="타이머 조작">
        <button class="plain-button" type="button" data-timer-action="toggle" data-timer-toggle>${timer.running ? "정지" : "시작"}</button>
        <button class="plain-button" type="button" data-timer-action="reset">초기화</button>
        <button class="plain-button" type="button" data-timer-action="add">+1분</button>
        <button class="plain-button" type="button" data-timer-action="subtract">-1분</button>
      </div>
    </div>
  `;
}

function card(title, meta, detail, href = "", disabled = false) {
  const tag = href ? "a" : "div";
  const attrs = href
    ? ` href="${escapeHtml(href)}"${href.startsWith("http") ? " target=\"_blank\" rel=\"noopener\"" : ""}${href.endsWith(".zip") ? " download" : ""} aria-disabled="${disabled ? "true" : "false"}"`
    : "";
  const metaClass = disabled ? "meta pending" : "meta";
  return `
    <${tag} class="card"${attrs}>
      <span class="${metaClass}">${escapeHtml(disabled ? "링크 준비 중" : meta)}</span>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(detail)}</p>
    </${tag}>
  `;
}

function gameCard(team) {
  const ready = team.status === "submitted" || team.status === "checked";
  const title = team.title || "게임 제목 입력 전";
  const intro = team.intro || "한 줄 소개 입력 전";
  const href = ready ? `./teams/${team.id}/` : "#";
  const attrs = ` href="${escapeHtml(href)}" aria-disabled="${ready ? "false" : "true"}"`;
  return `
    <a class="card game-card" ${attrs}>
      <div class="game-card-top">
        <span class="team-badge">${escapeHtml(team.label)}</span>
        <span class="${ready ? "game-status" : "game-status pending"}">${escapeHtml(statusLabel(team.status))}</span>
      </div>
      <strong class="game-title">${escapeHtml(title)}</strong>
      <p class="game-intro">${escapeHtml(intro)}</p>
    </a>
  `;
}

function rows(items) {
  return items.map((item, index) => `
    <div class="activity-row">
      <span class="number">${index + 1}</span>
      <div>
        <h3>${escapeHtml(item[0])}</h3>
        <p>${escapeHtml(item[1])}</p>
      </div>
    </div>
  `).join("");
}

function statusLabel(status) {
  return {
    inactive: "비활성",
    empty: "준비 중",
    drafting: "기획 중",
    building: "제작 중",
    submitted: "발표 가능",
    checked: "검수 완료"
  }[status] || status || "준비 중";
}

const gddTemplate = String.raw`AI 협업 기반 게임 개발 마스터 명세서 (GDD)

조:
역할 분담: 개발자, 캐릭터 및 배경 디자이너, 사운드 디렉터

- 개발자 - HTML 핵심 로직 구현, 통합 및 디버깅:
- 캐릭터 및 배경 디자이너 - 그래픽 리소스 추출:
- 사운드 디렉터 - 배경 음악 생성:

1. 게임 개요
- 게임 타이틀:
- 게임 장르: [예: 스크롤 슈팅 / 횡스크롤 RPG / 스포츠 캐주얼 게임]
- 게임 설명 (한 줄 요약):
- 게임의 목표: [예: 제한 시간 60초 동안 살아남기 / 보스를 격파하여 행성을 구하기 / 최고 점수 갱신]

2. 게임 시스템 디자인
- 게임 진행 방식: [예: 시작 화면 -> 스테이지 선택 -> 게임 플레이 -> 결과창(성공/실패) -> 루프]
- 게임 룰 (게임 규칙):
  - 조작법: [예: 방향키로 이동, Spacebar로 점프/공격, 마우스 클릭으로 아이템 사용]
  - 점수/재화 획득 조건:
  - 체력 및 목숨 시스템: [예: 기본 목숨 3개, 장애물 충돌 시 1개 감소, 0이 되면 게임 오버]
- 게임 인터페이스 (UI/UX):
  - 화면 크기: 가로 [ ] px x 세로 [ ] px (추천: 800 x 600 또는 400 x 600)
  - 화면 표시 정보: [ ] 현재 점수 [ ] 남은 체력(HP) [ ] 제한 시간 타이머 [ ] 현재 스테이지 단계

3. 캐릭터 및 시나리오
- 주요 캐릭터 소개 (캐릭터 콘셉트):
  - 플레이어(PC): [이름: / 특징:]
  - 적/방해물(NPC): [이름: / 특징:]
- 스토리 개요 (시놉시스):
- 배경 설정: [예: 서기 2026년 오염된 사이버 공간 / 마법이 가득한 숲속 도서관 등]

4. 레벨 디자인 설계
- 스테이지 레벨 목록: 총 [ ] 개 스테이지로 구성.
- 각 레벨의 목적과 특징:
  - LV 1 (튜토리얼): 목적 [기본 조작 익히기] / 특징 [장애물 속도 느림, 맵 단순함]
  - LV 2 (일반): 목적 [ ] / 특징 [장애물 속도 증가, 아이템 등장 시작]
  - LV 3 (보스/최종): 목적 [ ] / 특징 [거대 장애물 등장, 패턴 다양화]

5. 게임 그래픽 아트 디자인 (디자인 파트 핵심)
- 캐릭터 디자인 (PC/NPC): [예: 2D 도트 스타일의 기사, 네온 오버레이가 들어간 로봇]
- 배경 디자인 (BGA): [예: 스크롤되는 밤하늘 배경, 고정된 회색 연구실 내부]
- 효과 디자인 (Effect): [예: 아이템 획득 시 반짝이는 노란 이펙트, 충돌 시 화면 흔들림]

6. 게임 사운드 디자인 (오디오 디자인)
- 배경음악 (BGM): [예: 플레이 중 - 빠른 템포의 8비트 신스웨이브 음악 / 메인 화면 - 잔잔한 로파이]
- 효과음 (SFX): [예: 점프할 때 - '뿅' 소리 / 아이템 먹을 때 - '딩동' 맑은 소리 / 게임오버 - '콰광']
- 목소리 (Voice): [예: 게임 시작 시 AI 보이스로 "Ready, Go!" 출력]

7. 게임 플레이 테스트 계획
결과물을 조립한 후 완성도를 높이기 위한 디버깅 및 QA 계획입니다.

- 플레이 테스트 계획
  - 체크리스트: [ ] 조작감은 부드러운가? [ ] 난이도가 너무 불쾌하지 않은가? [ ] 버그로 멈추지 않는가?
- 게임 디버깅 계획:
  - 에러 발생 시 크롬 개발자 도구(F12) 콘솔 로그 확인
  - 해당 코드 블록과 문제 상황을 AI 에이전트에게 전달하여 코드 수정 진행

8. 게임 출시 및 마케팅 계획 (BM)
- 게임 가격 (비즈니스 모델): [$15]
- 게임 마케팅 전략:
  - 타겟 유저: [학교 친구들 및 선생님]
  - 홍보 방법: [교내 게시판에 QR 코드가 포함된 포스터 부착, AI 홍보 문구 생성 기능을 활용한 단체 채팅방 홍보]`;

export function renderFlowBlock(block) {
  if (block.type === "copy") return `<div class="flow-copy">${block.html}</div>`;
  if (block.type === "diagram") return `<div class="flow-visual">${block.html}</div>`;
  if (block.type === "image") {
    return `
      <figure class="practice-image-frame">
        <img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt || "")}" onerror="this.closest('.practice-image-frame').classList.add('is-missing'); this.remove();">
        <figcaption>${escapeHtml(block.alt || "실습 이미지")}</figcaption>
        <span class="missing-image">이미지를 이 경로에 넣어 주세요: ${escapeHtml(block.src)}</span>
      </figure>
    `;
  }
  if (block.type === "link-card") {
    return `
      <a class="card slide-link-card" href="${escapeHtml(block.href)}" download>
        <span class="meta">${escapeHtml(block.label)}</span>
        <h3>${escapeHtml(block.title)}</h3>
        <p>${escapeHtml(block.text)}</p>
      </a>
    `;
  }
  if (block.type === "copy-template") {
    return `
      <div class="template-box">
        <div class="template-head">
          <strong>${escapeHtml(block.title)}</strong>
          <button class="plain-button copy-button" type="button" data-copy-target="${escapeHtml(block.id)}">복사</button>
        </div>
        <pre id="${escapeHtml(block.id)}">${escapeHtml(block.text)}</pre>
      </div>
    `;
  }
  if (block.type === "callout") {
    return `
      <div class="flow-callout">
        <strong>${escapeHtml(block.label)}</strong>
        <p>${escapeHtml(block.text)}</p>
      </div>
    `;
  }
  return "";
}

function renderStart() {
  return `
    <section class="start-cover" aria-label="수업 시작">
      <div class="start-hero">
        <span class="screen-kicker">01 · 수업 시작</span>
        <h1 class="start-title">AI 도구를 활용하여<br>게임 개발하기</h1>
        <div class="start-meta">
          <span class="meta">인지교 10조</span>
          <span class="meta">조재현 · 최유빈 · 허주환</span>
        </div>
      </div>
      <div class="start-reason">
        <div>
          <span class="label">주제 선정 이유</span>
          <h2>왜 게임 개발인가?</h2>
        </div>
        <div class="grid three-grid">
          <div class="card start-reason-card">
            <span class="meta">1</span>
            <h3>학생들의 흥미와 몰입감 유발</h3>
            <p>규칙을 직접 설계하고 구현하는 과정에서 팀원들의 높은 흥미와 참여를 유도할 수 있는 최적의 주제입니다.</p>
          </div>
          <div class="card start-reason-card">
            <span class="meta">2</span>
            <h3>AI 활용 개발의 적합성</h3>
            <p>AI는 반복 코딩과 에러 디버깅을 지원하고, 사람은 창의적 기획과 규칙 설계에 집중합니다.</p>
          </div>
          <div class="card start-reason-card">
            <span class="meta">3</span>
            <h3>효율적인 팀 협업 체계 구축</h3>
            <p>범용 명세서를 기반으로 기획, 디자인, 개발 파트를 분배하고 AI를 활용해 병렬적으로 소통하는 법을 학습합니다.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderSlideScreen() {
  return `
    <article class="flow-card">
      <div class="flow-top">
        <div class="step-label" id="step-label"></div>
        <div class="slide-controls" aria-label="카드 넘기기">
          <button class="slide-button" type="button" id="prev-step" aria-label="이전 카드">‹</button>
          <button class="slide-button" type="button" id="next-step" aria-label="다음 카드">›</button>
        </div>
      </div>
      <h3 id="step-title"></h3>
      <div class="flow-body" id="step-body"></div>
    </article>
  `;
}

function renderWrite() {
  return `
    ${screenHeader("write", "SPEC.md를 먼저 완성합니다.", "이 단계에서는 다른 도구를 열지 않습니다. 팀이 먼저 게임 목표, 규칙, 화면, 역할을 문서로 합의합니다.")}
    ${activityTimer("write")}
    <div class="grid two-grid">
      ${rows([
        ["게임 한 문장 정하기", "플레이어가 무엇을 해서 어떤 재미를 느끼는지 적습니다."],
        ["규칙을 수치로 쓰기", "점수, 시간, 목숨, 속도처럼 확인 가능한 조건을 정합니다."],
        ["화면을 나누기", "시작 화면, 게임 화면, 결과 화면에 필요한 내용을 적습니다."],
        ["에셋 목록 만들기", "이미지와 오디오 파일명을 영어 소문자 기준으로 정합니다."],
        ["개발 조건 정리", "외부 URL, CDN, 서버, 로그인 금지 조건을 포함합니다."],
        ["수정 기록 칸 남기기", "테스트 후 문제와 수정 요청을 기록할 표를 둡니다."]
      ])}
    </div>
    <section class="screen-section">
      <h2>SPEC 양식</h2>
      <div class="template-box">
        <div class="template-head">
          <strong>AI 협업 기반 게임 개발 마스터 명세서 (GDD)</strong>
          <button class="plain-button copy-button" type="button" data-copy-target="gdd-template">복사</button>
        </div>
        <pre id="gdd-template">${escapeHtml(gddTemplate)}</pre>
      </div>
    </section>
  `;
}

function renderAssets() {
  return `
    ${screenHeader("assets", "이미지와 음악은 별도 작업물입니다.", "코드가 먼저 나와도 최종 제출 전에는 로컬 에셋 파일을 연결해야 합니다.")}
    ${activityTimer("assets")}
    <div class="grid two-grid">
      <div class="card"><span class="meta">이미지</span><h3>assets/images</h3><p>플레이어, 적, 배경, 아이템 이미지를 넣습니다.</p></div>
      <div class="card"><span class="meta">오디오</span><h3>assets/audio</h3><p>배경음악, 클릭, 충돌, 성공, 실패 효과음을 넣습니다.</p></div>
    </div>
    <section class="screen-section">
      <h2>파일명 규칙</h2>
      <div class="chip-list">
        <span class="chip">영어 소문자</span>
        <span class="chip">숫자</span>
        <span class="chip">하이픈</span>
        <span class="chip">공백 금지</span>
        <span class="chip">한글 파일명 금지</span>
      </div>
      <div class="template-box">
        <div class="template-head">
          <strong>예시 파일명</strong>
          <button class="plain-button copy-button" type="button" data-copy-target="asset-examples">복사</button>
        </div>
        <pre id="asset-examples">player.png
enemy-basic.png
background-stage-1.png
bgm-main.mp3
jump.wav
hit.wav
game-over.mp3</pre>
      </div>
    </section>
  `;
}

function renderBuild() {
  return `
    ${screenHeader("build", "Antigravity에는 SPEC과 폴더 구조를 함께 줍니다.", "개발 담당은 임의로 새 기능을 늘리지 않고, SPEC.md 기준으로 index.html과 로컬 에셋을 통합합니다.", true)}
    ${activityTimer("build")}
    <div class="template-box">
      <div class="template-head">
        <strong>권장 요청 순서</strong>
        <button class="plain-button copy-button" type="button" data-copy-target="antigravity-prompt">복사</button>
      </div>
      <pre id="antigravity-prompt">1. 이 폴더의 SPEC.md를 먼저 읽어줘.
2. SPEC.md에 적힌 게임 규칙과 화면 구성을 기준으로 index.html을 만들어줘.
3. 외부 URL, CDN, fetch, 서버, 데이터베이스, 로그인 기능은 사용하지 마.
4. 브라우저에서 바로 실행되는 정적 웹게임으로 만들어줘.
5. SPEC.md와 다른 기능을 임의로 추가하지 마.
6. assets/images 폴더의 이미지 파일을 게임에 연결해줘.
나중에 디자이너 조원이 추출할 실제 파일명과 매칭할 수 있도록 코드 최상단에 전역 상수로 분리하고, 각 이미지의 역할과 렌더링 명세를 아래 조건에 맞게 확인 및 반영해줘.

- 플레이어 캐릭터 이미지: player.png 예상
  - 기존의 단순한 도형(원 또는 사각형) 자리에 이 일러스트 이미지를 로드하여 반영해줘.
  - 게임 화면 내의 플레이어 캐릭터 원형(Circle) 영역 내부에 이미지가 깨지지 않고 예쁘게 클리핑(원형 자르기)되어 정중앙에 그려지도록 구현해줘.
  - 클리핑 후 다른 오브젝트에 영향이 없도록 ctx.save()와 ctx.restore()를 적절히 사용해줘.
  - 하단 HUD의 초상화(Portrait) 사각형 영역에도 동일한 플레이어 이미지가 크기에 맞춰 자동으로 채워지도록 인터페이스 함수를 수정해줘.

7. assets/audio 폴더의 음악과 효과음을 게임에 연결해줘.
나중에 사운드 디렉터 조원이 완성할 실제 파일명과 매칭할 수 있도록 코드 최상단에 파일 경로 변수를 명확히 분리하고, 각 오디오 리소스의 출력 타이밍과 브라우저 예외 처리를 아래 조건에 맞게 확인 및 반영해줘.

- 배경음악: bgm.mp3 예상
  - 끊기지 않도록 loop = true 및 volume = 0.5 설정으로 기본 세팅해줘.
  - 브라우저의 오디오 자동 재생 차단 정책(Autoplay Policy)을 우회할 수 있도록, 사용자가 게임 화면에서 시작(Start) 또는 게임 오버 후 다시 시작(Restart) 버튼을 직접 클릭하는 순간 오디오 객체가 활성화되며 처음부터 깨끗하게 재생(play())되도록 코드를 삽입해줘.
  - 게임 오버(GAMEOVER) 트리거가 발생하는 순간에는 재생 중이던 BGM이 즉시 일시정지(pause())되도록 처리해줘.

8. 완성 후 index.html만 열어도 이미지와 오디오가 로컬 파일 기준으로 동작하는지 확인해줘.</pre>
    </div>
  `;
}

function renderTest() {
  return `
    ${screenHeader("test", "실행해 보고 SPEC 기준으로 고칩니다.", "AI 결과물은 완성본이 아니라 초안입니다. 기대한 동작과 실제 동작을 나누어 적습니다.")}
    ${activityTimer("test")}
    <div class="grid two-grid">
      ${rows([
        ["브라우저에서 실행", "팀 폴더의 index.html을 Chrome 또는 Edge로 엽니다."],
        ["조작 확인", "이동, 공격, 클릭, 다시 시작이 되는지 봅니다."],
        ["규칙 비교", "점수, 시간, 승리, 패배 조건이 SPEC.md와 같은지 확인합니다."],
        ["에셋 확인", "이미지와 음악이 로컬 파일로 연결되는지 확인합니다."],
        ["수정 요청 기록", "문제, 기대한 동작, 실제 동작, 수정 요청을 SPEC.md에 적습니다."],
        ["다시 실행", "수정 후 같은 문제를 다시 확인합니다."]
      ])}
    </div>
  `;
}

function renderSubmit() {
  return `
    ${screenHeader("submit", "팀 폴더를 zip으로 압축해 제출합니다.", "zip을 풀었을 때 바로 team01 같은 팀 폴더가 보여야 합니다.")}
    ${activityTimer("submit")}
    <div class="grid two-grid">
      ${card("Google Forms 제출", "열기", "팀 대표가 zip 파일을 제출합니다.", appConfig.links.submitForm, appConfig.links.submitForm === "#")}
      <div class="card">
        <span class="meta">필수 구조</span>
        <h3>team01.zip</h3>
        <p>README.md, SPEC.md, index.html, assets/images, assets/audio를 포함합니다.</p>
      </div>
    </div>
    <section class="screen-section">
      <h2>제출 전 확인</h2>
      <div class="chip-list">
        <span class="chip">README.md</span>
        <span class="chip">SPEC.md</span>
        <span class="chip">index.html</span>
        <span class="chip">assets/images</span>
        <span class="chip">assets/audio</span>
        <span class="chip">외부 URL 없음</span>
        <span class="chip">유명 캐릭터 없음</span>
      </div>
    </section>
  `;
}

function renderShare(data) {
  const teams = (data?.activeTeams || []).filter((team) => team.status !== "inactive");
  const teamCards = teams.map(gameCard).join("");

  return `
    ${screenHeader("share", "완성한 게임과 제작 과정을 설명합니다.", "발표는 결과만 보여주는 시간이 아니라, SPEC에서 어떤 선택을 했는지 말하는 시간입니다.")}
    ${activityTimer("share")}
    <section class="screen-section">
      <h2>팀별 게임 모음</h2>
      <div class="grid class-grid">
        ${teamCards}
      </div>
    </section>
    <section class="screen-section">
      <h2>발표할 내용</h2>
    </section>
    <div class="grid two-grid">
      ${rows([
        ["게임 목표", "플레이어가 무엇을 하면 되는지 설명합니다."],
        ["핵심 규칙", "점수, 승리, 패배 조건을 말합니다."],
        ["역할별 작업", "개발, 이미지, 음악 담당이 무엇을 만들었는지 말합니다."],
        ["수정한 점", "처음 결과물에서 어떤 문제를 발견하고 고쳤는지 말합니다."],
        ["아쉬운 점", "시간이 더 있으면 바꾸고 싶은 점을 말합니다."],
        ["배운 점", "SPEC 중심 개발에서 알게 된 점을 말합니다."]
      ])}
    </div>
  `;
}

export const renderers = {
  start: renderStart,
  concept: renderSlideScreen,
  write: renderWrite,
  antigravity: renderSlideScreen,
  assets: renderSlideScreen,
  nanobanana: renderSlideScreen,
  imageTool: renderSlideScreen,
  build: renderBuild,
  test: renderTest,
  submit: renderSubmit,
  share: renderShare
};

export const slideDecks = {
  concept: lessonSlides,
  antigravity: antigravitySlides,
  assets: assetsSlides,
  nanobanana: nanobananaSlides,
  imageTool: aetherForgeSlides
};

export { lessonSlides, antigravitySlides, assetsSlides, nanobananaSlides, aetherForgeSlides };
