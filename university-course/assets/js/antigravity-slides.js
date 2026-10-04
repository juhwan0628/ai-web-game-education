const imagePath = (number) => `./assets/img/antigravity/${number}.png`;
const sampleZipPath = "./downloads/student-submission-example.zip?v=202606032322";

export const antigravitySlides = [
  {
    id: "why-antigravity",
    step: "Antigravity 01 / 14",
    title: "왜 Antigravity를 사용하는가",
    blocks: [
      {
        type: "copy",
        html: "<p><strong>Antigravity</strong>는 단순히 답을 말해 주는 채팅 도구가 아니라, 프로젝트 폴더 안의 파일을 읽고 수정하며 실행 결과를 바탕으로 다시 고칠 수 있는 개발 도구입니다.</p><p>오늘 수업에서는 SPEC.md를 먼저 작성한 뒤, 그 문서를 기준으로 HTML, 이미지, 음악 파일을 하나의 웹게임 폴더로 통합합니다.</p>"
      },
      {
        type: "diagram",
        html: "<div class=\"diagram-stack\"><div class=\"diagram-card is-green\"><strong>SPEC 기준 개발</strong><span>정해 둔 규칙과 화면을 기준으로 구현</span></div><div class=\"diagram-card is-blue\"><strong>폴더 단위 작업</strong><span>index.html과 assets 폴더를 함께 관리</span></div><div class=\"diagram-card is-yellow\"><strong>실행 후 수정</strong><span>오류를 보고 다시 요청하며 개선</span></div></div>"
      },
      {
        type: "callout",
        label: "오늘 연결",
        text: "Antigravity는 SPEC을 실제 실행 가능한 게임 폴더로 바꾸는 단계에서 사용합니다."
      }
    ]
  },
  {
    id: "install-01",
    step: "설치 01 / 13",
    title: "허브 좌측 하단에서 Antigravity 열기",
    blocks: [{ type: "image", src: imagePath(1), alt: "허브 좌측 하단의 Antigravity 버튼을 눌러 웹페이지를 엽니다." }]
  },
  {
    id: "install-02",
    step: "설치 02 / 13",
    title: "운영체제에 맞는 설치 파일 선택",
    blocks: [{ type: "image", src: imagePath(2), alt: "사용 중인 운영체제에 맞는 설치 파일을 선택합니다." }]
  },
  {
    id: "install-03",
    step: "설치 03 / 13",
    title: "다음 버튼을 눌러 설치 완료",
    blocks: [{ type: "image", src: imagePath(3), alt: "설치 화면의 다음 버튼을 눌러 설치를 완료합니다." }]
  },
  {
    id: "install-04",
    step: "준비 04 / 13",
    title: "새 프로젝트 생성",
    blocks: [{ type: "image", src: imagePath(4), alt: "Antigravity에서 새 프로젝트를 생성합니다." }]
  },
  {
    id: "install-05",
    step: "준비 05 / 13",
    title: "폴더 추가하기",
    blocks: [{ type: "image", src: imagePath(5), alt: "프로젝트에 작업 폴더를 추가합니다." }]
  },
  {
    id: "install-06",
    step: "준비 06 / 13",
    title: "로컬에 새 폴더 생성",
    blocks: [{ type: "image", src: imagePath(6), alt: "내 컴퓨터에 새 작업 폴더를 만듭니다." }]
  },
  {
    id: "install-07",
    step: "준비 07 / 13",
    title: "폴더 추가 완료",
    blocks: [{ type: "image", src: imagePath(7), alt: "Antigravity에 팀 작업 폴더가 추가된 상태를 확인합니다." }]
  },
  {
    id: "install-08",
    step: "준비 08 / 13",
    title: "제출 예시 zip 다운로드",
    blocks: [
      {
        type: "copy",
        html: "<p>이제 팀 작업의 기본 폴더 구조를 준비합니다.</p><p><strong>제출 예시 zip</strong>을 먼저 다운로드한 뒤, 압축을 풀고 그 안의 폴더 구조를 기준으로 작업을 시작합니다.</p>"
      },
      {
        type: "link-card",
        href: sampleZipPath,
        label: "다운로드",
        title: "student-submission-example.zip",
        text: "README.md, SPEC.md, index.html, assets/images, assets/audio가 들어 있는 예시 폴더입니다."
      }
    ]
  },
  {
    id: "install-09",
    step: "준비 09 / 13",
    title: "제공한 양식을 폴더에 붙여넣기",
    blocks: [{ type: "image", src: imagePath(8), alt: "제공한 GDD 양식을 팀 폴더의 SPEC.md에 복사해 붙여넣습니다." }]
  },
  {
    id: "install-10",
    step: "준비 10 / 13",
    title: "작성한 명세서로 SPEC.md 교체",
    blocks: [
      {
        type: "copy",
        html: "<p>다운로드한 예시 폴더 안에는 기본 SPEC.md가 들어 있습니다.</p><p>이 파일을 열고, 앞 단계에서 우리 팀이 작성한 <strong>AI 협업 기반 게임 개발 마스터 명세서(GDD)</strong> 내용으로 바꿉니다.</p>"
      },
      {
        type: "diagram",
        html: "<div class=\"diagram-flow\"><div class=\"diagram-card is-green\"><strong>기본 SPEC.md 열기</strong><span>예시 폴더 안의 파일</span></div><div class=\"diagram-arrow\">→</div><div class=\"diagram-card is-blue\"><strong>내용 전체 교체</strong><span>우리 팀 GDD 붙여넣기</span></div><div class=\"diagram-arrow\">→</div><div class=\"diagram-card is-yellow\"><strong>저장</strong><span>파일명은 SPEC.md 유지</span></div></div>"
      },
      {
        type: "callout",
        label: "중요",
        text: "파일 이름은 반드시 SPEC.md로 유지합니다. Antigravity는 이 파일을 기준으로 게임을 개발합니다."
      }
    ]
  },
  {
    id: "install-11",
    step: "개발 11 / 13",
    title: "SPEC대로 개발 지시하기",
    blocks: [{ type: "image", src: imagePath(9), alt: "작성한 SPEC.md를 기준으로 게임 개발을 요청합니다." }]
  },
  {
    id: "install-12",
    step: "개발 12 / 13",
    title: "개발 완료 결과 확인",
    blocks: [{ type: "image", src: imagePath(10), alt: "Antigravity가 생성한 게임 파일과 결과를 확인합니다." }]
  },
  {
    id: "install-13",
    step: "실행 13 / 13",
    title: "index.html을 클릭해 실행해 보기",
    blocks: [{ type: "image", src: imagePath(11), alt: "폴더 안의 index.html 파일을 클릭해 브라우저에서 게임을 실행합니다." }]
  }
];
