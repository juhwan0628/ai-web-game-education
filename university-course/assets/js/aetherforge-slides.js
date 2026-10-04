const imagePath = (number) => `./assets/img/aetherforge/${number}.png`;

export const aetherForgeSlides = [
  {
    id: "why-aetherforge",
    step: "",
    title: "왜 AetherForge AI를 사용하는가",
    blocks: [
      {
        type: "copy",
        html: "<p><strong>AetherForge AI</strong>는 단순히 이미지를 찾는 도구가 아니라, 게임 장르와 분위기에 맞는 고품질 게임 에셋을 AI로 직접 생성하는 전문 이미지 제작 도구입니다.</p><p>오늘 수업에서는 SPEC.md에 정의한 그래픽 아트 디자인을 기준으로 이미지를 만들어 assets/images 폴더에 저장합니다.</p>"
      },
      {
        type: "diagram",
        html: "<div class=\"diagram-stack\"><div class=\"diagram-card is-green\"><strong>게임 에셋 생성</strong><span>캐릭터·배경·아이템 이미지 제작</span></div><div class=\"diagram-card is-blue\"><strong>스타일 일관성 유지</strong><span>SPEC 기준 세계관·그림체 통일</span></div><div class=\"diagram-card is-yellow\"><strong>파일 저장</strong><span>assets/images 폴더에 저장 후 게임에 연결</span></div></div>"
      },
      {
        type: "callout",
        label: "오늘 연결",
        text: "AetherForge AI는 캐릭터 및 배경 디자이너가 SPEC의 그래픽 항목을 실제 이미지 파일로 완성하는 단계에서 사용합니다."
      }
    ]
  },
  {
    id: "image-01",
    step: "",
    title: "AetherForge AI 준비하기",
    blocks: [{ type: "image", src: imagePath(10), alt: "AetherForge AI 슬라이드 10" }]
  },
  {
    id: "image-02",
    step: "",
    title: "AetherForge AI 준비하기",
    blocks: [{ type: "image", src: imagePath(11), alt: "AetherForge AI 슬라이드 11" }]
  },
  {
    id: "image-03",
    step: "",
    title: "AetherForge AI 준비하기",
    blocks: [{ type: "image", src: imagePath(12), alt: "AetherForge AI 슬라이드 12" }]
  },
  {
    id: "image-04",
    step: "",
    title: "AetherForge AI 준비하기",
    blocks: [{ type: "image", src: imagePath(13), alt: "AetherForge AI 슬라이드 13" }]
  },
  {
    id: "image-05",
    step: "",
    title: "AetherForge AI 준비하기",
    blocks: [{ type: "image", src: imagePath(14), alt: "AetherForge AI 슬라이드 14" }]
  }
];
