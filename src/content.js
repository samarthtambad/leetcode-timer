// console.log("content script running")
// document.body.style.background = "black";

console.log(document.readyState);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', afterDOMLoaded);
} else {
  afterDOMLoaded();
}

document.onreadystatechange = function() {
  if (document.readyState === 'complete') {
    var elem = $('<div id="timer-container" style="width: 80px; height: 25px; margin-right: 25px; font-size: large; text-align: center; float:right"></div>');
    $('#navbar-right-container').prepend(elem);

    // $("#timer-container").text("05:30");

    // var timer = this.getElementById("#timer-container");
    // timer.textContent = "05:30";
  }
};

function afterDOMLoaded() {
  //Everything that needs to happen after the DOM has initially loaded.
}

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

// Receive message from background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
  if (request.greeting == 'hello') sendResponse({ farewell: 'goodbye' });
});
