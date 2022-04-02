
import { State } from "./timer"
import { getTimeFromPageOrDefault } from "./utils";

// global.browser = require('webextension-polyfill');

// get options from storage API
var getOptionsData = function() {
  var easy = "00:15:00"
  var medium = "00:20:00"
  var hard = "00:30:00"
  var def = "00:20:00"
  var timeMap = null

  // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    chrome.storage.sync.get(
      {
      easy: easy,
      medium: medium,
      hard: hard,
      default: def
      },
      (items) => {
        timeMap = items
      }
  );

  return timeMap
};

var sound = new Audio('resources/sound.mp3')
var currentState = State.READY
var timeMap = getOptionsData()

// update state on options changed
chrome.storage.onChanged.addListener(function(changes, areaName) {
  timeMap = getOptionsData()
});

// receive messages from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
  if (request.action === 'finish') {
    sound.play();
    chrome.browserAction.setIcon({ path: 'icons/icon_play_128.png' });
    currentState = State.READY;
  }
  if (request.action === 'send_data') {
    sendResponse({ data: timeMap });
  }
});

// start timer
function start() {
  chrome.browserAction.setIcon({ path: 'icons/icon_stop_128.png' });
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id? tabs[0].id : 0, { action: 'timer_start' }, function(response) {
      console.log(response.message);
    });
  });
  currentState = State.RUNNING;
}

// stop timer
function stop() {
  chrome.browserAction.setIcon({ path: 'icons/icon_play_128.png' });
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id? tabs[0].id : 0, { action: 'timer_stop' }, function(response) {
      console.log(response.message);
    });
  });
  currentState = State.READY;
}

// icon clicked, state transitions
chrome.browserAction.onClicked.addListener(function() {
  switch (currentState) {
    case State.READY:
      start();
      break;
    case State.RUNNING:
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
    if (pattern.test(url? url: "")) {
      chrome.browserAction.enable(id);
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id? tabs[0].id : 0, { action: 'send_state' }, function(response) {
          console.log(response.message);
          currentState = response.message;
          switch (currentState) {
            case State.READY:
              chrome.browserAction.setIcon({ path: 'icons/icon_play_128.png' });
              break;
            case State.RUNNING:
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