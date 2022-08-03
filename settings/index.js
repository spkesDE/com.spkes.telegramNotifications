const botTokenElement = document.getElementById('bot-token');
const usersElement = document.getElementById('users');
const logsElement = document.getElementById('logs');
const saveElement = document.getElementById('save');
const clearElement = document.getElementById('clear');
const clearLogsElement = document.getElementById('clearLogs');
const runningStatusElement = document.getElementById('running-status');
const usePasswordElement = document.getElementById('usePassword');
const usePasswordDivElement = document.getElementById('usePasswordDiv');
const botPasswordElement = document.getElementById('bot-password');

function updateUsers(Homey) {
  Homey.get('users', (err, users) => {
    if (err) return Homey.alert(err);
    if (users === null) return;
    const json = JSON.parse(users);
    let html = '<div class="row">\n'
      + '            <div class="col">\n'
      + '                <strong>Name</strong>\n'
      + '            </div>\n'
      + '            <div class="col">\n'
      + '                <strong>ID</strong>\n'
      + '            </div>\n'
      + '            <div class="col">\n'
      + '                <strong>Remove</strong>\n'
      + '            </div>\n'
      + '        </div>\n'
      + '        <hr>';
    for (let i = 0; i < json.length; i++) {
      const obj = json[i];

      html += `${'<div class="row">'
        + '            <div class="col">'}${obj.chatName}</div>`
        + `            <div class="col">${obj.userId}</div>`
        + '            <div class="col">'
        + `                <button id="removeUser" data-id="${obj.userId}">X</button>`
        + '            </div>'
        + '        </div>';
    }
    usersElement.innerHTML = html;
  });
}

function updateLogs(Homey) {
  Homey.get('logs', (err, logs) => {
    if (err) return Homey.alert(err);
    if (logs === null) return;
    const json = JSON.parse(logs);
    let html = '';
    for (let i = 0; i < json.length; i++) {
      const obj = json[i];
      html += `${obj.date}<br>&nbsp;&nbsp;&nbsp;&nbsp;${obj.message}<br>`;
    }
    logsElement.innerHTML = html;
  });
}

function updateStatus(Homey) {
  Homey.get('bot-running', (err, status) => {
    if (err) return Homey.alert(err);
    if (status) {
      runningStatusElement.classList.add('running');
    } else {
      runningStatusElement.classList.remove('running');
    }
  });
}

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function togglePassword(){
  if (usePasswordElement.checked) {
    usePasswordDivElement.classList.remove('hidden');
  } else {
    usePasswordDivElement.classList.add('hidden');
  }
}

function onHomeyReady(Homey) {
  Homey.get('bot-token', (err, botToken) => {
    if (err) return Homey.alert(err);
    botTokenElement.value = botToken;
  });

  Homey.get('password', (err, pw) => {
    if (err) return Homey.alert(err);
    botPasswordElement.value = pw ?? "";
  });

  Homey.get('use-password', (err, bool) => {
    if (err) return Homey.alert(err);
    usePasswordElement.checked = bool ?? false;
    togglePassword();
  });

  updateStatus(Homey);
  updateUsers(Homey);
  updateLogs(Homey);

  usersElement.addEventListener('click', (e) => {
    if (e.target.tagName.toUpperCase() === 'BUTTON') {
      const userId = parseInt(e.target.dataset.id);
      Homey.get('users', (err, users) => {
        if (err) return Homey.alert(err);
        if (users === null) return;
        const json = JSON.parse(users);
        const newUsers = json.filter((user) => user.userId !== userId);
        Homey.set('users', JSON.stringify(newUsers), (err) => {
          if (err) return Homey.alert(err);
        });
        updateUsers(Homey);
      });
    }
  });

  usePasswordElement.addEventListener('click', (e) => {
    togglePassword()
  });

  saveElement.addEventListener('click', (e) => {
    runningStatusElement.classList.remove('running');
    Homey.set('bot-token', botTokenElement.value, (err) => {
      if (err) return Homey.alert(err);
    });
    Homey.set('use-password', usePasswordElement.checked, (err) => {
      if (err) return Homey.alert(err);
    });
    if(usePasswordElement.checked) {
      Homey.set('password', botPasswordElement.value, (err) => {
        if (err) return Homey.alert(err);
      });
    }
    delay(1000)
      .then(() => {
        updateStatus(Homey);
        updateLogs(Homey);
      });
  });

  clearElement.addEventListener('click', (e) => {
    Homey.unset('users');
    usersElement.innerHTML = 'Empty! :(';
  });

  clearLogsElement.addEventListener('click', (e) => {
    Homey.set('logs', '[]', (err) => {
      if (err) return Homey.alert(err);
    });
    logsElement.innerHTML = '';
  });
  Homey.ready();
}
