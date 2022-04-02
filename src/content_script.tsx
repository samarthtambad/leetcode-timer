import { Timer } from "./timer";

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.color) {
    console.log("Receive color = " + msg.color);
    document.body.style.backgroundColor = msg.color;
    sendResponse("Change color to " + msg.color);
  } else {
    sendResponse("Color message is none.");
  }
});

function setTextToContainer(text: string) {
  var container = document.getElementById("timer-container")
  container?.setAttribute("text", text)
}

function fetchDifficultyFromPage() {
  var container = document.querySelector('div.css-10o4wqw')
  if(container == null) return 'default'

  var difficultyElement = container.firstChild 
  if (difficultyElement == null) return 'default'

  return difficultyElement.textContent
}

function convertToSeconds(timeStr: string) {
  var timeList = timeStr.split(':')
  var hrs: number = parseInt(timeList[0])
  var min: number = parseInt(timeList[1])
  var sec: number = parseInt(timeList[2])
  return hrs * 60 * 60 + min * 60 + sec
}

function afterDOMContentLoaded() {

  chrome.runtime.sendMessage({ action: 'send_data' }, function(response) {
    var selectedTime
    var timeMap = response.data
    switch(fetchDifficultyFromPage()) {
      case 'Easy':
      selectedTime = timeMap.easy
      break
      case 'Medium':
      selectedTime = timeMap.medium
      break
      case 'Hard':
      selectedTime = timeMap.hard
      break
      default:
      selectedTime = timeMap.default
  }

  var timer = new Timer(convertToSeconds(selectedTime))

  // what to do when timer is started
  timer.setOnStartListener(() => {
    console.log('timer started')
  })

  // what to do when timer is stopped
  timer.setOnStopListener(() => {
    console.log('timer stopped');
    setTextToContainer(timer.toString())
  })

  // what to do when timer ends
  timer.setOnEndListener(() => {
    console.log('timer ended');
    timer.stop();
    setTextToContainer(timer.toString())
    alert('Time is up!');
  })

  // what to do on each tick
  timer.setOnTickListener(() => {
    setTextToContainer(timer.toString())
  })

    // inject timer element into page
    var elem = '<div id="timer-container" style="width: 80px; height: 25px; margin-right: 25px; font-size: large; text-align: center; float:right"></div>';
    var container = document.getElementById('navbar-right-container')
    container?.prepend(elem)
    
    var timerContainer = document.getElementById('timer-container')
    timerContainer?.setAttribute('text', timer.toString())
  });
}

document.onreadystatechange = function() {
  if (document.readyState === 'complete') {
      setTimeout(afterDOMContentLoaded, 2500)
  }
}