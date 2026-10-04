const imagePath = (number) => `./assets/img/nanobanana/${number}.png`;

export const nanobananaSlides = [
  {
    id: "why-nanobanana",
    step: "",
    title: "왜 Nanobanana AI를 사용하는가",
    blocks: [
      {
        type: "copy",
        html: "<p><strong>Nanobanana AI</strong>는 단순히 이미지를 검색하는 도구가 아니라, 게임의 세계관과 캐릭터 컨셉에 맞는 이미지를 AI로 직접 생성하는 비주얼 제작 도구입니다.</p><p>오늘 수업에서는 SPEC.md에 정의한 캐릭터와 배경 디자인을 기준으로 이미지를 만들어 assets/images 폴더에 저장합니다.</p>"
      },
      {
        type: "diagram",
        html: "<div class=\"diagram-stack\"><div class=\"diagram-card is-green\"><strong>캐릭터 생성</strong><span>플레이어·적·NPC 이미지 제작</span></div><div class=\"diagram-card is-blue\"><strong>배경·아이템 생성</strong><span>스테이지 배경과 게임 오브젝트 제작</span></div><div class=\"diagram-card is-yellow\"><strong>파일 저장</strong><span>assets/images 폴더에 저장 후 게임에 연결</span></div></div>"
      },
      {
        type: "callout",
        label: "오늘 연결",
        text: "Nanobanana AI는 캐릭터 및 배경 디자이너가 SPEC의 그래픽 항목을 실제 이미지 파일로 만드는 단계에서 사용합니다."
      }
    ]
  },
  {
    id: "nanobanana-01",
    step: "",
    title: "Nanobanana AI 준비하기",
    blocks: [{ type: "image", src: imagePath(7), alt: "Nanobanana AI 슬라이드 7" }]
  },
  {
    id: "nanobanana-02",
    step: "",
    title: "Nanobanana AI 준비하기",
    blocks: [{ type: "image", src: imagePath(8), alt: "Nanobanana AI 슬라이드 8" }]
  },
  {
    id: "nanobanana-03",
    step: "",
    title: "Nanobanana AI 준비하기",
    blocks: [{ type: "image", src: imagePath(9), alt: "Nanobanana AI 슬라이드 9" }]
  }
];
