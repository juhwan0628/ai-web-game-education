export const appConfig = {
  title: "컴퓨터 교육 수업 허브",
  subtitle: "SPEC 중심 웹게임 제작",
  toolLabels: {
    antigravity: "Antigravity",
    imageTool: "AetherForge AI",
    stableAudio: "Stable Audio"
  },
  links: {
    antigravity: "https://antigravity.google/",
    imageTool: "https://www.aetherforgeai.com/",
    stableAudio: "https://stableaudio.com",
    submitForm: "#",
    teamsData: "./data/teams.json",
    readmeTemplate: "./templates/README.template.md",
    specTemplate: "./templates/SPEC.template.md",
    sampleSubmissionZip: "./downloads/student-submission-example.zip?v=202606032322"
  },
  screens: [
    { id: "start", label: "수업 시작", title: "오늘은 SPEC으로 게임을 만듭니다" },
    { id: "concept", label: "이론", title: "SDD와 AI 도구를 이해합니다" },
    { id: "write", label: "SPEC 작성하기", title: "게임 설계를 문서로 합의합니다" },
    { id: "antigravity", label: "Antigravity 준비하기", title: "개발 도구를 설치하고 팀 폴더를 엽니다" },
    { id: "assets", label: "Stable Audio 준비하기", title: "게임 음악과 효과음을 준비합니다" },
    { id: "nanobanana", label: "Nanobanana AI 준비하기", title: "게임 캐릭터와 이미지를 준비합니다" },
    { id: "imageTool", label: "AetherForge AI 준비하기", title: "게임 이미지와 배경을 준비합니다" },
    { id: "build", label: "Antigravity로 통합하기", title: "SPEC과 에셋을 게임 폴더로 합칩니다" },
    { id: "test", label: "실행·테스트·수정하기", title: "실행해 보고 SPEC 기준으로 고칩니다" },
    { id: "submit", label: "제출하기", title: "팀 폴더를 zip으로 압축해 제출합니다" },
    { id: "share", label: "공유·발표", title: "완성한 게임과 제작 과정을 설명합니다" }
  ],
  activityTimers: {
    write: 15,
    assets: 12,
    nanobanana: 12,
    imageTool: 12,
    build: 20,
    test: 10,
    submit: 5,
    share: 8
  }
};
