const setAlarmBtn = document.getElementById('set-alarm-btn');
const timeInput = document.getElementById('time-input');
const alarmClockContainer = document.getElementById('alarm-clock-container');
let alarms = [];

if (window.localStorage.getItem('alarms')) {

    alarms = JSON.parse(window.localStorage.getItem('alarms'));
    alarms.forEach((alarm) => {
        const alarmClock = drawAlarmClock(alarm);
        alarmClockContainer.insertAdjacentHTML('beforeend', alarmClock);
    });

}

//window.localStorage.clear();

setAlarmBtn.addEventListener('click', setNewAlarmClock);


function setNewAlarmClock() {

    const alarmTime = timeInput.value;

    if (alarmTime) {
        
        const timeStampId = `id${new Date().getTime()}`;
        const alarm = {
            id:timeStampId,
            time:alarmTime,
            intervalId:0
        }
        
        alarms.push(alarm);
        window.localStorage.setItem('alarms', JSON.stringify(alarms));

        // const newAlarmClock = `
        //     <div id="${alarm.id}" class="new-alarm-clock">
        //         <p class="new-alarm-clock_par">
        //             Alarm at ${alarm.time}
        //         </p>
        //         <button id="cancel-alarm-btn" class="cancel-alarm-btn" type="button" onClick="removeAlarmClock(this)">
        //             CANCEL
        //         </button>
        //     </div>
        // `;// common problem with ids here -> they should be unique, but I use them repeatedly

        const newAlarmClock = drawAlarmClock(alarm);
        
        alarmClockContainer.insertAdjacentHTML('beforeend', newAlarmClock);

        startAlarmCountdown(alarm);//next step: figure out how to trigger alarm at the time set by user after page reload
        setAlarmBtn.blur();

    } 
    
}

function drawAlarmClock(alarm) {

    const alarmClock = `
            <div id="${alarm.id}" class="new-alarm-clock">
                <p class="new-alarm-clock_par">
                    Alarm at ${alarm.time}
                </p>
                <button id="cancel-alarm-btn" class="cancel-alarm-btn" type="button" onClick="removeAlarmClock(this)">
                    CANCEL
                </button>
            </div>
        `;

    return alarmClock;

}

function startAlarmCountdown(alarm) { 
    
    let triggerAlarmDelay = 0;
    alarmTimeInMs = convertAlarmTimeToMs(alarm.time);
    currentTimeinMs = getCurrentTimeInMs();

    if(alarmTimeInMs < currentTimeinMs) {
        
        const dayInMs = 24 * 60 * 60 * 1000;
        triggerAlarmDelay = dayInMs - currentTimeinMs + alarmTimeInMs;

    } else {

        triggerAlarmDelay  = alarmTimeInMs - currentTimeinMs;

    }

    setTimeout(function() {
        if (alarms.includes(alarm)) {
            triggerAlarm(alarm);
        }
    } , triggerAlarmDelay);

}

function triggerAlarm(alarm) {

    const alarmId = alarm.id;
    const triggeredAlarm = document.getElementById(alarmId);
    const cancelBtn = document.querySelector(`#${alarmId} .cancel-alarm-btn`);
    const turnOffBtn = document.createRange().createContextualFragment(
        `<button id="turn-off-alarm-btn" class="turn-off-alarm-btn" type="button" onClick="removeAlarmClock(this)">
            TURN OFF
        </button>
    `);
    const snoozeButton = `
        <button id="snooze-alarm-btn" class="snooze-alarm-btn" type="button" onclick="snoozeAlarm(this)">
            SNOOZE
        </button>
    `;

    triggeredAlarm.replaceChild(turnOffBtn, cancelBtn);
    triggeredAlarm.insertAdjacentHTML('beforeend', snoozeButton);

    intervalId = setInterval(function() {
        flashAlarmClock(alarmId)
    }, 500);

    alarms.forEach(alarm => {
        if(alarm.id === alarmId) {
            alarm.intervalId = intervalId;
        }
    });

}

function flashAlarmClock(alarmId) {

    const alarmClock = document.getElementById(alarmId);
    alarmClock.classList.toggle('inverted'); 

}

function removeAlarmClock(button) {
    
    const alarmClock = button.parentNode;
    const alarmClockId = alarmClock.getAttribute('id');
    const indexOfElToDelete = alarms.findIndex(alarm => alarm.id === alarmClockId);
    intervalId = alarms[indexOfElToDelete].intervalId;

    alarmClock.remove();
    alarms.splice(indexOfElToDelete, 1);
    window.localStorage.setItem('alarms', JSON.stringify(alarms));

    if (intervalId != 0) {
        clearInterval(intervalId);
    }
    
}

function snoozeAlarm(button) {

    const alarmEl = button.parentNode;
    const alarmId = alarmEl.getAttribute('id');
    const alarm = alarms.find(alarm => alarm.id === alarmId);
    clearInterval(alarm.intervalId);

    const updatedAlarmTime = function() {
        
        const timeStr = alarm.time;
        const timeArr = timeStr.split(':');
        let hours = parseInt(timeArr[0]);
        let mins = parseInt(timeArr[1]);
        let calculatedTime = '';
        
        if (mins > 54) {
            hours += 1;
            if (mins === 55) {
                mins = 0;
            } else {
                mins = 5 - (60 - mins);
            }
        } else {
            mins += 5;
        }

        if (hours === 23) {
            hours = 0;
        }

        if (mins < 10) {
            mins = `0${mins}`;
        } else {
            mins = `${mins}`;
        } 

        if (hours < 10) {
            hours = `0${hours}`;
        } else {
            hours = `${hours}`;
        }

        timeArr[0] = hours;
        timeArr[1] = mins;
        calculatedTime = timeArr.join(':');
        alarm.time = calculatedTime;
        window.localStorage.setItem('alarms', JSON.stringify(alarms));
        
        return calculatedTime;

    }

    alarmEl.classList.remove('inverted');
    alarmEl.innerHTML = `
        <p class="new-alarm-clock_par">
            Alarm at ${updatedAlarmTime()}
        </p>
        <button id="cancel-alarm-btn" class="cancel-alarm-btn" type="button" onClick="removeAlarmClock(this)">
            CANCEL
        </button>
    `;

    setTimeout( function() {
        if (alarms.includes(alarm)) {
            triggerAlarm(alarm);
        }
    }, 5*60*1000);
   
}

function getCurrentTimeInMs() {

    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    let seconds  = date.getSeconds();
    
    const currentTimeinMs = (hours * 3600 + minutes * 60 + seconds) * 1000;

    return(currentTimeinMs);
}

function convertAlarmTimeToMs(alarmTime) {

    const arr = alarmTime.split(':');
    const hours = arr[0];
    const minutes = arr[1];
    const alarmTimeInMs = (hours * 3600 + minutes * 60) * 1000;

    return(alarmTimeInMs);

}