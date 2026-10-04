const timerState = {
  timers: {},
  interval: null
};

export function formatTimer(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function getTimer(screenId, minutes) {
  if (!minutes) return null;
  if (!timerState.timers[screenId]) {
    timerState.timers[screenId] = {
      seconds: minutes * 60,
      running: false,
      minutes
    };
  }
  return timerState.timers[screenId];
}

export function stopTimerInterval() {
  if (timerState.interval) {
    clearInterval(timerState.interval);
    timerState.interval = null;
  }
}

export function updateTimerDisplay(screenId, minutes) {
  const timer = getTimer(screenId, minutes);
  const root = document.querySelector(`[data-timer-screen="${screenId}"]`);
  const display = root?.querySelector("[data-timer-display]");
  const toggle = root?.querySelector("[data-timer-toggle]");
  if (timer && root && display) {
    root.classList.toggle("is-running", timer.running);
    display.textContent = formatTimer(timer.seconds);
    if (toggle) toggle.textContent = timer.running ? "정지" : "시작";
  }
}

export function startTimer(screenId, minutes) {
  const timer = getTimer(screenId, minutes);
  if (!timer || timer.seconds <= 0) return;
  Object.values(timerState.timers).forEach((item) => {
    item.running = false;
  });
  timer.running = true;
  stopTimerInterval();
  updateTimerDisplay(screenId, minutes);
  timerState.interval = setInterval(() => {
    if (!timer.running) return;
    timer.seconds = Math.max(0, timer.seconds - 1);
    updateTimerDisplay(screenId, minutes);
    if (timer.seconds === 0) {
      timer.running = false;
      stopTimerInterval();
      updateTimerDisplay(screenId, minutes);
    }
  }, 1000);
}

export function pauseTimer(screenId, minutes) {
  const timer = getTimer(screenId, minutes);
  if (!timer) return;
  timer.running = false;
  stopTimerInterval();
  updateTimerDisplay(screenId, minutes);
}

export function toggleTimer(screenId, minutes) {
  const timer = getTimer(screenId, minutes);
  if (!timer) return;
  if (timer.running) pauseTimer(screenId, minutes);
  else startTimer(screenId, minutes);
}

export function resetTimer(screenId, minutes) {
  const timer = getTimer(screenId, minutes);
  if (!timer) return;
  timer.running = false;
  timer.seconds = minutes * 60;
  stopTimerInterval();
  updateTimerDisplay(screenId, minutes);
}

export function adjustTimer(screenId, minutes, deltaSeconds) {
  const timer = getTimer(screenId, minutes);
  if (!timer) return;
  timer.seconds = Math.max(0, timer.seconds + deltaSeconds);
  if (timer.seconds === 0) {
    timer.running = false;
    stopTimerInterval();
  }
  updateTimerDisplay(screenId, minutes);
}
