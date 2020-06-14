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

var difficultyToTimeMap = {
  easy: timeDefault.easy,
  medium: timeDefault.medium,
  hard: timeDefault.hard,
};

var currentDifficulty;
var currentStartTime;
var currentTimer;

// const getStorageData = key =>
//   new Promise((resolve, reject) =>
//     chrome.storage.sync.get(key, result =>
//       chrome.runtime.lastError
//         ? reject(Error(chrome.runtime.lastError.message))
//         : resolve(result)
//     )
//   )

// const { data } = await getStorageData('data')

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
  this.sound = new Audio('resources/sound.mp3');

  var go = function tick() {
    var now = new Date().getTime();
    if (now >= endTime) {
      self.sound.play();
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

    return [hrs.padStart('0', 2), min.padStart('0', 2), sec.padStart('0', 2)].join(':');
  };
}
// no reason to make this an instance method :)
// TaskTimer.prototype.toTimeString = function() {
//   var hrs = Math.floor(this.totalSeconds / 60 / 60).toString(),
//       min = Math.floor(this.totalSeconds / 60 - hrs * 60).toString(),
//       sec = (this.totalSeconds % 60).toString();

//   return [hrs.padStart("0", 2), min.padStart("0", 2), sec.padStart("0", 2)].join(":");
// };

function onTimerEnd() {
  alert('done');
}

function onTimerTick() {
  console.log(this.toTimeString());
}

// ---------------------------------------------------------------- //

document.onreadystatechange = function() {
  if (document.readyState === 'complete') {
    // fetch settings from storage
    chrome.storage.sync.get(
      {
        timeEasy: timeDefault.easy,
        timeMedium: timeDefault.medium,
        timeHard: timeDefault.hard,
      },
      function(items) {
        difficultyToTimeMap.easy = items.timeEasy;
        difficultyToTimeMap.medium = items.timeMedium;
        difficultyToTimeMap.hard = items.timeHard;
        console.log(items);

        // fetch current difficulty from page
        // var difficulty = $("div.css-14oi08n")[0].getAttribute("diff");
        // console.log(difficulty);
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
      }
    );

    // fetch current difficulty from page
    // var difficulty = $("div.css-14oi08n")[0].getAttribute("diff");
    // console.log(difficulty);
    // currentDifficulty = difficulty;

    // get timer value
    // currentStartTime = difficultyToTimeMap['easy'];
    // console.log(currentStartTime);

    // create timer
    // currentTimer = new TaskTimer("timer", currentStartTime, onTimerEnd, onTimerTick);

    // inject timer element into page
    // var elem = $('<div id="timer-container" style="width: 80px; height: 25px; margin-right: 25px; font-size: large; text-align: center; float:right"></div>');
    // $('#navbar-right-container').prepend(elem);

    // $("#timer-container").text(this.toTimeString());

    // var timer = this.getElementById("#timer-container");
    // timer.textContent = "05:30";
  }
};

// on current tab, change icon
// chrome.runtime.sendMessage({action: "stop_icon"})
// chrome.tabs.onActivated.addListener(function(activeInfo) {
//   chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
//     let url = tabs[0].url;
//     // use `url` here inside the callback because it's asynchronous!
//     alert(url);
//   });
// });

// on icon click, establish

// url matches with pattern for content_scripts
chrome.runtime.onConnect.addListener(function(port) {
  chrome.runtime.sendMessage({ greeting: 'hello' }, function(response) {
    console.log(response.farewell);
  });
});

// Send a request from a content script
chrome.runtime.sendMessage({ greeting: 'hello' }, function(response) {
  console.log(response.farewell);
});

// var timer = new TaskTimer("timer1", 5, onTimerEnd, onTimerTick);

// function onTimerEnd() {
//   alert('done');
// }

// function onTimerTick() {
//   console.log(this.toTimeString());
// }

// Receive message from background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
  if (request.greeting == 'hello') sendResponse({ farewell: 'goodbye' });
  if (request.action == 'timer_start') {
    sendResponse({ message: 'timer_started' });
    console.log('timer started');
    timer.start();
  }
});
