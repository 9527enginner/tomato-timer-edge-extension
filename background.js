// 默认设置
const defaultSettings = {
  workTime: 25,
  breakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
  notifications: true,
};

// 加载设置
chrome.storage.sync.get(defaultSettings, (items) => {
  settings = items;
});

let settings = defaultSettings;
let timerState = {
  isTimerRunning: false,
  timeRemaining: settings.workTime * 60,
  timerType: 'work',
  timerId: null,
  currentCycle: 1,
};

// 处理定时器结束事件
function handleTimerComplete() {
  // 发送通知
  if (settings.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: browser.runtime.getURL('icons/icon48.png'),
      title: 'Tomato Timer',
      message: 'Time is up!',
    });
  }

  // 播放声音
  const sound = new Audio(browser.runtime.getURL('assets/bell.mp3'));
  sound.play();

  // 根据计时器类型更新时间和循环计数器
  switch (timerState.timerType) {
    case 'work':
      timerState.timeRemaining = settings.breakTime * 60;
      timerState.timerType = 'break';
      break;
    case 'break':
      timerState.currentCycle += 1;
      if (timerState.currentCycle > settings.longBreakInterval) {
        timerState.timeRemaining = settings.longBreakTime * 60;
        timerState.currentCycle = 1;
      } else {
        timerState.timeRemaining = settings.workTime * 60;
        timerState.timerType = 'work';
      }
      break;
    case 'longBreak':
      timerState.timeRemaining = settings.workTime * 60;
      timerState.timerType = 'work';
      timerState.currentCycle = 1;
      break;
  }

  // 开始下一个计时器
  timerState.timerId = setTimeout(startTimer, 1000);
}

// 启动计时器
function startTimer() {
  // 更新剩余时间
  timerState.timeRemaining -= 1;

  // 更新浏览器图标
  const timeRemaining = timerState.timeRemaining;
  const timerType = timerState.timerType;
  chrome.browserAction.setIcon({
    path: `icons/${timerType}-${Math.floor(timeRemaining / 60)}.png`,
  });

  // 更新浏览器标题
  const minutesRemaining = Math.floor(timeRemaining / 60);
  const secondsRemaining = timeRemaining % 60;
  const minutesString = minutesRemaining < 10 ? `0${minutesRemaining}` : `${minutesRemaining}`;
  const secondsString = secondsRemaining < 10 ? `0${secondsRemaining}` : `${secondsRemaining}`;
  chrome.browserAction.setTitle({
    title: `${minutesString}:${secondsString} - ${timerType} (${timerState.currentCycle}/${settings.longBreakInterval})`,
  });

  // 如果计时器结束，则处理结束事件
  if (timerState.timeRemaining <= 0) {
    handleTimerComplete();
    return;
  }

  // 否则继续计时
  timerState.timerId = setTimeout(startTimer, 1000);
}

// 处理扩展程序启动事件
chrome.runtime.onStartup.addListener(() => {
  chrome.browserAction.setBadgeText({ text: '' });
 
// 处理扩展程序安装事件
chrome.runtime.onInstalled.addListener((details) => {
// 初始化浏览器图标
chrome.browserAction.setIcon({
path: 'icons/work-25.png',
});

// 初始化浏览器标题
chrome.browserAction.setTitle({
  title: `Tomato Timer - ${settings.workTime}:00`,
});


// 添加右键菜单项
chrome.contextMenus.create({
id: 'start-timer',
title: 'Start Timer',
contexts: ['browser_action'],
});

// 添加右键菜单项点击事件处理程序
chrome.contextMenus.onClicked.addListener((info, tab) => {
if (info.menuItemId === 'start-timer') {
if (!timerState.isTimerRunning) {
startTimer();
timerState.isTimerRunning = true;
}
}
});
});

// 处理浏览器图标单击事件
chrome.browserAction.onClicked.addListener(() => {
if (!timerState.isTimerRunning) {
startTimer();
timerState.isTimerRunning = true;
}
});

// 处理浏览器图标右键菜单项点击事件
chrome.browserAction.setPopup({
popup: 'popup.html',
}); 

});
