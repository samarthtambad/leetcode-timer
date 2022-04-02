import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const Options = () => {
  const [easy, setEasy] = useState<string>("00:15:00");
  const [medium, setMedium] = useState<string>("00:20:00");
  const [hard, setHard] = useState<string>("00:30:00");
  const [defaultTime, setDefaultTime] = useState<string>("00:30:00");
  const [invalid, setInvalid] = useState<boolean>(false);

  const errorStyle = {
    color: 'red',
    paddingLeft: '10px'
  }

  const buttonStyle = {
    marginTop: '10px'
  }

  const statusStyle = {
    paddingLeft: '10px'
  }

  useEffect(() => {
    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    chrome.storage.sync.get(
      {
        easy: easy,
        medium: medium,
        hard: hard,
        default: defaultTime
      },
      (items) => {
        setEasy(items.easy)
        setMedium(items.medium)
        setHard(items.hard)
        setDefaultTime(items.defaultTime)
      }
    );
  }, []);

  const saveOptions = () => {
    validateTimeString(easy)
    validateTimeString(medium)
    validateTimeString(hard)
    validateTimeString(defaultTime)

    if(invalid) return

    // Saves options to chrome.storage.sync.
    chrome.storage.sync.set(
      {
        easy: easy,
        medium: medium,
        hard: hard,
        default: defaultTime
      },
      () => {
        // Update status to let user know options were saved.
        setStatus("Options saved.");
        const id = setTimeout(() => {
          setStatus("");
        }, 1000);
        return () => clearTimeout(id);
      }
    );
  };

  function setStatus(text: string) {
    var status = document.getElementById('status');
    if (status != null)
      status.textContent = text;
  }

  function handleChangeEasy(event: any) {
    setEasy(event.target.value)
  }

  function handleChangeMedium(event: any) {
    setMedium(event.target.value)
  }

  function handleChangeHard(event: any) {
    setHard(event.target.value)
  }

  function handleChangeDefault(event: any) {
    setHard(event.target.value)
  }

  function validateTimeString(timeStr: string) {
    var timeList = timeStr.split(':')
    if (timeList.length != 3) {
      setInvalid(true)
      return
    }

    var hrs: number = parseInt(timeList[0])
    var min: number = parseInt(timeList[1])
    var sec: number = parseInt(timeList[2])

    if(isNaN(hrs) || isNaN(min) || isNaN(sec) || hrs < 0 || min < 0 || min > 60 || sec < 0 || sec > 59) {
      setInvalid(true)
      return
    }

    setInvalid(false)
  }

  return (
    <>
      <div>
        <h3>Set default time for each difficulty level</h3>
        <div>
          <h3>Easy (hh:mm:ss)</h3>
          <input type="text" value={easy} onChange={handleChangeEasy} />
          <h3>Medium (hh:mm:ss)</h3>
          <input type="text" value={medium} onChange={handleChangeMedium} />
          <h3>Hard (hh:mm:ss)</h3>
          <input type="text" value={hard} onChange={handleChangeHard} />
          <h3>Default (hh:mm:ss)</h3>
          <input type="text" value={hard} onChange={handleChangeDefault} />
        </div>
        <button id="save" style={buttonStyle} onClick={saveOptions}>Save</button>
        { invalid && <span style={errorStyle}>Invalid input. Please check format is <b>hh:mm:ss</b></span> }
        <span id="status" style={statusStyle}></span>
      </div>
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>,
  document.getElementById("root")
);
