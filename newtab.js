const DEFAULT_SETTINGS = {
  monthlyIncome: 15000,
  workHoursPerDay: 8,
  workStart: "09:00",
  lunchStart: "12:00",
  lunchEnd: "13:30",
  workEnd: "18:00",
};

const headlineEl = document.getElementById("headline");
const moneyEl = document.getElementById("money");
const durationEl = document.getElementById("duration");
const progressFillEl = document.getElementById("progress-fill");
const progressTextEl = document.getElementById("progress-text");
const openBtn = document.getElementById("open-settings");
const dialog = document.getElementById("settings-dialog");
const form = document.getElementById("settings-form");

let settings = { ...DEFAULT_SETTINGS };

function parseMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function getTodayWorkingSeconds(nowDate, cfg) {
  const nowMin = nowDate.getHours() * 60 + nowDate.getMinutes();
  const nowSecInDay = nowMin * 60 + nowDate.getSeconds();

  const workStartSec = parseMinutes(cfg.workStart) * 60;
  const lunchStartSec = parseMinutes(cfg.lunchStart) * 60;
  const lunchEndSec = parseMinutes(cfg.lunchEnd) * 60;
  const workEndSec = parseMinutes(cfg.workEnd) * 60;
  const nowSecCapped = Math.min(nowSecInDay, workEndSec);

  if (nowSecCapped <= workStartSec) return 0;

  if (nowSecCapped <= lunchStartSec) {
    return nowSecCapped - workStartSec;
  }

  if (nowSecCapped <= lunchEndSec) {
    return lunchStartSec - workStartSec;
  }

  const effective = (lunchStartSec - workStartSec) + (nowSecCapped - lunchEndSec);
  const scheduleSeconds = Math.max(0, (workEndSec - workStartSec) - (lunchEndSec - lunchStartSec));
  const maxSeconds = Math.max(0, Math.min(cfg.workHoursPerDay * 3600, scheduleSeconds));
  return Math.max(0, Math.min(effective, maxSeconds));
}

function getDayProgressPercent(nowDate, cfg) {
  const nowMin = nowDate.getHours() * 60 + nowDate.getMinutes();
  const nowSecInDay = nowMin * 60 + nowDate.getSeconds();
  const workStartSec = parseMinutes(cfg.workStart) * 60;
  const workEndSec = parseMinutes(cfg.workEnd) * 60;
  const span = Math.max(1, workEndSec - workStartSec);

  if (nowSecInDay <= workStartSec) return 0;
  if (nowSecInDay >= workEndSec) return 100;

  return ((nowSecInDay - workStartSec) / span) * 100;
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `工作时长：${hours}小时${minutes}分钟${seconds}秒`;
}

function getDailyIncome(cfg) {
  return cfg.monthlyIncome / 21.75;
}

function updateScreen() {
  const now = new Date();
  const workedSeconds = getTodayWorkingSeconds(now, settings);
  const workedHours = workedSeconds / 3600;
  const dayIncome = getDailyIncome(settings);
  const earned = dayIncome * (workedHours / settings.workHoursPerDay);
  const progressPercent = getDayProgressPercent(now, settings);

  moneyEl.textContent = `¥${earned.toFixed(2)}`;
  durationEl.textContent = formatDuration(workedSeconds);
  progressFillEl.style.width = `${progressPercent.toFixed(2)}%`;
  progressTextEl.textContent = `今日进度：${progressPercent.toFixed(1)}%`;
  headlineEl.textContent = "今天已经骗到了";
}

function fillForm(cfg) {
  form.monthlyIncome.value = cfg.monthlyIncome;
  form.workHoursPerDay.value = cfg.workHoursPerDay;
  form.workStart.value = cfg.workStart;
  form.lunchStart.value = cfg.lunchStart;
  form.lunchEnd.value = cfg.lunchEnd;
  form.workEnd.value = cfg.workEnd;
}

async function loadSettings() {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  settings = {
    monthlyIncome: Number(stored.monthlyIncome),
    workHoursPerDay: Number(stored.workHoursPerDay),
    workStart: stored.workStart,
    lunchStart: stored.lunchStart,
    lunchEnd: stored.lunchEnd,
    workEnd: stored.workEnd,
  };
  fillForm(settings);
}

openBtn.addEventListener("click", () => {
  fillForm(settings);
  dialog.showModal();
});

form.addEventListener("reset", () => {
  dialog.close();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const next = {
    monthlyIncome: Number(form.monthlyIncome.value),
    workHoursPerDay: Number(form.workHoursPerDay.value),
    workStart: form.workStart.value,
    lunchStart: form.lunchStart.value,
    lunchEnd: form.lunchEnd.value,
    workEnd: form.workEnd.value,
  };

  if (next.workHoursPerDay <= 0) return;

  settings = next;
  await chrome.storage.sync.set(next);
  dialog.close();
  updateScreen();
});

(async function init() {
  await loadSettings();
  updateScreen();
  setInterval(updateScreen, 1000);
})();
