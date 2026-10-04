const imagePath = (number) => `./assets/img/stable-audio/${number}.png`;

export const assetsSlides = [
  {
    id: "why-stable-audio",
    step: "",
    title: "왜 Stable Audio를 사용하는가",
    blocks: [
      {
        type: "copy",
        html: "<p><strong>Stable Audio</strong>는 단순히 음악을 찾는 도구가 아니라, 게임의 분위기와 장면에 맞는 배경음악과 효과음을 AI로 직접 생성하는 오디오 제작 도구입니다.</p><p>오늘 수업에서는 SPEC.md에 정의한 사운드 디자인을 기준으로 BGM과 효과음을 만들어 assets/audio 폴더에 저장합니다.</p>"
      },
      {
        type: "diagram",
        html: "<div class=\"diagram-stack\"><div class=\"diagram-card is-green\"><strong>BGM 생성</strong><span>게임 분위기에 맞는 배경음악 제작</span></div><div class=\"diagram-card is-blue\"><strong>효과음 생성</strong><span>클릭, 충돌, 성공, 실패 사운드 제작</span></div><div class=\"diagram-card is-yellow\"><strong>파일 저장</strong><span>assets/audio 폴더에 저장 후 게임에 연결</span></div></div>"
      },
      {
        type: "callout",
        label: "오늘 연결",
        text: "Stable Audio는 사운드 디렉터가 SPEC의 오디오 항목을 실제 파일로 만드는 단계에서 사용합니다."
      }
    ]
  },
  {
    id: "audio-01",
    step: "",
    title: "Stable Audio 준비하기",
    blocks: [{ type: "image", src: imagePath(1), alt: "Stable Audio 슬라이드 1" }]
  },
  {
    id: "audio-02",
    step: "",
    title: "Stable Audio 준비하기",
    blocks: [{ type: "image", src: imagePath(2), alt: "Stable Audio 슬라이드 2" }]
  },
  {
    id: "audio-03",
    step: "",
    title: "Stable Audio 준비하기",
    blocks: [{ type: "image", src: imagePath(3), alt: "Stable Audio 슬라이드 3" }]
  },
  {
    id: "audio-04",
    step: "",
    title: "Stable Audio 준비하기",
    blocks: [{ type: "image", src: imagePath(4), alt: "Stable Audio 슬라이드 4" }]
  },
  {
    id: "audio-05",
    step: "",
    title: "Stable Audio 준비하기",
    blocks: [{ type: "image", src: imagePath(5), alt: "Stable Audio 슬라이드 5" }]
  },
  {
    id: "audio-06",
    step: "",
    title: "Stable Audio 준비하기",
    blocks: [{ type: "image", src: imagePath(6), alt: "Stable Audio 슬라이드 6" }]
  }
];
