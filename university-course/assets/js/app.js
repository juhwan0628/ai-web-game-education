import { appConfig } from "./config.js?v=202606032322";
import { loadTeams } from "./team-data.js?v=202606031355";
import { slideDecks, renderFlowBlock, renderers, getScreenIndex } from "./screens.js?v=202606040123";
import { adjustTimer, pauseTimer, resetTimer, toggleTimer, updateTimerDisplay } from "./timer.js?v=202606031355";

const state = {
  screenId: "start",
  slideSteps: {},
  teams: null
};

const screenNav = document.querySelector("#screen-nav");
const screenPanel = document.querySelector("#screen-panel");
const toolLinks = document.querySelectorAll("[data-tool-link]");

function normalizeHash() {
  const raw = window.location.hash.replace("#", "") || "start";
  if (raw === "teams") {
    window.location.replace("#write");
    return "write";
  }
  if (raw === "spec") {
    window.location.replace("#write");
    return "write";
  }
  return appConfig.screens.some((screen) => screen.id === raw) ? raw : "start";
}

function renderNav() {
  screenNav.innerHTML = appConfig.screens.map((screen, index) => `
    <a class="nav-link" href="#${screen.id}" data-screen-link="${screen.id}">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${screen.label}</strong>
    </a>
  `).join("");
}

function renderShellState() {
  document.querySelectorAll("[data-screen-link]").forEach((link) => {
    const active = link.dataset.screenLink === state.screenId;
    link.classList.toggle("is-active", active);
    link.setAttribute("aria-current", active ? "page" : "false");
  });
}

async function copyText(targetId, button) {
  const target = document.getElementById(targetId);
  if (!target) return;
  try {
    await navigator.clipboard.writeText(target.textContent);
    const originalText = button.textContent;
    button.textContent = "복사됨";
    setTimeout(() => {
      button.textContent = originalText;
    }, 1400);
  } catch (error) {
    const range = document.createRange();
    range.selectNodeContents(target);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

screenPanel.addEventListener("click", (event) => {
  const button = event.target.closest(".copy-button");
  if (!button || !screenPanel.contains(button)) return;
  copyText(button.dataset.copyTarget, button);
});

function setFlowStep(index) {
  const deck = slideDecks[state.screenId] || [];
  const current = Math.max(0, Math.min(index, deck.length - 1));
  state.slideSteps[state.screenId] = current;
  const item = deck[current];
  const stepLabel = document.querySelector("#step-label");
  const stepTitle = document.querySelector("#step-title");
  const stepBody = document.querySelector("#step-body");
  const prevStep = document.querySelector("#prev-step");
  const nextStep = document.querySelector("#next-step");
  if (!item || !stepLabel || !stepTitle || !stepBody) return;

  stepLabel.textContent = item.step;
  stepTitle.textContent = item.title;
  stepBody.innerHTML = item.blocks.map(renderFlowBlock).join("");
  if (prevStep) prevStep.disabled = current === 0;
  if (nextStep) nextStep.disabled = current === deck.length - 1;
}

function bindScreenEvents() {
  document.querySelectorAll('[aria-disabled="true"]').forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });

  const prevStep = document.querySelector("#prev-step");
  const nextStep = document.querySelector("#next-step");
  if (prevStep && nextStep) {
    prevStep.addEventListener("click", () => setFlowStep((state.slideSteps[state.screenId] || 0) - 1));
    nextStep.addEventListener("click", () => setFlowStep((state.slideSteps[state.screenId] || 0) + 1));
  }

  document.querySelectorAll("[data-timer-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const timerRoot = button.closest("[data-timer-screen]");
      if (!timerRoot) return;
      const screenId = timerRoot.dataset.timerScreen;
      const minutes = appConfig.activityTimers[screenId];
      const action = button.dataset.timerAction;
      if (action === "toggle") toggleTimer(screenId, minutes);
      if (action === "reset") resetTimer(screenId, minutes);
      if (action === "add") adjustTimer(screenId, minutes, 60);
      if (action === "subtract") adjustTimer(screenId, minutes, -60);
    });
  });
}

function renderScreen() {
  const nextScreen = normalizeHash();
  if (state.screenId !== nextScreen && appConfig.activityTimers[state.screenId]) {
    pauseTimer(state.screenId, appConfig.activityTimers[state.screenId]);
  }

  state.screenId = nextScreen;
  const renderer = renderers[state.screenId] || renderers.start;
  const current = appConfig.screens[getScreenIndex(state.screenId)];
  document.title = `${current.label} · ${appConfig.title}`;
  screenPanel.innerHTML = renderer(state.teams);
  renderShellState();
  bindScreenEvents();

  if (slideDecks[state.screenId]) {
    setFlowStep(state.slideSteps[state.screenId] || 0);
  }
  if (appConfig.activityTimers[state.screenId]) {
    updateTimerDisplay(state.screenId, appConfig.activityTimers[state.screenId]);
  }
}

async function start() {
  renderNav();
  toolLinks.forEach((link) => {
    const key = link.dataset.toolLink;
    link.setAttribute("href", appConfig.links[key]);
    link.innerHTML = `${appConfig.toolLabels[key]} <span aria-hidden="true">↗</span>`;
  });
  state.teams = await loadTeams(appConfig.links.teamsData);
  renderScreen();
}

window.addEventListener("hashchange", renderScreen);
document.addEventListener("keydown", (event) => {
  if (!slideDecks[state.screenId]) return;
  if (event.key === "ArrowLeft") setFlowStep((state.slideSteps[state.screenId] || 0) - 1);
  if (event.key === "ArrowRight") setFlowStep((state.slideSteps[state.screenId] || 0) + 1);
});

start();
