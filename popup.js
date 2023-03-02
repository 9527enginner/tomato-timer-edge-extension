// 定義 DOM 元素變數
const timerDisplay = document.getElementById('timer-display');
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');

// 定義更新畫面的函數
function updateTimerDisplay() {
  const minutesRemaining = Math.floor(timerState.timeRemaining / 60);
  const secondsRemaining = timerState.timeRemaining % 60;
  const minutesString = minutesRemaining < 10 ? `0${minutesRemaining}` : `${minutesRemaining}`;
  const secondsString = secondsRemaining < 10 ? `0${secondsRemaining}` : `${secondsRemaining}`;
  const timerType = timerState.timerType.charAt(0).toUpperCase() + timerState.timerType.slice(1);
  const cycle = `${timerState.currentCycle}/${settings.longBreakInterval}`;
  const timerTitle = `${minutesString}:${secondsString} - ${timerType} (${cycle})`;
  
  timerDisplay.textContent = timerTitle;
}

// 定義啟動計時器的函數
function startTimer() {
  if (!timerState.isTimerRunning) {
    timerState.isTimerRunning = true;
    startButton.textContent = 'Pause';
    resetButton.disabled = true;

    // 開始計時器
    timerState.timerId = setTimeout(() => {
      timerState.timeRemaining -= 1;

      // 如果計時器結束，處理結束事件
      if (timerState.timeRemaining <= 0) {
        handleTimerComplete();
        return;
      }

      // 否則繼續計時
      updateTimerDisplay();
      startTimer();
    }, 1000);
  } else {
    // 暫停計時器
    timerState.isTimerRunning = false;
    startButton.textContent = 'Start';
    resetButton.disabled = false;
    clearTimeout(timerState.timerId);
  }
}

// 定義重置計時器的函數
function resetTimer() {
  // 停止計時器
  clearTimeout(timerState.timerId);
  timerState.isTimerRunning = false;

  // 重設計時器狀態
  timerState.timeRemaining = settings.workTime * 60;
  timerState.timerType = 'work';
  timerState.currentCycle = 1;

  // 更新畫面
  updateTimerDisplay();
  startButton.textContent = 'Start';
  resetButton.disabled = false;
}

// 當網頁載入完成時，載入計時器狀態和事件監聽器
window.addEventListener('load', () => {
  // 載入設定
  chrome.storage.sync.get(defaultSettings, (items) => {
    settings = items;
    timerState.timeRemaining = settings.workTime * 60;
    updateTimerDisplay();
  });

  // 載入事件監聽器
  startButton.addEventListener('click', startTimer);
  resetButton.addEventListener('click', resetTimer);
});

// 當背景頁面發送訊息時，更新計時器狀態
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'update-timer-state') {
    timerState = message.payload;
    updateTimerDisplay();

// 更新設定值
function updateSettingsValue(name, value) {
  settings[name] = value;
  chrome.storage.sync.set({ [name]: value });
}

// 更新計時器的剩餘時間
function updateTimerRemaining(time) {
  timerState.timeRemaining = time;
  chrome.browserAction.setIcon({
    path: `icons/${timerState.timerType}-${Math.floor(time / 60)}.png`,
  });

  const minutesRemaining = Math.floor(time / 60);
  const secondsRemaining = time % 60;
  const minutesString = minutesRemaining < 10 ? `0${minutesRemaining}` : `${minutesRemaining}`;
  const secondsString = secondsRemaining < 10 ? `0${secondsRemaining}` : `${secondsRemaining}`;
  const timerText = `${minutesString}:${secondsString}`;

  const timerType = timerState.timerType;
  const cycleText = `${timerState.currentCycle}/${settings.longBreakInterval}`;
  const title = `Tomato Timer - ${timerText} - ${timerType} (${cycleText})`;
  chrome.browserAction.setTitle({ title: title });

  document.querySelector('#timer-remaining').innerText = timerText;
}

// 啟動或停止計時器
function toggleTimer() {
  if (timerState.isTimerRunning) {
    // 停止計時器
    clearTimeout(timerState.timerId);
    timerState.isTimerRunning = false;
    document.querySelector('#start-button').innerText = 'Start';
  } else {
    // 啟動計時器
    startTimer();
    timerState.isTimerRunning = true;
    document.querySelector('#start-button').innerText = 'Stop';
  }
}

// 初始化
function initialize() {
  // 載入設定值
  chrome.storage.sync.get(defaultSettings, (items) => {
    settings = items;
    document.querySelector('#work-time').value = settings.workTime;
    document.querySelector('#break-time').value = settings.breakTime;
    document.querySelector('#long-break-time').value = settings.longBreakTime;
    document.querySelector('#long-break-interval').value = settings.longBreakInterval;
    document.querySelector('#notifications').checked = settings.notifications;
  });

  // 註冊事件監聽器
  document.querySelector('#work-time').addEventListener('change', (event) => {
    updateSettingsValue('workTime', event.target.value);
    updateTimerRemaining(settings.workTime * 60);
    chrome.browserAction.setTitle({ title: `Tomato Timer - ${settings.workTime}:00` });
  });

  document.querySelector('#break-time').addEventListener('change', (event) => {
    updateSettingsValue('breakTime', event.target.value);
  });

  document.querySelector('#long-break-time').addEventListener('change', (event) => {
    updateSettingsValue('longBreakTime', event.target.value);
  });

  document.querySelector('#long-break-interval').addEventListener('change', (event) => {
    updateSettingsValue('longBreakInterval', event.target.value);
  });

  document.querySelector('#notifications').addEventListener('change', (event) => {
    updateSettingsValue('notifications', event.target.checked);
  });

  document.querySelector('#start-button').addEventListener('click', toggleTimer);
}

// 初始化頁面
initialize();


