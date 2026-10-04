const IMAGE_PATHS = {
  // 플레이어 캐릭터 이미지: 게임 캐릭터와 하단 HUD 초상화에 사용한다.
  player: "assets/images/player.png",
  background: "assets/images/background.png",
  enemyBlind: "assets/images/enemy-blind.png",
  enemyHeadless: "assets/images/enemy-headless.png",
  enemySmiler: "assets/images/enemy-smiler.png",
  enemyBoss: "assets/images/enemy-boss.png",
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
  bgm: "assets/audio/bgm.mp3",
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

const GRAVITY = 1750;
const PLAYER_SPEED = 260;
const PLAYER_ACCELERATION = 1700;
const PLAYER_FRICTION = 2100;
const JUMP_POWER = 650;
const INTERACT_RADIUS = 80;
const PLAYER_TARGET_HEIGHT = 140;
const ENEMY_HEIGHT = 112;
const MAX_JUMPS = 2;

const keys = new Set();
const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
const images = loadImages();
const sounds = loadAudio();
const inventory = new Set();

let started = false;
let stageIndex = 0;
let cameraX = 0;
let lastTime = 0;
let messageTimer = 0;
let finalTimer = 0;
let ending = null;
let screenShake = 0;
let soundLevel = 0;

const player = {
  x: 90,
  y: 420,
  w: 48,
  h: 58,
  vx: 0,
  vy: 0,
  facing: 1,
  onGround: false,
  jumpsLeft: MAX_JUMPS,
  health: 3,
  invincible: 0,
  flash: false,
};

const stages = [
  {
    name: "LV 1. 교무실",
    width: 1800,
    spawn: { x: 90, floorY: 560 },
    objective: "손전등, 학생기록부, 교무실 열쇠를 찾고 문을 열자.",
    hint: "방향키로 좌우 이동, Space로 점프, E로 상호작용한다.",
    platforms: [
      platform(0, 560, 1800, 80),
      platform(280, 470, 190, 24),
      platform(620, 405, 210, 24),
      platform(1020, 460, 180, 24),
      platform(1320, 390, 220, 24),
    ],
    items: [
      item("flashlight", "손전등", "flashlight", 345, 425, "손전등을 켰다. 마우스로 비출 방향을 정한다."),
      item("recordBook", "학생기록부", "recordBook", 700, 360, "학생기록부에는 지워진 이름들이 빼곡하다."),
      item("officeKey", "교무실 열쇠", "key", 1415, 345, "녹슨 교무실 열쇠를 얻었다."),
    ],
    hazards: [],
    enemies: [],
    door: door(1685, 492, 56, 68, 1, "officeKey", "교무실 문"),
  },
  {
    name: "LV 2. 1층 복도",
    width: 2200,
    spawn: { x: 70, floorY: 560 },
    objective: "일기장 조각과 낡은 열쇠를 챙겨 중앙 계단으로 이동하자.",
    hint: "깨진 유리를 밟으면 큰 소리가 나고 정종원이 반응한다.",
    platforms: [
      platform(0, 560, 2200, 80),
      platform(360, 470, 220, 24),
      platform(780, 410, 260, 24),
      platform(1210, 475, 250, 24),
      platform(1580, 395, 220, 24),
    ],
    items: [
      item("diary1", "일기장 조각 1", "diary", 430, 425, "일기장: 발소리를 내면 종원이가 온다."),
      item("oldKey", "낡은 열쇠", "key", 1665, 350, "낡은 열쇠를 얻었다. 계단으로 갈 수 있다."),
      item("heal1", "회복 아이템", "heal", 1325, 430, "체력을 회복했다.", "heal"),
    ],
    hazards: [
      hazard(690, 532, "깨진 유리"),
      hazard(1120, 532, "쓰러진 의자"),
    ],
    enemies: [
      enemy("정종원", "enemyBlind", 900, 502, 740, 1170, 70),
    ],
    door: door(2090, 492, 56, 68, 2, "oldKey", "중앙 계단"),
  },
  {
    name: "LV 3. 2층 교실과 특별실",
    width: 2500,
    spawn: { x: 80, floorY: 560 },
    objective: "기록을 모아 한선생의 비밀과 탈출문 코드를 찾자.",
    hint: "소찬혁은 발견하면 돌진하고, 라현재는 웃음소리와 함께 나타난다.",
    platforms: [
      platform(0, 560, 2500, 80),
      platform(300, 465, 220, 24),
      platform(650, 380, 240, 24),
      platform(1040, 465, 240, 24),
      platform(1450, 390, 260, 24),
      platform(1880, 465, 230, 24),
    ],
    items: [
      item("diary2", "일기장 조각 2", "diary", 370, 420, "일기장: 선생님은 출석부에서 우리를 지웠다."),
      item("counselRecord", "학생 상담 기록", "recordBook", 730, 335, "상담 기록에는 한선생의 통제가 적혀 있다."),
      item("pcHint", "컴퓨터실 힌트", "code", 1535, 345, "모니터에 숫자 284가 반복해서 깜빡인다."),
      item("codePart", "탈출문 코드 일부", "code", 1980, 420, "탈출문 코드 일부를 얻었다."),
      item("heal2", "붕대", "heal", 1155, 420, "체력을 회복했다.", "heal"),
    ],
    hazards: [
      hazard(560, 532, "넘어진 책상"),
      hazard(1365, 532, "삐걱대는 마룻바닥"),
    ],
    enemies: [
      enemy("소찬혁", "enemyHeadless", 1160, 502, 1040, 1400, 84),
      enemy("라현재", "enemySmiler", 1780, 502, 1660, 2080, 76),
    ],
    door: door(2380, 492, 56, 68, 3, "codePart", "현관 계단"),
  },
  {
    name: "LV 4. 중앙 계단과 현관",
    width: 2300,
    spawn: { x: 80, floorY: 560 },
    objective: "마지막 열쇠를 얻고 제한 시간 안에 정문으로 탈출하자.",
    hint: "한선생은 계속 따라온다. 멈추지 말고 끝까지 달려라.",
    timed: 300,
    platforms: [
      platform(0, 560, 2300, 80),
      platform(360, 470, 230, 24),
      platform(760, 390, 230, 24),
      platform(1180, 470, 260, 24),
      platform(1640, 400, 240, 24),
    ],
    items: [
      item("finalKey", "마지막 열쇠", "key", 850, 345, "마지막 열쇠를 얻었다. 현관문까지 뛰어라."),
      item("heal3", "회복 아이템", "heal", 1280, 425, "체력을 회복했다.", "heal"),
    ],
    hazards: [
      hazard(660, 532, "잠긴 방화문"),
      hazard(1540, 532, "넘어진 사물함"),
    ],
    enemies: [
      enemy("한선생", "enemyBoss", 150, 490, 0, 2300, 108),
    ],
    door: door(2160, 492, 62, 68, "ending", "finalKey", "탈출문"),
  },
];

function platform(x, y, w, h) {
  return { x, y, w, h };
}

function item(id, label, asset, x, y, pickup, effect = "collect") {
  return { id, label, asset, x, y, w: 42, h: 42, pickup, effect, collected: false };
}

function hazard(x, y, label) {
  return { x, y, w: 48, h: 28, label, triggered: false };
}

function enemy(name, asset, x, y, minX, maxX, speed) {
  return { name, asset, x, y, w: 92, h: ENEMY_HEIGHT, minX, maxX, speed, direction: -1, alert: 0 };
}

function door(x, y, w, h, to, needs, label) {
  return { x, y, w, h, to, needs, label };
}

function loadImages() {
  const loaded = {};
  Object.entries(IMAGE_PATHS).forEach(([key, path]) => {
    const image = new Image();
    image.addEventListener("load", () => {
      if (key === "player") {
        updatePlayerPortrait();
        resizePlayerToImage();
      }
      if (!started) draw();
    });
    image.addEventListener("error", () => {
      if (key === "player") updatePlayerPortrait();
      if (!started) draw();
    });
    if (key === "player") {
      image.decoding = "async";
    }
    image.src = path;
    loaded[key] = image;
  });
  return loaded;
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
    setMessage("BGM 파일이 없거나 브라우저가 재생을 막았다.", 2);
  });
}

function pauseBgm() {
  sounds.bgm.pause();
}

function playSfx(name) {
  const sound = sounds[name];
  if (!sound) return;
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function updatePlayerPortrait() {
  if (images.player.complete && images.player.naturalWidth > 0) {
    playerPortraitEl.style.backgroundImage = `url("${IMAGE_PATHS.player}")`;
  }
}

function resizePlayerToImage() {
  if (!images.player.complete || images.player.naturalWidth <= 0) return;
  const feetY = player.y + player.h;
  const ratio = images.player.naturalWidth / images.player.naturalHeight;
  player.h = PLAYER_TARGET_HEIGHT;
  player.w = clamp(Math.round(PLAYER_TARGET_HEIGHT * ratio), 68, 190);
  player.y = feetY - player.h;
}

function startGame() {
  playBgmFromUserGesture();
  titleCard.classList.add("hidden");
  restartButton.hidden = true;
  resetGame();
  started = true;
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

function resetGame() {
  inventory.clear();
  stages.forEach((stage) => {
    stage.items.forEach((stageItem) => {
      stageItem.collected = false;
    });
    stage.hazards.forEach((stageHazard) => {
      stageHazard.triggered = false;
    });
  });
  player.health = 3;
  player.flash = false;
  setupStage(0);
  ending = null;
  restartButton.hidden = true;
  updateHud();
}

function setupStage(index) {
  stageIndex = index;
  const stage = getStage();
  player.x = stage.spawn.x;
  player.y = stage.spawn.floorY - player.h;
  player.vx = 0;
  player.vy = 0;
  player.onGround = true;
  player.jumpsLeft = MAX_JUMPS;
  player.invincible = 0;
  resizePlayerToImage();
  finalTimer = stage.timed || 0;
  soundLevel = 0;
  cameraX = 0;
  stage.enemies.forEach((stageEnemy) => {
    stageEnemy.x = stageEnemy.minX + 80;
    stageEnemy.direction = 1;
    stageEnemy.alert = stageEnemy.asset === "enemyBoss" ? 999 : 0;
  });
  stageNameEl.textContent = stage.name.replace(/^LV \d\. /, "");
  objectiveEl.textContent = stage.objective;
  hintEl.textContent = stage.hint;
}

function getStage() {
  return stages[stageIndex];
}

function loop(time) {
  const dt = Math.min((time - lastTime) / 1000, 0.033);
  lastTime = time;
  update(dt);
  draw();
  if (started) requestAnimationFrame(loop);
}

function update(dt) {
  if (ending) return;

  const stage = getStage();
  messageTimer -= dt;
  if (messageTimer <= 0) hintEl.textContent = stage.hint;

  if (finalTimer > 0) {
    finalTimer -= dt;
    if (finalTimer <= 0) lose("새벽이 오기 전 탈출하지 못했다.");
  }

  player.invincible = Math.max(0, player.invincible - dt);
  screenShake = Math.max(0, screenShake - dt * 16);
  soundLevel = Math.max(0, soundLevel - dt * 1.5);

  updatePlayer(dt, stage);
  updateHazards(stage);
  stage.enemies.forEach((stageEnemy) => updateEnemy(stageEnemy, stage, dt));

  cameraX = clamp(player.x + player.w / 2 - canvas.width * 0.35, 0, stage.width - canvas.width);
  updateHud();
}

function updatePlayer(dt, stage) {
  let input = 0;
  if (keys.has("ArrowLeft")) input -= 1;
  if (keys.has("ArrowRight")) input += 1;

  if (input !== 0) player.facing = input;

  const targetVx = input * PLAYER_SPEED;
  const rate = input === 0 ? PLAYER_FRICTION : PLAYER_ACCELERATION;
  player.vx = approach(player.vx, targetVx, rate * dt);
  player.vy += GRAVITY * dt;
  player.vy = Math.min(player.vy, 900);

  if (Math.abs(player.vx) > 20) soundLevel = Math.max(soundLevel, player.onGround ? 0.42 : 0.16);

  movePlayer(stage, dt);
  player.x = clamp(player.x, 0, stage.width - player.w);
}

function movePlayer(stage, dt) {
  player.x += player.vx * dt;
  stage.platforms.forEach((box) => {
    if (!overlap(player, box)) return;
    if (player.vx > 0) player.x = box.x - player.w;
    if (player.vx < 0) player.x = box.x + box.w;
    player.vx = 0;
  });

  player.y += player.vy * dt;
  player.onGround = false;
  stage.platforms.forEach((box) => {
    if (!overlap(player, box)) return;
    if (player.vy > 0) {
      player.y = box.y - player.h;
      player.vy = 0;
      player.onGround = true;
      player.jumpsLeft = MAX_JUMPS;
    } else if (player.vy < 0) {
      player.y = box.y + box.h;
      player.vy = 0;
    }
  });
}

function jump() {
  if (!started || ending || player.jumpsLeft <= 0) return;
  player.vy = -JUMP_POWER;
  player.onGround = false;
  player.jumpsLeft -= 1;
  soundLevel = Math.max(soundLevel, 0.68);
}

function updateHazards(stage) {
  stage.hazards.forEach((stageHazard) => {
    if (overlap(player, stageHazard) && !stageHazard.triggered && player.onGround) {
      stageHazard.triggered = true;
      soundLevel = 1;
      screenShake = 5;
      playSfx("fluorescent");
      setMessage(`${stageHazard.label} 때문에 큰 소리가 났다.`, 1.6);
    }
    if (Math.abs(centerX(player) - centerX(stageHazard)) > 110) stageHazard.triggered = false;
  });
}

function updateEnemy(stageEnemy, stage, dt) {
  const playerDistance = Math.abs(centerX(player) - centerX(stageEnemy));
  if (stageEnemy.asset === "enemyBoss") {
    stageEnemy.direction = centerX(player) > centerX(stageEnemy) ? 1 : -1;
    stageEnemy.x += stageEnemy.direction * stageEnemy.speed * dt;
  } else if (stageEnemy.asset === "enemyBlind" && soundLevel > 0.55 && playerDistance < 520) {
    stageEnemy.direction = centerX(player) > centerX(stageEnemy) ? 1 : -1;
    stageEnemy.x += stageEnemy.direction * (stageEnemy.speed + 85) * dt;
  } else if (stageEnemy.asset === "enemyHeadless" && playerDistance < 420 && Math.abs(player.y - stageEnemy.y) < 90) {
    stageEnemy.direction = centerX(player) > centerX(stageEnemy) ? 1 : -1;
    stageEnemy.x += stageEnemy.direction * (stageEnemy.speed + 115) * dt;
  } else if (stageEnemy.asset === "enemySmiler" && playerDistance < 360) {
    stageEnemy.direction = centerX(player) > centerX(stageEnemy) ? 1 : -1;
    stageEnemy.x += stageEnemy.direction * (stageEnemy.speed + 45) * dt;
  } else {
    stageEnemy.x += stageEnemy.direction * stageEnemy.speed * dt;
    if (stageEnemy.x < stageEnemy.minX || stageEnemy.x + stageEnemy.w > stageEnemy.maxX) {
      stageEnemy.direction *= -1;
      stageEnemy.x = clamp(stageEnemy.x, stageEnemy.minX, stageEnemy.maxX - stageEnemy.w);
    }
  }

  stageEnemy.y = findGroundY(stageEnemy, stage) - stageEnemy.h;
  if (overlap(player, stageEnemy)) damagePlayer(stageEnemy.name);
}

function findGroundY(entity, stage) {
  const footX = centerX(entity);
  const candidates = stage.platforms
    .filter((box) => footX >= box.x && footX <= box.x + box.w && box.y >= entity.y)
    .sort((a, b) => a.y - b.y);
  return candidates[0]?.y || 560;
}

function interact() {
  if (!started || ending) return;
  const stage = getStage();
  const targetItem = stage.items.find((stageItem) => !stageItem.collected && distanceTo(player, stageItem) < INTERACT_RADIUS);
  if (targetItem) {
    pickup(targetItem);
    return;
  }
  if (distanceTo(player, stage.door) < INTERACT_RADIUS) {
    openDoor(stage.door);
    return;
  }
  setMessage("가까이에서 E키를 눌러야 한다.", 1.2);
}

function pickup(stageItem) {
  stageItem.collected = true;
  if (stageItem.effect === "heal") {
    player.health = Math.min(3, player.health + 1);
  } else {
    inventory.add(stageItem.id);
    if (stageItem.id === "flashlight") player.flash = true;
  }
  setMessage(stageItem.pickup, 2.2);
}

function openDoor(stageDoor) {
  if (stageDoor.needs && !inventory.has(stageDoor.needs)) {
    setMessage(`${stageDoor.label}을 열 단서가 아직 없다.`, 1.8);
    return;
  }
  playSfx("slidingDoor");
  if (stageDoor.to === "ending") {
    win();
    return;
  }
  setupStage(stageDoor.to);
}

function damagePlayer(source) {
  if (player.invincible > 0 || ending) return;
  player.health -= 1;
  player.invincible = 1.2;
  screenShake = 9;
  setMessage(`${source}에게 붙잡혔다.`, 1.4);
  if (player.health <= 0) lose("학교의 일부가 되어버렸다.");
}

function draw() {
  const stage = getStage();
  const shakeX = screenShake ? (Math.random() - 0.5) * screenShake : 0;
  const shakeY = screenShake ? (Math.random() - 0.5) * screenShake : 0;
  ctx.save();
  ctx.translate(shakeX, shakeY);
  drawBackground(stage);
  drawPlatforms(stage);
  drawItems(stage);
  drawHazards(stage);
  drawDoor(stage.door);
  stage.enemies.forEach(drawEnemy);
  drawPlayer();
  drawDarkness();
  drawVignette();
  if (ending) drawEnding();
  ctx.restore();
}

function drawBackground(stage) {
  ctx.fillStyle = "#14171d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawAssetCover("background", 0, 0, canvas.width, canvas.height, 0.45);

  ctx.fillStyle = "rgba(0,0,0,0.32)";
  for (let x = -cameraX * 0.25; x < canvas.width; x += 260) {
    ctx.fillRect(x, 88, 76, 230);
    ctx.fillRect(x + 28, 118, 18, 160);
  }
}

function drawPlatforms(stage) {
  stage.platforms.forEach((box) => {
    const x = box.x - cameraX;
    ctx.fillStyle = "#252a32";
    ctx.fillRect(x, box.y, box.w, box.h);
    ctx.fillStyle = "#404853";
    ctx.fillRect(x, box.y, box.w, 5);
  });
}

function drawItems(stage) {
  stage.items.forEach((stageItem) => {
    if (stageItem.collected) return;
    const x = stageItem.x - cameraX;
    if (!drawAssetCover(stageItem.asset, x, stageItem.y, stageItem.w, stageItem.h, 1)) {
      ctx.fillStyle = "#ead074";
      ctx.fillRect(x, stageItem.y, stageItem.w, stageItem.h);
    }
    if (distanceTo(player, stageItem) < INTERACT_RADIUS) drawLabel(`E: ${stageItem.label}`, x - 20, stageItem.y - 28);
  });
}

function drawHazards(stage) {
  stage.hazards.forEach((stageHazard) => {
    const x = stageHazard.x - cameraX;
    if (!drawAssetCover("hazard", x, stageHazard.y - 14, stageHazard.w, 48, 1)) {
      ctx.fillStyle = "#9a9a9a";
      ctx.fillRect(x, stageHazard.y, stageHazard.w, stageHazard.h);
    }
  });
}

function drawDoor(stageDoor) {
  const x = stageDoor.x - cameraX;
  if (!drawAssetCover("door", x, stageDoor.y, stageDoor.w, stageDoor.h, 1)) {
    ctx.fillStyle = "#76452b";
    ctx.fillRect(x, stageDoor.y, stageDoor.w, stageDoor.h);
  }
  if (distanceTo(player, stageDoor) < INTERACT_RADIUS) drawLabel(`E: ${stageDoor.label}`, x - 42, stageDoor.y - 28);
}

function drawEnemy(stageEnemy) {
  const x = stageEnemy.x - cameraX;
  ctx.save();
  if (stageEnemy.direction < 0) {
    ctx.translate(x + stageEnemy.w, stageEnemy.y);
    ctx.scale(-1, 1);
    drawEnemyImage(stageEnemy, 0, 0);
  } else {
    drawEnemyImage(stageEnemy, x, stageEnemy.y);
  }
  ctx.restore();
}

function drawEnemyImage(stageEnemy, x, y) {
  if (!drawAssetContain(stageEnemy.asset, x, y, stageEnemy.w, stageEnemy.h, 1)) {
    ctx.fillStyle = "#7e151d";
    ctx.fillRect(x, y, stageEnemy.w, stageEnemy.h);
  }
}

function drawPlayer() {
  const x = player.x - cameraX;
  ctx.save();
  ctx.globalAlpha = player.invincible > 0 ? 0.58 : 1;
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(x + player.w / 2, player.y + player.h + 8, 24, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  drawPlayerPortraitClipped(x, player.y, player.w, player.h);
  ctx.restore();

  if (player.flash) drawFlashlight(x + player.w / 2, player.y + 26);
}

function drawPlayerPortraitClipped(x, y, w, h) {
  ctx.save();
  if (images.player.complete && images.player.naturalWidth > 0) {
    drawImageContain(images.player, x, y, w, h);
  } else {
    ctx.fillStyle = "#dfd4bd";
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
}

function drawFlashlight(originX, originY) {
  const targetX = mouse.x;
  const targetY = mouse.y;
  const angle = Math.atan2(targetY - originY, targetX - originX);
  const length = 430;
  const spread = 0.28;

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX + Math.cos(angle - spread) * length, originY + Math.sin(angle - spread) * length);
  ctx.arc(originX, originY, length, angle - spread, angle + spread);
  ctx.closePath();
  const gradient = ctx.createRadialGradient(originX, originY, 20, originX, originY, length);
  gradient.addColorStop(0, "rgba(255,255,255,0.22)");
  gradient.addColorStop(0.7, "rgba(255,255,255,0.08)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.restore();
}

function drawDarkness() {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function drawVignette() {
  const gradient = ctx.createRadialGradient(480, 320, 150, 480, 320, 600);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.46)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawEnding() {
  ctx.fillStyle = ending.win ? "rgba(240,217,163,0.24)" : "rgba(60,0,0,0.52)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff4d6";
  ctx.textAlign = "center";
  ctx.font = "700 48px sans-serif";
  ctx.fillText(ending.title, canvas.width / 2, 275);
  ctx.font = "20px sans-serif";
  ctx.fillText(ending.body, canvas.width / 2, 324);
  ctx.font = "16px sans-serif";
  ctx.fillText("Restart 버튼을 눌러 다시 시작", canvas.width / 2, 370);
  ctx.textAlign = "left";
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

function drawAssetContain(key, x, y, width, height, alpha = 1) {
  const image = images[key];
  if (!image || !image.complete || image.naturalWidth <= 0) return false;
  ctx.save();
  ctx.globalAlpha *= alpha;
  drawImageContain(image, x, y, width, height);
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

function drawImageContain(image, x, y, width, height) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;
  let drawX = x;
  let drawY = y;

  if (imageRatio > targetRatio) {
    drawHeight = width / imageRatio;
    drawY = y + (height - drawHeight) / 2;
  } else {
    drawWidth = height * imageRatio;
    drawX = x + (width - drawWidth) / 2;
  }

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawLabel(text, x, y) {
  ctx.font = "13px sans-serif";
  const width = ctx.measureText(text).width + 18;
  ctx.fillStyle = "rgba(7,9,13,0.82)";
  roundRect(x, y, width, 28, 8);
  ctx.fill();
  ctx.fillStyle = "#f1e4c9";
  ctx.fillText(text, x + 9, y + 18);
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

function setMessage(text, seconds = 2.5) {
  hintEl.textContent = text;
  messageTimer = seconds;
}

function lose(body) {
  pauseBgm();
  ending = { win: false, title: "탈출 실패", body };
  restartButton.hidden = false;
  setMessage(body, 999);
}

function win() {
  ending = { win: true, title: "학교 탈출", body: "현관문 밖으로 새벽빛이 들어왔다." };
  restartButton.hidden = false;
  setMessage("탈출에 성공했다.", 999);
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function centerX(entity) {
  return entity.x + entity.w / 2;
}

function centerY(entity) {
  return entity.y + entity.h / 2;
}

function distanceTo(a, b) {
  return Math.hypot(centerX(a) - centerX(b), centerY(a) - centerY(b));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function approach(current, target, amount) {
  if (current < target) return Math.min(current + amount, target);
  if (current > target) return Math.max(current - amount, target);
  return target;
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", () => {
  playBgmFromUserGesture();
  resetGame();
  started = true;
});

window.addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (event.code.startsWith("Arrow")) event.preventDefault();
  if (event.code === "Space") {
    event.preventDefault();
    jump();
  }
  if (event.code === "KeyE") interact();
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  mouse.y = ((event.clientY - rect.top) / rect.height) * canvas.height;
});

updateHud();
draw();
