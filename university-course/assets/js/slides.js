export const lessonSlides = [
  {
    id: "sdd-overview",
    step: "이론 01 / 03",
    title: "SDD: 스펙 중심 개발",
    blocks: [
      {
        type: "copy",
        html: "<p><strong>SDD(Spec-Driven Development, 스펙 중심 개발)</strong>은 코드를 작성하기 전에 시스템이 어떻게 작동해야 하는지 먼저 정의하는 개발 방식입니다.</p><p>이때 작성하는 문서를 <strong>명세서(Specification, SPEC)</strong>라고 부르며, 개발자는 SPEC을 기준으로 기능을 만들고 결과를 확인합니다.</p>"
      },
      {
        type: "diagram",
        html: "<div class=\"diagram-loop\"><div class=\"diagram-card is-green\"><strong>1. Steering</strong><span>목표와 조건 설정</span></div><div class=\"diagram-card is-blue\"><strong>2. Spec 생성</strong><span>기능과 규칙 문서화</span></div><div class=\"diagram-card is-yellow\"><strong>3. 검토 및 수정</strong><span>빠진 조건 보완</span></div><div class=\"diagram-card\"><strong>4. 정보 기반 개발</strong><span>SPEC 기준 구현</span></div></div>"
      },
      {
        type: "callout",
        label: "핵심",
        text: "SPEC은 개발 전에 세우는 약속이자, 개발 중 결과물을 판단하는 기준표입니다."
      }
    ]
  },
  {
    id: "why-sdd",
    step: "이론 02 / 03",
    title: "왜 스펙 중심 개발인가",
    blocks: [
      {
        type: "copy",
        html: "<p>AI와 함께 개발할 때 가장 큰 문제는 대화가 길어질수록 처음 정한 조건이 흐려지는 것입니다.</p><p><strong>SDD(Spec-Driven Development)</strong>는 SPEC을 기준으로 맥락을 고정하고, 결과물이 처음 목표에서 벗어나지 않게 도와줍니다.</p>"
      },
      {
        type: "diagram",
        html: "<div class=\"diagram-loop\"><div class=\"diagram-card is-green\"><strong>맥락 유지</strong><span>처음 정한 조건 보존</span></div><div class=\"diagram-card is-blue\"><strong>환각 차단</strong><span>없는 기능 임의 추가 방지</span></div><div class=\"diagram-card is-yellow\"><strong>역할 분할</strong><span>여러 AI 작업 병렬 진행</span></div><div class=\"diagram-card\"><strong>QA 용이</strong><span>SPEC 기준 테스트</span></div></div>"
      },
      {
        type: "callout",
        label: "핵심",
        text: "SPEC이 있으면 개발, 이미지, 음악, 테스트를 나누어 진행해도 같은 목표를 기준으로 확인할 수 있습니다."
      }
    ]
  },
  {
    id: "practice-preview",
    step: "이론 03 / 03",
    title: "4단계 핵심 워크플로우",
    blocks: [
      {
        type: "copy",
        html: "<p>오늘 실습은 한 사람이 모든 작업을 처리하는 방식이 아닙니다.</p><p>3인 1조가 개발, 디자인, 사운드 역할을 나누고 AI 에이전트를 활용해 부문별 결과물을 만든 뒤 하나의 웹게임으로 통합합니다.</p>"
      },
      {
        type: "diagram",
        html: "<div class=\"diagram-loop\"><div class=\"diagram-card is-green\"><strong>1. 역할 분배</strong><span>개발자 · 디자이너 · 사운드 디렉터</span></div><div class=\"diagram-card is-blue\"><strong>2. 병렬 진행</strong><span>AI 에이전트로 결과물 생성</span></div><div class=\"diagram-card is-yellow\"><strong>3. 통합·디버깅</strong><span>코드, 이미지, 사운드 연결</span></div><div class=\"diagram-card\"><strong>4. 최종 업로드</strong><span>패키징 및 플랫폼 배포</span></div></div>"
      },
      {
        type: "callout",
        label: "실습 구조",
        text: "각자 만든 결과물은 따로 끝나는 것이 아니라, 마지막에 하나의 실행 가능한 게임으로 합쳐집니다."
      }
    ]
  }
];
