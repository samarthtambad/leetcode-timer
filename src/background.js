global.browser = require('webextension-polyfill');

var current;
var count_timer;
var running = false;
var sound = new Audio('sound.mp3');

var timer = {
  min: 0,
  sec: 5,
  tick: function() {
    console.log(this.toString());
    if (this.min == 0) {
      if (this.sec == 1) {
        this.sec -= 1;
        // timer finished, alert the user
        stopTimer();
        alert('finish');
      } else {
        this.sec -= 1;
      }
    } else {
      if (this.sec == 0) {
        this.sec = 59;
        this.min -= 1;
      } else {
        this.sec -= 1;
      }
    }
  },
  toString: function() {
    var mins = this.min.toString();
    var secs = this.sec.toString();
    if (this.min < 10) mins = '0' + mins;
    if (this.sec < 10) secs = '0' + secs;
    return mins + ':' + secs;
  },
};

const states = {
  READY: 'ready',
  RUNNING: 'running',
  BACKGROUND: 'background',
};

var state = states.BACKGROUND;

function reset() {
  current = 25;
  clearTimeout(count_timer);
  chrome.browserAction.setBadgeText({ text: '' });
}

function popNotification() {
  var message_index = Math.round(Math.random() * (messages.length - 1));
  var message = '"' + messages[message_index] + '"';
  chrome.storage.sync.get({ reqClick: 'yes' }, function(items) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'Timer.png',
      title: chrome.i18n.getMessage('timeUp'),
      message: message,
      contextMessage: new Date().toLocaleTimeString(), // in gray text
      eventTime: Date.now(), // add a event time stamp
      isClickable: true, // show hand pointer when hover
      requireInteraction: items.reqClick === 'yes', // if true, do not close until click
    });
  });
}

// Send a request from the extension to a content script
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, { greeting: 'hello' }, function(response) {
    console.log(response.farewell);
  });
});

// Receive messages from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'stop_icon') {
    alert('stop icon');
    chrome.browserAction.setIcon({ path: 'icons/icon_stop_128.png' });
    chrome.tabs.query({ active: true, windowType: 'normal', currentWindow: true }, function(d) {
      var tabId = d[0].id;
      chrome.browserAction.setIcon({ path: 'icons/icon_stop_128.png', tabId: tabId });
    });
  }
  console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
  if (request.greeting == 'hello') sendResponse({ farewell: 'goodbye' });
});

function startTimer() {
  timer.min = 0;
  timer.sec = 10;
  updateTimer();
}

function updateTimer() {
  timer.tick();
  console.log(timer.toString());
  count_timer = setTimeout(updateTimer, 1000); // per 1 sec
}

function stopTimer() {
  clearTimeout(count_timer);
}

function start() {
  chrome.browserAction.setIcon({ path: 'icons/icon_stop_128.png' });
  state = states.RUNNING;
}

function stop() {
  chrome.browserAction.setIcon({ path: 'icons/icon_play_128.png' });
  state = states.STOPPED;
}

function iconClick() {
  alert('click');
  startTimer();
  switch (state) {
    case states.BACKGROUND:
      break;
    case states.READY:
      start();
      break;
    case states.RUNNING:
      stop();
      break;
  }
}

chrome.browserAction.onClicked.addListener(iconClick);
chrome.notifications.onClicked.addListener(function(notificationid) {
  chrome.notifications.clear(notificationid);
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  alert('onActivated');
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    let url = tabs[0].url;
    // use `url` here inside the callback because it's asynchronous!
    alert(url);
  });
});

chrome.tabs.onUpdated.addListener(function(tabID, info, tab) {
  alert('onUpdated');
});
