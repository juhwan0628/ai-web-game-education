const IMAGE_PATHS = {
  // 플레이어 캐릭터 이미지: 캔버스 원형 캐릭터와 하단 HUD 초상화에 사용한다.
  player: "assets/images/player.png",
  // 배경 이미지: 각 스테이지 바닥/교실 배경 위에 어둡게 깔아 사용한다.
  background: "assets/images/background.png",
  // 적/NPC 이미지
  enemyBlind: "assets/images/enemy-blind.png",
  enemyHeadless: "assets/images/enemy-headless.png",
  enemySmiler: "assets/images/enemy-smiler.png",
  enemyBoss: "assets/images/enemy-boss.png",
  // 아이템/오브젝트 이미지
  flashlight: "assets/images/item-flashlight.png",
  recordBook: "assets/images/item-record-book.png",
  key: "assets/images/item-key.png",
  diary: "assets/images/item-diary.png",
  heal: "assets/images/item-heal.png",
  code: "assets/images/item-code.png",
  door: "assets/images/object-door.png",
  hazard: "assets/images/object-hazard.png",
};

const AUDIO_PATHS = {
  // 배경음악: Start/Restart 버튼 클릭 시 처음부터 재생하고, 게임오버 시 일시정지한다.
  bgm: "assets/audio/bgm.mp3",
  // 효과음: SPEC.md의 미닫이문 소리와 형광등 깜빡임 소리에 대응한다.
  slidingDoor: "assets/audio/sliding-door.mp3",
  fluorescent: "assets/audio/fluorescent.mp3",
};

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const titleCard = document.querySelector("#titleCard");
const startButton = document.querySelector("#startButton");
const restartButton = document.querySelector("#restartButton");
const playerPortraitEl = document.querySelector("#playerPortrait");
const healthEl = document.querySelector("#health");
const timerEl = document.querySelector("#timer");
const stageNameEl = document.querySelector("#stageName");
const objectiveEl = document.querySelector("#objective");
const hintEl = document.querySelector("#hint");

const keys = new Set();
const mouse = { x: canvas.width / 2, y: canvas.height / 2 };

const TILE = 40;
const PLAYER_RADIUS = 20;
const INTERACT_RADIUS = 54;
const JUMP_DURATION = 0.52;
const JUMP_HEIGHT = 22;
const PLAYER_SPEED = 152;
const PLAYER_ACCELERATION = 950;
const PLAYER_FRICTION = 1150;

const inventory = new Set();
const journal = [];
const images = loadImages();
const sounds = loadAudio();

let started = false;
let currentStageIndex = 0;
let lastTime = 0;
let messageTimer = 0;
let soundLevel = 0;
let finalTimer = 0;
let ending = null;
let screenShake = 0;

const player = {
  x: 110,
  y: 330,
  vx: 0,
  vy: 0,
  angle: 0,
  health: 3,
  invincible: 0,
  jumpCooldown: 0,
  jumpTime: 0,
  flash: false,
};

const stages = [
  {
    name: "LV 1. 교무실",
    spawn: { x: 110, y: 330 },
    color: "#1d2227",
    objective: "손전등, 학생기록부, 교무실 열쇠를 찾고 문을 열자.",
    hint: "E키로 가까운 물건과 상호작용한다. 창문 밖은 아무것도 보이지 않는다.",
    walls: [
      rect(0, 0, 960, 30),
      rect(0, 610, 960, 30),
      rect(0, 0, 30, 640),
      rect(930, 0, 30, 640),
      rect(160, 125, 145, 70),
      rect(380, 120, 145, 72),
      rect(615, 115, 180, 76),
      rect(150, 435, 220, 62),
      rect(510, 420, 210, 68),
      rect(790, 265, 32, 180),
    ],
    props: [
      prop(192, 146, 110, 34, "#3f4650"),
      prop(414, 144, 112, 34, "#3f4650"),
      prop(650, 142, 142, 34, "#3f4650"),
      prop(164, 458, 176, 20, "#34363a"),
      prop(542, 448, 142, 22, "#34363a"),
    ],
    items: [
      item("flashlight", "손전등", 190, 360, "손전등을 켰다. 마우스 방향으로 어둠을 밀어낼 수 있다."),
      item("recordBook", "학생기록부", 690, 360, "학생기록부에는 지워진 이름들이 빼곡하다."),
      item("officeKey", "교무실 열쇠", 835, 150, "녹슨 교무실 열쇠를 얻었다."),
    ],
    doors: [
      door(914, 270, 24, 92, 1, "officeKey", "교무실 문", "복도 끝에서 누군가 지나가는 그림자가 보였다."),
    ],
    hazards: [],
    enemies: [],
    notes: ["칠판 낙서: 선생님은 아직 퇴근하지 않았다."],
  },
  {
    name: "LV 2. 1층 복도",
    spawn: { x: 65, y: 320 },
    color: "#16191f",
    objective: "일기장 조각과 낡은 열쇠를 챙겨 중앙 계단으로 이동하자.",
    hint: "정종원은 보지 못하지만 큰 소리에 반응한다. 방향키를 짧게 누르며 천천히 움직이면 안전하다.",
    walls: [
      rect(0, 0, 960, 30),
      rect(0, 610, 960, 30),
      rect(0, 0, 30, 640),
      rect(930, 0, 30, 640),
      rect(140, 80, 34, 160),
      rect(310, 400, 36, 160),
      rect(498, 80, 34, 145),
      rect(676, 392, 36, 168),
      rect(820, 74, 42, 165),
    ],
    props: [
      prop(220, 115, 110, 34, "#302e2d"),
      prop(420, 478, 128, 34, "#302e2d"),
      prop(582, 126, 112, 34, "#302e2d"),
      prop(748, 476, 92, 34, "#302e2d"),
    ],
    items: [
      item("diary1", "일기장 조각 1", 250, 520, "일기장: 발소리를 내면 종원이가 온다."),
      item("oldKey", "낡은 열쇠", 585, 135, "낡은 열쇠를 얻었다. 2층으로 올라갈 수 있다."),
      item("heal1", "응급 처치 키트", 790, 520, "숨을 고르고 체력을 회복했다.", "heal"),
    ],
    doors: [
      door(914, 270, 24, 92, 2, "oldKey", "중앙 계단", "계단 위에서 목 없는 발소리가 울린다."),
    ],
    hazards: [
      hazard(382, 318, "깨진 유리"),
      hazard(712, 300, "쓰러진 의자"),
      hazard(850, 360, "빈 양동이"),
    ],
    enemies: [
      enemy("정종원", "blind", 470, 320, [
        { x: 235, y: 320 },
        { x: 520, y: 175 },
        { x: 765, y: 330 },
        { x: 530, y: 510 },
      ]),
    ],
    notes: ["교실 문틈에서 누군가 속삭인다. 도망치지 마."],
  },
  {
    name: "LV 3. 2층 교실과 특별실",
    spawn: { x: 80, y: 560 },
    color: "#17151a",
    objective: "교실, 컴퓨터실, 음악실의 기록을 모아 탈출문 코드 일부를 찾자.",
    hint: "목 없는 학생은 시야에 들면 돌진하고, 웃는 학생은 갑자기 나타나 소리를 퍼뜨린다.",
    walls: [
      rect(0, 0, 960, 30),
      rect(0, 610, 960, 30),
      rect(0, 0, 30, 640),
      rect(930, 0, 30, 640),
      rect(190, 30, 28, 250),
      rect(190, 390, 28, 220),
      rect(470, 30, 28, 205),
      rect(470, 350, 28, 260),
      rect(730, 30, 28, 248),
      rect(730, 390, 28, 220),
      rect(218, 278, 252, 28),
      rect(498, 306, 232, 28),
    ],
    props: [
      prop(64, 88, 84, 34, "#393237"),
      prop(284, 92, 120, 34, "#393237"),
      prop(544, 108, 120, 34, "#393237"),
      prop(796, 92, 78, 34, "#393237"),
      prop(276, 464, 120, 34, "#2d3038"),
      prop(556, 468, 122, 34, "#2d3038"),
    ],
    items: [
      item("diary2", "일기장 조각 2", 104, 105, "일기장: 선생님은 출석부에서 우리를 지웠다."),
      item("counselRecord", "학생 상담 기록", 345, 112, "상담 기록에는 한선생의 통제 방식이 적혀 있다."),
      item("pcHint", "컴퓨터실 힌트", 614, 125, "모니터에 숫자 284가 반복해서 깜빡인다."),
      item("codePart", "탈출문 코드 일부", 830, 500, "탈출문 코드 일부를 얻었다. 284가 마지막 단서다."),
      item("heal2", "붕대", 570, 520, "붕대로 상처를 감쌌다.", "heal"),
    ],
    doors: [
      door(914, 520, 24, 72, 3, "codePart", "현관으로 내려가는 계단", "아래층에서 거꾸로 매달린 그림자가 기다린다."),
    ],
    hazards: [
      hazard(260, 335, "넘어진 책상"),
      hazard(522, 264, "삐걱대는 마룻바닥"),
      hazard(702, 358, "금 간 피아노 의자"),
    ],
    enemies: [
      enemy("소찬혁", "headless", 600, 420, [
        { x: 580, y: 420 },
        { x: 860, y: 420 },
        { x: 835, y: 125 },
      ]),
      enemy("라현재", "smiler", 330, 430, [
        { x: 335, y: 430 },
        { x: 120, y: 510 },
        { x: 650, y: 160 },
      ]),
    ],
    notes: ["음악실 칠판: 선생님, 왜 이제 오셨어요?"],
  },
  {
    name: "LV 4. 중앙 계단과 현관",
    spawn: { x: 75, y: 320 },
    color: "#181012",
    objective: "마지막 열쇠를 얻고 제한 시간 안에 정문을 열어 탈출하자.",
    hint: "한선생은 계속 추격한다. E키로 장애물을 치우고 현관 장치에 코드를 입력한다.",
    timed: 75,
    walls: [
      rect(0, 0, 960, 30),
      rect(0, 610, 960, 30),
      rect(0, 0, 30, 640),
      rect(930, 0, 30, 640),
      rect(160, 90, 36, 160),
      rect(160, 390, 36, 160),
      rect(350, 30, 38, 220),
      rect(350, 390, 38, 220),
      rect(555, 90, 36, 170),
      rect(555, 380, 36, 170),
      rect(745, 30, 38, 230),
      rect(745, 390, 38, 220),
    ],
    props: [
      prop(240, 188, 84, 34, "#3f2428"),
      prop(440, 458, 84, 34, "#3f2428"),
      prop(642, 170, 84, 34, "#3f2428"),
      prop(812, 482, 60, 34, "#3f2428"),
    ],
    items: [
      item("finalKey", "마지막 열쇠", 455, 125, "마지막 열쇠를 얻었다. 현관문까지 뛰어라."),
      item("heal3", "회복 아이템", 610, 520, "마지막 힘을 끌어냈다.", "heal"),
    ],
    doors: [
      door(914, 275, 24, 92, "ending", "finalKey", "탈출문 비밀번호 입력 장치", "284를 입력했다. 새벽빛이 밀려 들어온다."),
    ],
    hazards: [
      hazard(256, 330, "잠긴 방화문"),
      hazard(494, 315, "넘어진 사물함"),
      hazard(706, 335, "엉킨 책상 더미"),
    ],
    enemies: [
      enemy("한선생", "boss", 45, 90, [
        { x: 80, y: 100 },
        { x: 260, y: 520 },
        { x: 500, y: 100 },
        { x: 740, y: 520 },
      ]),
    ],
    notes: ["한선생: 너도 이제 이 학교의 일부가 되어라."],
  },
];

function rect(x, y, w, h) {
  return { x, y, w, h };
}

function prop(x, y, w, h, color) {
  return { x, y, w, h, color };
}

function item(id, label, x, y, pickup, effect = "collect") {
  return { id, label, x, y, pickup, effect, collected: false };
}

function door(x, y, w, h, to, needs, label, openMessage) {
  return { x, y, w, h, to, needs, label, openMessage };
}

function hazard(x, y, label) {
  return { x, y, label, triggered: false };
}

function enemy(name, type, x, y, patrol) {
  return {
    name,
    type,
    x,
    y,
    startX: x,
    startY: y,
    patrol,
    patrolIndex: 0,
    alert: 0,
    stun: 0,
    teleport: 2.8,
    angle: 0,
  };
}

function getStage() {
  return stages[currentStageIndex];
}

function setupStage(index) {
  currentStageIndex = index;
  const stage = getStage();
  player.x = stage.spawn.x;
  player.y = stage.spawn.y;
  player.vx = 0;
  player.vy = 0;
  soundLevel = 0;
  finalTimer = stage.timed || 0;
  stageNameEl.textContent = stage.name.replace(/^LV \d\. /, "");
  objectiveEl.textContent = stage.objective;
  hintEl.textContent = stage.hint;
  stage.enemies.forEach((monster) => {
    monster.x = monster.startX;
    monster.y = monster.startY;
    monster.alert = monster.type === "boss" ? 999 : 0;
    monster.stun = 0;
    monster.teleport = 2.8;
    monster.patrolIndex = 0;
  });
  setMessage(stage.notes[0], 3);
}

function setMessage(text, seconds = 2.5) {
  hintEl.textContent = text;
  messageTimer = seconds;
}

function loadImages() {
  const loadedImages = {};
  Object.entries(IMAGE_PATHS).forEach(([key, path]) => {
    const image = new Image();
    image.src = path;
    if (key === "player") {
      image.addEventListener("load", updatePlayerPortrait);
      image.addEventListener("error", updatePlayerPortrait);
    }
    loadedImages[key] = image;
  });
  return loadedImages;
}

function loadAudio() {
  const bgm = new Audio(AUDIO_PATHS.bgm);
  bgm.loop = true;
  bgm.volume = 0.5;

  return {
    bgm,
    slidingDoor: createSfx(AUDIO_PATHS.slidingDoor),
    fluorescent: createSfx(AUDIO_PATHS.fluorescent),
  };
}

function createSfx(path) {
  const sound = new Audio(path);
  sound.volume = 0.65;
  return sound;
}

function playBgmFromUserGesture() {
  sounds.bgm.pause();
  sounds.bgm.currentTime = 0;
  sounds.bgm.play().catch(() => {
    setMessage("BGM 파일이 없거나 브라우저가 재생을 막았다. 파일을 넣은 뒤 Start 또는 Restart를 눌러보자.", 2.5);
  });
}

function pauseBgm() {
  sounds.bgm.pause();
}

function playSfx(name) {
  const sound = sounds[name];
  if (!sound) return;
  sound.currentTime = 0;
  sound.play().catch(() => {
    // 로컬 효과음 파일이 아직 없거나 브라우저 정책으로 막힌 경우 게임 진행은 유지한다.
  });
}

function updatePlayerPortrait() {
  if (!playerPortraitEl) return;
  if (images.player.complete && images.player.naturalWidth > 0) {
    playerPortraitEl.style.backgroundImage = `url("${IMAGE_PATHS.player}")`;
  } else {
    playerPortraitEl.style.backgroundImage = "";
  }
}

function startGame() {
  playBgmFromUserGesture();
  titleCard.classList.add("hidden");
  restartButton.hidden = true;
  started = true;
  ending = null;
  lastTime = performance.now();
  setupStage(0);
  playSfx("fluorescent");
  requestAnimationFrame(loop);
}

function resetGame() {
  inventory.clear();
  journal.length = 0;
  stages.forEach((stage) => {
    stage.items.forEach((stageItem) => {
      stageItem.collected = false;
    });
    stage.hazards.forEach((stageHazard) => {
      stageHazard.triggered = false;
    });
  });
  Object.assign(player, {
    x: 110,
    y: 330,
    vx: 0,
    vy: 0,
    health: 3,
    invincible: 0,
    jumpCooldown: 0,
    jumpTime: 0,
    flash: false,
  });
  setupStage(0);
  ending = null;
  restartButton.hidden = true;
  started = true;
}

function loop(time) {
  const dt = Math.min((time - lastTime) / 1000, 0.033);
  lastTime = time;
  update(dt);
  draw();
  if (started) requestAnimationFrame(loop);
}

function update(dt) {
  if (ending) {
    return;
  }

  const stage = getStage();
  messageTimer -= dt;
  if (messageTimer <= 0) hintEl.textContent = stage.hint;

  player.invincible = Math.max(0, player.invincible - dt);
  player.jumpCooldown = Math.max(0, player.jumpCooldown - dt);
  player.jumpTime = Math.max(0, player.jumpTime - dt);
  screenShake = Math.max(0, screenShake - dt * 14);

  if (finalTimer > 0) {
    finalTimer -= dt;
    if (finalTimer <= 0) lose("새벽이 오기 전 탈출하지 못했다.");
  }

  updatePlayer(dt, stage);
  updateHazards(stage);
  stage.enemies.forEach((monster) => updateEnemy(monster, stage, dt));

  soundLevel = Math.max(0, soundLevel - dt * 1.65);
  updateHud();
}

function updatePlayer(dt, stage) {
  let ix = 0;
  let iy = 0;
  if (keys.has("ArrowLeft")) ix -= 1;
  if (keys.has("ArrowRight")) ix += 1;
  if (keys.has("ArrowUp")) iy -= 1;
  if (keys.has("ArrowDown")) iy += 1;

  const length = Math.hypot(ix, iy) || 1;
  const targetVx = (ix / length) * PLAYER_SPEED;
  const targetVy = (iy / length) * PLAYER_SPEED;
  const rate = ix === 0 && iy === 0 ? PLAYER_FRICTION : PLAYER_ACCELERATION;
  player.vx = approach(player.vx, targetVx, rate * dt);
  player.vy = approach(player.vy, targetVy, rate * dt);

  const moving = Math.hypot(player.vx, player.vy) > 12;
  if (moving) soundLevel = Math.max(soundLevel, player.jumpTime > 0 ? 0.18 : 0.38);

  moveCircle(player, player.vx * dt, player.vy * dt, stage.walls);
  player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
}

function updateHazards(stage) {
  stage.hazards.forEach((stageHazard) => {
    const distance = dist(player, stageHazard);
    if (distance < 31 && !stageHazard.triggered && player.jumpTime <= 0) {
      stageHazard.triggered = true;
      soundLevel = Math.max(soundLevel, 1);
      screenShake = 6;
      setMessage(`${stageHazard.label} 때문에 큰 소리가 났다.`, 1.8);
      playSfx("fluorescent");
    }
    if (distance > 68) stageHazard.triggered = false;
  });
}

function updateEnemy(monster, stage, dt) {
  monster.stun = Math.max(0, monster.stun - dt);
  if (monster.stun > 0) return;

  const playerDistance = dist(monster, player);
  let target = monster.patrol[monster.patrolIndex];
  let speed = 54;

  if (monster.type === "blind") {
    if (soundLevel > 0.42 && playerDistance < 390) {
      monster.alert = 3.2;
      target = player;
      speed = 132 + soundLevel * 58;
    } else {
      monster.alert = Math.max(0, monster.alert - dt);
      if (monster.alert > 0) {
        target = player;
        speed = 118;
      }
    }
  }

  if (monster.type === "headless") {
    const seesPlayer = playerDistance < 295 && hasLineOfSight(monster, player, stage.walls);
    if (seesPlayer) {
      monster.alert = 2.2;
      screenShake = Math.max(screenShake, 3);
      setMessage("소찬혁이 목 없는 몸으로 돌진한다.", 1.2);
    }
    if (monster.alert > 0) {
      target = player;
      speed = 182;
      monster.alert -= dt;
    }
  }

  if (monster.type === "smiler") {
    monster.teleport -= dt;
    if (monster.teleport <= 0) {
      const angle = Math.random() * Math.PI * 2;
      monster.x = clamp(player.x + Math.cos(angle) * 210, 70, 890);
      monster.y = clamp(player.y + Math.sin(angle) * 165, 70, 570);
      monster.teleport = 3 + Math.random() * 2;
      monster.alert = 1.8;
      soundLevel = Math.max(soundLevel, 0.72);
      setMessage("라현재의 웃음소리가 복도 전체에 번졌다.", 1.8);
    }
    if (monster.alert > 0) {
      target = player;
      speed = 112;
      monster.alert -= dt;
    }
  }

  if (monster.type === "boss") {
    target = player;
    speed = 102 + Math.max(0, 75 - finalTimer) * 0.95;
    if (Math.random() < dt * 0.9) screenShake = Math.max(screenShake, 2);
  }

  const dx = target.x - monster.x;
  const dy = target.y - monster.y;
  const len = Math.hypot(dx, dy);
  if (len > 4) {
    monster.angle = Math.atan2(dy, dx);
    moveCircle(monster, (dx / len) * speed * dt, (dy / len) * speed * dt, stage.walls);
  } else if (target !== player) {
    monster.patrolIndex = (monster.patrolIndex + 1) % monster.patrol.length;
  }

  if (dist(monster, player) < 28) damagePlayer(monster.name);
}

function moveCircle(entity, dx, dy, walls) {
  entity.x += dx;
  if (collides(entity, walls)) entity.x -= dx;
  entity.y += dy;
  if (collides(entity, walls)) entity.y -= dy;
}

function collides(entity, walls) {
  return walls.some((wall) => circleRect(entity.x, entity.y, PLAYER_RADIUS, wall));
}

function circleRect(cx, cy, radius, box) {
  const nearestX = clamp(cx, box.x, box.x + box.w);
  const nearestY = clamp(cy, box.y, box.y + box.h);
  return Math.hypot(cx - nearestX, cy - nearestY) < radius;
}

function damagePlayer(source) {
  if (player.invincible > 0 || player.jumpTime > 0 || ending) return;
  player.health -= 1;
  player.invincible = 1.35;
  screenShake = 11;
  soundLevel = 1;
  setMessage(`${source}에게 붙잡혔다.`, 1.6);
  if (player.health <= 0) lose("학교의 일부가 되어버렸다.");
}

function interact() {
  if (!started || ending) {
    return;
  }

  const stage = getStage();
  const nearbyItem = stage.items.find((stageItem) => !stageItem.collected && dist(player, stageItem) < INTERACT_RADIUS);
  if (nearbyItem) {
    pickup(nearbyItem);
    return;
  }

  const nearbyDoor = stage.doors.find((stageDoor) => pointNearRect(player, stageDoor, INTERACT_RADIUS));
  if (nearbyDoor) {
    openDoor(nearbyDoor);
    return;
  }

  setMessage("여기서는 상호작용할 수 있는 것이 없다.", 1.2);
}

function pickup(stageItem) {
  stageItem.collected = true;
  if (stageItem.effect === "heal") {
    player.health = Math.min(3, player.health + 1);
  } else {
    inventory.add(stageItem.id);
    if (stageItem.id === "flashlight") player.flash = true;
    if (stageItem.id.startsWith("diary") || stageItem.id.includes("Record")) {
      journal.push(stageItem.label);
    }
  }
  soundLevel = Math.max(soundLevel, 0.28);
  setMessage(stageItem.pickup, 2.4);
}

function openDoor(stageDoor) {
  if (stageDoor.needs && !inventory.has(stageDoor.needs)) {
    setMessage(`${stageDoor.label}은(는) 아직 열 수 없다. 필요한 단서를 더 찾아야 한다.`, 2);
    return;
  }

  setMessage(stageDoor.openMessage, 2.2);
  playSfx("slidingDoor");
  if (stageDoor.to === "ending") {
    win();
    return;
  }
  setupStage(stageDoor.to);
}

function jump() {
  if (!started || ending || player.jumpCooldown > 0) return;
  player.jumpCooldown = 0.74;
  player.jumpTime = JUMP_DURATION;
  player.invincible = Math.max(player.invincible, 0.18);
  soundLevel = Math.max(soundLevel, 0.62);
  screenShake = 2;
}

function draw() {
  const stage = getStage();
  const shakeX = screenShake ? (Math.random() - 0.5) * screenShake : 0;
  const shakeY = screenShake ? (Math.random() - 0.5) * screenShake : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);
  drawWorld(stage);
  drawItems(stage);
  drawDoors(stage);
  drawHazards(stage);
  drawDarkness();
  drawVignette();
  stage.enemies.forEach(drawEnemy);
  drawPlayer();
  if (ending) drawEnding();
  ctx.restore();
}

function drawWorld(stage) {
  ctx.fillStyle = stage.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawAssetCover("background", 0, 0, canvas.width, canvas.height, 0.72);

  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += TILE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += TILE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  stage.props.forEach((stageProp) => {
    ctx.fillStyle = stageProp.color;
    roundRect(stageProp.x, stageProp.y, stageProp.w, stageProp.h, 5);
    ctx.fill();
  });

  stage.walls.forEach((wall) => {
    ctx.fillStyle = "#181b22";
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(wall.x, wall.y, wall.w, 3);
  });
}

function drawItems(stage) {
  stage.items.forEach((stageItem) => {
    if (stageItem.collected) return;
    const glow = Math.sin(performance.now() / 210) * 0.18 + 0.55;
    const assetKey = getItemAssetKey(stageItem);
    if (!drawAssetCover(assetKey, stageItem.x - 14, stageItem.y - 14, 28, 28, 0.95)) {
      ctx.fillStyle = stageItem.effect === "heal" ? `rgba(91, 190, 130, ${glow})` : `rgba(239, 208, 114, ${glow})`;
      ctx.beginPath();
      ctx.arc(stageItem.x, stageItem.y, 9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "12px sans-serif";
    ctx.fillText(stageItem.label, stageItem.x + 14, stageItem.y + 4);
  });
}

function drawDoors(stage) {
  stage.doors.forEach((stageDoor) => {
    if (!drawAssetCover("door", stageDoor.x, stageDoor.y, stageDoor.w, stageDoor.h, inventory.has(stageDoor.needs) ? 0.95 : 0.48)) {
      ctx.fillStyle = inventory.has(stageDoor.needs) ? "#76452b" : "#2a2320";
      ctx.fillRect(stageDoor.x, stageDoor.y, stageDoor.w, stageDoor.h);
    }
    if (pointNearRect(player, stageDoor, INTERACT_RADIUS)) {
      drawInteractionLabel(stageDoor.label, stageDoor.x - 125, stageDoor.y - 10);
    }
  });
}

function drawHazards(stage) {
  stage.hazards.forEach((stageHazard) => {
    if (!drawAssetCover("hazard", stageHazard.x - 18, stageHazard.y - 18, 36, 36, 0.9)) {
      ctx.strokeStyle = "rgba(210, 210, 210, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(stageHazard.x - 16, stageHazard.y - 8);
      ctx.lineTo(stageHazard.x + 18, stageHazard.y + 9);
      ctx.moveTo(stageHazard.x + 12, stageHazard.y - 11);
      ctx.lineTo(stageHazard.x - 12, stageHazard.y + 12);
      ctx.stroke();
    }
    if (dist(player, stageHazard) < INTERACT_RADIUS) {
      drawInteractionLabel("조심히 지나가기", stageHazard.x - 44, stageHazard.y - 24);
    }
  });
}

function drawEnemy(monster) {
  const alert = monster.alert > 0 || monster.type === "boss";
  ctx.save();
  ctx.translate(monster.x, monster.y);
  const enemyAsset = getEnemyAssetKey(monster);
  if (drawAssetCover(enemyAsset, -18, monster.type === "boss" ? -28 : -22, 36, monster.type === "boss" ? 56 : 44, 0.95)) {
    ctx.restore();
    return;
  }
  ctx.fillStyle = monster.type === "boss" ? "#2b0508" : alert ? "#7e151d" : "#2a2428";
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, monster.type === "boss" ? 24 : 18, 0, 0, Math.PI * 2);
  ctx.fill();

  if (monster.type === "blind") {
    ctx.strokeStyle = "#e7d8bb";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8, -5);
    ctx.lineTo(8, -5);
    ctx.stroke();
  } else if (monster.type === "headless") {
    ctx.fillStyle = "#111";
    ctx.fillRect(-7, -18, 14, 10);
  } else if (monster.type === "smiler") {
    ctx.strokeStyle = "#f2e1c0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0.1, Math.PI - 0.1);
    ctx.stroke();
  } else {
    ctx.strokeStyle = "#f2e1c0";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-12, -18);
    ctx.lineTo(12, 18);
    ctx.moveTo(12, -18);
    ctx.lineTo(-12, 18);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlayer() {
  const visualY = player.y - getJumpOffset();
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.34)";
  ctx.beginPath();
  ctx.ellipse(player.x, player.y + 18, PLAYER_RADIUS * 0.9, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(player.x, visualY);
  ctx.globalAlpha = player.invincible > 0 ? 0.58 : 1;

  if (player.jumpTime > 0) {
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(0, getJumpOffset() + 16, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPlayerCircleImage(0, 0, PLAYER_RADIUS);

  ctx.restore();

  ctx.save();
  ctx.translate(player.x, visualY);
  ctx.rotate(player.angle);
  ctx.fillStyle = "#f8e6ae";
  ctx.fillRect(8, -4, 18, 8);
  ctx.restore();

  const stage = getStage();
  const nearby = stage.items.find((stageItem) => !stageItem.collected && dist(player, stageItem) < INTERACT_RADIUS);
  if (nearby) drawInteractionLabel(`E: ${nearby.label}`, nearby.x - 30, nearby.y - 26);
}

function drawPlayerCircleImage(x, y, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();

  if (images.player.complete && images.player.naturalWidth > 0) {
    drawImageCover(images.player, x - radius, y - radius, radius * 2, radius * 2);
  } else {
    ctx.fillStyle = "#dfd4bd";
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  ctx.restore();

  ctx.save();
  ctx.shadowColor = "rgba(255, 245, 210, 0.75)";
  ctx.shadowBlur = 10;
  ctx.strokeStyle = "rgba(255, 245, 210, 0.92)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function getItemAssetKey(stageItem) {
  if (stageItem.effect === "heal") return "heal";
  if (stageItem.id.includes("flashlight")) return "flashlight";
  if (stageItem.id.includes("recordBook") || stageItem.id.includes("counselRecord")) return "recordBook";
  if (stageItem.id.includes("Key")) return "key";
  if (stageItem.id.includes("diary")) return "diary";
  if (stageItem.id.includes("code") || stageItem.id.includes("pcHint")) return "code";
  return "recordBook";
}

function getEnemyAssetKey(monster) {
  if (monster.type === "blind") return "enemyBlind";
  if (monster.type === "headless") return "enemyHeadless";
  if (monster.type === "smiler") return "enemySmiler";
  if (monster.type === "boss") return "enemyBoss";
  return "enemyBlind";
}

function drawAssetCover(key, x, y, width, height, alpha = 1) {
  const image = images[key];
  if (!image || !image.complete || image.naturalWidth <= 0) return false;
  ctx.save();
  ctx.globalAlpha *= alpha;
  drawImageCover(image, x, y, width, height);
  ctx.restore();
  return true;
}

function drawImageCover(image, x, y, width, height) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (imageRatio > targetRatio) {
    sourceWidth = image.naturalHeight * targetRatio;
    sourceX = (image.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = image.naturalWidth / targetRatio;
    sourceY = (image.naturalHeight - sourceHeight) / 2;
  }

  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function drawDarkness() {
  const visualY = player.y - getJumpOffset();
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "destination-out";

  const nearGlow = ctx.createRadialGradient(player.x, visualY, 40, player.x, visualY, 360);
  nearGlow.addColorStop(0, "rgba(255,255,255,0.98)");
  nearGlow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = nearGlow;
  ctx.beginPath();
  ctx.arc(player.x, visualY, 360, 0, Math.PI * 2);
  ctx.fill();

  if (player.flash) {
    const length = 520;
    const spread = 0.46;
    ctx.beginPath();
    ctx.moveTo(player.x, visualY);
    ctx.lineTo(player.x + Math.cos(player.angle - spread) * length, visualY + Math.sin(player.angle - spread) * length);
    ctx.arc(player.x, visualY, length, player.angle - spread, player.angle + spread);
    ctx.closePath();
    const cone = ctx.createRadialGradient(player.x, visualY, 20, player.x, visualY, length);
    cone.addColorStop(0, "rgba(255,255,255,0.98)");
    cone.addColorStop(0.48, "rgba(255,255,255,0.86)");
    cone.addColorStop(0.82, "rgba(255,255,255,0.34)");
    cone.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = cone;
    ctx.fill();
  }
  ctx.restore();

  if (player.flash) {
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.beginPath();
    ctx.moveTo(player.x, visualY);
    ctx.lineTo(player.x + Math.cos(player.angle - 0.46) * 520, visualY + Math.sin(player.angle - 0.46) * 520);
    ctx.arc(player.x, visualY, 520, player.angle - 0.46, player.angle + 0.46);
    ctx.closePath();
    const whiteLight = ctx.createRadialGradient(player.x, visualY, 30, player.x, visualY, 520);
    whiteLight.addColorStop(0, "rgba(255, 255, 255, 0.2)");
    whiteLight.addColorStop(0.62, "rgba(255, 255, 255, 0.08)");
    whiteLight.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = whiteLight;
    ctx.fill();
    ctx.restore();
  }
}

function drawVignette() {
  const gradient = ctx.createRadialGradient(480, 320, 140, 480, 320, 560);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.62)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawInteractionLabel(text, x, y) {
  ctx.font = "13px sans-serif";
  const width = ctx.measureText(text).width + 20;
  ctx.fillStyle = "rgba(7,9,13,0.78)";
  roundRect(x, y, width, 28, 8);
  ctx.fill();
  ctx.fillStyle = "#f1e4c9";
  ctx.fillText(text, x + 10, y + 18);
}

function drawEnding() {
  ctx.fillStyle = ending.win ? "rgba(240, 217, 163, 0.28)" : "rgba(60, 0, 0, 0.55)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff4d6";
  ctx.textAlign = "center";
  ctx.font = "700 48px sans-serif";
  ctx.fillText(ending.title, canvas.width / 2, 275);
  ctx.font = "20px sans-serif";
  ctx.fillText(ending.body, canvas.width / 2, 324);
  ctx.font = "16px sans-serif";
  ctx.fillText("아래 Restart 버튼을 눌러 다시 시작", canvas.width / 2, 370);
  ctx.textAlign = "left";
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function updateHud() {
  healthEl.textContent = "♥".repeat(Math.max(player.health, 0)) || "0";
  if (finalTimer > 0) {
    const seconds = Math.ceil(finalTimer);
    timerEl.textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  } else {
    timerEl.textContent = "--:--";
  }
}

function getJumpOffset() {
  if (player.jumpTime <= 0) return 0;
  const progress = 1 - player.jumpTime / JUMP_DURATION;
  return Math.sin(progress * Math.PI) * JUMP_HEIGHT;
}

function hasLineOfSight(from, to, walls) {
  const steps = Math.ceil(dist(from, to) / 18);
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t;
    if (walls.some((wall) => x > wall.x && x < wall.x + wall.w && y > wall.y && y < wall.y + wall.h)) {
      return false;
    }
  }
  return true;
}

function pointNearRect(point, box, radius) {
  const nearestX = clamp(point.x, box.x, box.x + box.w);
  const nearestY = clamp(point.y, box.y, box.y + box.h);
  return Math.hypot(point.x - nearestX, point.y - nearestY) < radius;
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function approach(current, target, amount) {
  if (current < target) return Math.min(current + amount, target);
  if (current > target) return Math.max(current - amount, target);
  return target;
}

function lose(body) {
  pauseBgm();
  ending = {
    win: false,
    title: "탈출 실패",
    body,
  };
  restartButton.hidden = false;
  setMessage(body, 999);
}

function win() {
  ending = {
    win: true,
    title: "학교 탈출",
    body: "현관문 밖으로 새벽빛이 들어왔다.",
  };
  restartButton.hidden = false;
  setMessage("탈출에 성공했다.", 999);
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", () => {
  playBgmFromUserGesture();
  resetGame();
});

window.addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (event.code.startsWith("Arrow")) event.preventDefault();
  if (event.code === "KeyE") interact();
  if (event.code === "Space") {
    event.preventDefault();
    jump();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

canvas.addEventListener("mousemove", (event) => {
  const rectBox = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rectBox.left) / rectBox.width) * canvas.width;
  mouse.y = ((event.clientY - rectBox.top) / rectBox.height) * canvas.height;
});

updateHud();
draw();
