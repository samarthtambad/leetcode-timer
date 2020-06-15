'use strict';

const difficulty = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

const timeDefault = {
  // setting default values
  easy: '900', // 15 mins
  medium: '1200', // 20 mins
  hard: '1800', // 30 mins
};

var currentTimer;
var currentStartTime;
var currentDifficulty;
var difficultyToTimeMap;

// ------------------- Timer Functionality ---------------------- //
// https://stackoverflow.com/questions/14147069/countdown-timer-objects-javascript

// I added optional callbacks. This could be setup better, but the details of that are negligible.
function TaskTimer(name, durationInSeconds, onEnd, onTick) {
  var endTime,
    self = this, // store a reference to this since the context of window.setTimeout is always window
    running = false;
  this.name = name;
  this.totalSeconds = durationInSeconds;
  this.accuracy = 5; // ticks per second
  // this.sound = new Audio('resources/sound.mp3');

  var go = function tick() {
    var now = new Date().getTime();
    if (now >= endTime) {
      // self.sound.play();
      if (typeof onEnd === 'function') onEnd.call(self);
      return;
    }
    self.totalSeconds = Math.round((endTime - now) / 1000); // update totalSeconds placeholder
    if (typeof onTick === 'function') onTick.call(self);
    window.setTimeout(tick, 1000 / self.accuracy); // you can increase the denominator for greater accuracy.
  };

  // this is an instance method to start the timer
  this.start = function() {
    if (running) return; // prevent multiple calls to start

    running = true;
    endTime = new Date().getTime() + durationInSeconds * 1000; // this is when the timer should be done (with current functionality. If you want the ability to pause the timer, the logic would need to be updated)
    go();
  };

  this.toTimeString = function() {
    var hrs = Math.floor(this.totalSeconds / 60 / 60).toString(),
      min = Math.floor(this.totalSeconds / 60 - hrs * 60).toString(),
      sec = (this.totalSeconds % 60).toString();

    return [hrs.padStart(2, '0'), min.padStart(2, '0'), sec.padStart(2, '0')].join(':');
  };
}

function onTimerEnd() {
  alert('done');
}

function onTimerTick() {
  console.log(this.toTimeString());
  $('#timer-container').text(currentTimer.toTimeString());
}

// ---------------------------------------------------------------- //

function afterDOMContentLoaded() {
  // fetch options data
  chrome.runtime.sendMessage({ action: 'send_data' }, function(response) {
    console.log('Get options data');
    console.log(response.data);
    difficultyToTimeMap = response.data;

    // fetch current difficulty from page
    var difficulty = $('div.css-14oi08n')[0].getAttribute('diff');
    console.log(difficulty);
    currentDifficulty = 'easy'; // difficulty

    // get timer value
    currentStartTime = difficultyToTimeMap[currentDifficulty];
    console.log(currentStartTime);

    // create timer
    currentTimer = new TaskTimer('timer', currentStartTime, onTimerEnd, onTimerTick);

    // inject timer element into page
    var elem = $('<div id="timer-container" style="width: 80px; height: 25px; margin-right: 25px; font-size: large; text-align: center; float:right"></div>');
    $('#navbar-right-container').prepend(elem);

    $('#timer-container').text(currentTimer.toTimeString());
  });
}

document.onreadystatechange = function() {
  if (document.readyState === 'complete') {
    setTimeout(afterDOMContentLoaded, 2000);
  }
};

// Receive message from background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
  if (request.action == 'timer_start') {
    sendResponse({ message: 'timer_started' });
    console.log('timer started');
    currentTimer.start();
  }
  if (request.action == 'timer_stop') {
    sendResponse({ message: 'timer_stopped' });
    console.log('timer stopped');
    // currentTimer.start();
  }
});
