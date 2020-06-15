global.browser = require('webextension-polyfill');

var sound = new Audio('resources/sound.mp3');

const state = {
  READY: 'ready',
  RUNNING: 'running',
};

// current state of tab in focus
var currentState = state.READY;

const timeDefault = {
  // setting default values
  easy: '900', // 15 mins
  medium: '1200', // 20 mins
  hard: '1800', // 30 mins
};

var difficultyToTimeMap = {
  easy: timeDefault.easy,
  medium: timeDefault.medium,
  hard: timeDefault.hard,
};

// get options from storage API
var getOptionsData = function() {
  chrome.storage.sync.get(
    {
      easy: timeDefault.easy,
      medium: timeDefault.medium,
      hard: timeDefault.hard,
    },
    function(items) {
      difficultyToTimeMap.easy = items.easy;
      difficultyToTimeMap.medium = items.medium;
      difficultyToTimeMap.hard = items.hard;
    }
  );
};
getOptionsData();

// update state on options changed
chrome.storage.onChanged.addListener(function(changes, areaName) {
  getOptionsData();
});

// receive messages from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
  if (request.action === 'finish') {
    sound.play();
  }
  if (request.action === 'send_data') {
    sendResponse({ data: difficultyToTimeMap });
  }
});

// start timer
function start() {
  chrome.browserAction.setIcon({ path: 'icons/icon_stop_128.png' });
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'timer_start' }, function(response) {
      console.log(response.message);
    });
  });
  currentState = state.RUNNING;
}

// stop timer
function stop() {
  chrome.browserAction.setIcon({ path: 'icons/icon_play_128.png' });
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'timer_stop' }, function(response) {
      console.log(response.message);
    });
  });
  currentState = state.READY;
}

// icon clicked, state transitions
chrome.browserAction.onClicked.addListener(function() {
  switch (currentState) {
    case state.READY:
      start();
      break;
    case state.RUNNING:
      stop();
      break;
  }
});

// disable for other pages, icon state change for multiple pages simultaneously
chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    let id = tabs[0].id;
    let url = tabs[0].url;
    var pattern = /^(.*)leetcode\.com\/problems\/(.*)$/;
    if (pattern.test(url)) {
      chrome.browserAction.enable(id);
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'send_state' }, function(response) {
          console.log(response.message);
          currentState = response.message;
          switch (currentState) {
            case state.READY:
              chrome.browserAction.setIcon({ path: 'icons/icon_play_128.png' });
              break;
            case state.RUNNING:
              chrome.browserAction.setIcon({ path: 'icons/icon_stop_128.png' });
              break;
          }
        });
      });
    } else {
      chrome.browserAction.disable(id);
    }
  });
});
