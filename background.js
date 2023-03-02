// 设置番茄钟的默认设置
const defaultSettings = {
  workTime: 25,
  breakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4
};

// 初始化番茄钟的状态
let timerId;
let settings = {};

// 加载设置
chrome.storage.sync.get(defaultSettings, (items) => {
  settings = items;
});

// 创建一个新的计时器
function createTimer() {
  let timeLeft = settings.workTime * 60;
  let isBreakTime = false;
  let isLongBreakTime = false;
  let count = 0;

  // 每秒更新倒计时
  timerId = setInterval(() => {
    timeLeft--;

    // 更新番茄钟图标
    chrome.browserAction.setIcon({
      path: `images/${isBreakTime ? 'break' : 'work'}${isLongBreakTime ? '-long' : ''}.png`
    });

    // 倒计时结束
    if (timeLeft <= 0) {
      clearInterval(timerId);

      // 播放提示音
      const audio = new Audio('sound.mp3');
      audio.play();

      // 进入休息时间或长休息时间
      if (!isBreakTime || (isBreakTime && count < settings.longBreakInterval)) {
        timeLeft = settings.breakTime * 60;
        isBreakTime = true;
      } else {
        timeLeft = settings.longBreakTime * 60;
        isBreakTime = false;
        count = 0;
      }

      // 如果是休息时间，则增加番茄钟数目
      if (isBreakTime) {
        count++;
      }

      // 开始下一个计时器
      setTimeout(() => {
        createTimer();
      }, timeLeft * 1000);
    }
  }, 1000);
}

// 启动番茄钟
function startTimer() {
  createTimer();
}

// 停止番茄钟
function stopTimer() {
  clearInterval(timerId);
  chrome.browserAction.setIcon({ path: 'images/work.png' });
}

// 接收来自 popup 页面的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'start':
      startTimer();
      break;
    case 'stop':
      stopTimer();
      break;
    case 'getSettings':
      sendResponse(settings);
      break;
  }
});

// 注册浏览器图标单击事件
chrome.browserAction.onClicked.addListener(() => {
  // 向 popup 页面发送消息
  chrome.runtime.sendMessage({ type: 'openPopup' });
});
