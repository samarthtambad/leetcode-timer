'use strict';

const difficulty = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

const state = {
  READY: 'ready',
  RUNNING: 'running',
};

var currentTimer;
var currentStartTime;
var currentDifficulty;
var difficultyToTimeMap;

// timer plus state management
function TaskTimer(name, durationInSeconds, onStart, onStop, onEnd, onTick) {
  var endTime,
    self = this; // store a reference to this since the context of window.setTimeout is always window
  var currentState = state.READY;
  this.name = name;
  this.originalDuration = durationInSeconds;
  this.totalSeconds = durationInSeconds;
  this.accuracy = 2; // ticks per second

  var go = function tick() {
    var now = new Date().getTime();
    if (currentState != state.RUNNING) {
      if (typeof onStop === 'function') onStop.call(self);
      return;
    }
    if (now >= endTime) {
      if (typeof onEnd === 'function') onEnd.call(self);
      return;
    }
    self.totalSeconds = Math.round((endTime - now) / 1000); // update totalSeconds placeholder
    if (typeof onTick === 'function') onTick.call(self);
    window.setTimeout(tick, 1000 / self.accuracy); // you can increase the denominator for greater accuracy.
  };

  // this is an instance method to start the timer
  this.start = function() {
    if (currentState === state.RUNNING) return; // prevent multiple calls to start
    if (typeof onStart === 'function') onStart.call(self);
    currentState = state.RUNNING;
    endTime = new Date().getTime() + durationInSeconds * 1000; // this is when the timer should be done (with current functionality. If you want the ability to pause the timer, the logic would need to be updated)
    go();
  };

  this.stop = function() {
    this.totalSeconds = this.originalDuration;
    currentState = state.READY;
  };

  this.getCurrentState = function() {
    return currentState;
  };

  this.toTimeString = function() {
    var hrs = Math.floor(this.totalSeconds / 60 / 60).toString(),
      min = Math.floor(this.totalSeconds / 60 - hrs * 60).toString(),
      sec = (this.totalSeconds % 60).toString();

    return [hrs.padStart(2, '0'), min.padStart(2, '0'), sec.padStart(2, '0')].join(':');
  };
}

function onTimerStart() {
  console.log('timer started');
}

function onTimerStop() {
  console.log('timer stopped');
  $('#timer-container').text(currentTimer.toTimeString());
}

function onTimerEnd() {
  console.log('timer ended');
  currentTimer.stop();
  chrome.runtime.sendMessage({ action: 'finish' });
  $('#timer-container').text(currentTimer.toTimeString());
  alert('Time is up!');
}

function onTimerTick() {
  // console.log(this.toTimeString());
  $('#timer-container').text(currentTimer.toTimeString());
}

function afterDOMContentLoaded() {
  // fetch options data
  chrome.runtime.sendMessage({ action: 'send_data' }, function(response) {
    difficultyToTimeMap = response.data;

    // fetch current difficulty from page
    $('div.css-10o4wqw')[0].setAttribute('id', 'timer-difficulty');
    var divDifficulty = $('#timer-difficulty').find('div:first-child')[0];
    var difficulty = divDifficulty.getAttribute('diff');
    currentDifficulty = difficulty; // difficulty

    // get timer value
    currentStartTime = difficultyToTimeMap[currentDifficulty];

    // create timer
    currentTimer = new TaskTimer('timer', currentStartTime, onTimerStart, onTimerStop, onTimerEnd, onTimerTick);

    // inject timer element into page
    var elem = $('<div id="timer-container" style="width: 80px; height: 25px; margin-right: 25px; font-size: large; text-align: center; float:right"></div>');
    $('#navbar-right-container').prepend(elem);

    $('#timer-container').text(currentTimer.toTimeString());

    // remove feedback anchor element if present
    var feedbackElem = document.querySelectorAll('.feedback-anchor')[0];
    if (feedbackElem) {
      feedbackElem.parentNode.removeChild(feedbackElem);
    }
  });
}

document.onreadystatechange = function() {
  if (document.readyState === 'complete') {
    setTimeout(afterDOMContentLoaded, 2500);
  }
};

// Receive message from background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
  if (request.action === 'timer_start') {
    sendResponse({ message: 'timer_started' });
    currentTimer.start();
  }
  if (request.action === 'timer_stop') {
    sendResponse({ message: 'timer_stopped' });
    currentTimer.stop();
  }
  if (request.action === 'send_state') {
    sendResponse({ message: currentTimer.getCurrentState() });
  }
});
