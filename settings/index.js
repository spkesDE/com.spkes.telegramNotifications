// noinspection JSUnusedGlobalSymbols,JSUnresolvedVariable
// noinspection JSUnresolvedVariable

function updateUsers() {
  Homey.get('users', (err, users) => {
    if (err) return Homey.alert(err);
    if (users === null) return;
    const json = JSON.parse(users);
    let html = '<div class="row">\n'
      + '            <div class="col" style="margin-right: auto">\n'
      + '                <strong>Name</strong>\n'
      + '            </div>\n'
      + '            <div class="col" style="margin-right: 8px">\n'
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
        + '            <div class="col" style="margin-right: auto">'}${obj.chatName}</div>`
        + `            <div class="col" style="margin-right: 8px">${obj.userId}</div>`
        + '            <div class="col">'
        + `                <button id="removeUser" onclick="onDeleteUser('${obj.userId}')" class="homey-button-red-small-minWidth" ><i class="fas fa-user-slash"></i></button>`
        + '            </div>'
        + '        </div>'
        + '        <hr style="margin-top: 0.5em; margin-bottom: 0.5em"/>';
    }
    if(json.length === 0) html += "<hr>"
    document.getElementById('users-list').innerHTML = html;
  });
}

function updateQuestions() {
  Homey.get('questions', (err, questions) => {
    if (err) return Homey.alert(err);
    if (questions === null) return;
    const json = JSON.parse(questions);
    let html = '';
    for (let i = 0; i < json.length; i++) {
      const obj = json[i];

      html += `${'<div class="row">'
        + '            <div class="col" style="padding-right: 8px">'}${obj.question}</div>`
        + '            <div class="col" style="flex-direction: row">'
        + `                <button onclick="onEditQuestion('${obj.UUID}')" id="editQuestion" class="homey-button-small-minWidth me-0-5" ><i class="fas fa-edit"></i></button>`
        + `                <button onclick="onDeleteQuestion('${obj.UUID}')" id="deleteQuestion"  class="homey-button-red-small-minWidth" ><i class="fas fa-trash"></i></button>`
        + '            </div>'
        + '        </div>'
        + '        <hr style="margin-top: 0.5em; margin-bottom: 0.5em"/>';
    }
    if(json.length === 0) html += "<hr>"
    document.getElementById('question-list').innerHTML = html;
  });
}

function updateLogs() {
  let showDebugLogs = document.getElementById('debug-logs').checked ?? false;
  Homey.get('logs', (err, logsJson) => {
    if (err) return Homey.alert(err);
    if (logsJson === null) return;
    const json = JSON.parse(logsJson);
    let logs = '';
    let count = 0;
    for (let i = 0; i < json.length; i++) {
      const obj = json[i];
      if (obj.debug && !showDebugLogs) continue;
      logs += `[${obj.date}] ${obj.message}\n`;
      count++;
    }
    let logList = document.getElementById('logs-list');
    logList.value = logs;
    logList.style.height = (15 + (count * 14)) + 'px';
  });
  // Realtime logging?
}

function updateStatus() {
  Homey.get('bot-running', (err, status) => {
    if (err) return Homey.alert(err);
    if (status) {
      document.getElementById('running-status')
        .classList
        .add('running');
    } else {
      document.getElementById('running-status')
        .classList
        .remove('running');
    }
  });
  Homey.on('com.spkes.telegram.state', function(data) {
    if (data.state) {
      document.getElementById('running-status')
        .classList
        .add('running');
    } else {
      document.getElementById('running-status')
        .classList
        .remove('running');
    }
  });
}

function handleTab(event) {
  //Hide all tabs
  let tabContent = document.getElementsByClassName('tab-content');
  for (let i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = 'none';
  }
  let tabLinks = document.getElementsByClassName('tab-links');
  for (let i = 0; i < tabLinks.length; i++) {
    tabLinks[i].className = tabLinks[i].className.replace(' active', '');
  }
  document.getElementById(event.currentTarget.dataset.target).style.display = 'block';
  event.currentTarget.className += ' active';
}

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function togglePassword() {
  if (document.getElementById('usePassword').checked) {
    document.getElementById('usePasswordDiv')
      .classList
      .remove('hidden');
  } else {
    document.getElementById('usePasswordDiv')
      .classList
      .add('hidden');
  }
}

function getQuestion(UUID) {
  return new Promise((resolve, reject) => {
    Homey.get('questions', (err, questionJson) => {
      if (err) reject(err);
      if (questionJson === null) return;
      let json = JSON.parse(questionJson);
      resolve(json.find((q) => q.UUID === UUID));
    });
  });
}

function loadQuestion(Question) {
  document.getElementById('question-name-edit').value = Question.question;
  document.getElementById('question-uuid-edit').value = Question.UUID;
  document.getElementById('question-answer-edit-keep-answers').checked = Question.keepButtons ?? false;
  document.getElementById('question-silent-question-edit').checked = Question.disable_notification ?? false;
  document.getElementById('question-answer-edit-col').innerHTML = '';
  document.getElementById('columnSizeDisplayEdit').innerHTML = Question.columns ?? '2';
  document.getElementById('columnSizeEdit').value = Question.columns ?? 2;
  Question.buttons.forEach((b) => {
    createNewInputFieldForEdit(b);
  });
}

function addQuestion() {
  let question = document.getElementById('question-name');
  let answers = document.getElementsByClassName('answer-input');
  let keepButtons = document.getElementById('question-answer-keep-answers').checked ?? false;
  let disable_notification = document.getElementById('question-silent-question').checked ?? false;
  let columns = document.getElementById('columnSize').value ?? 2;
  if (question.value === '' || question.value === ' ') {
    Homey.alert('Empty question field');
  }

  let answersArray = [];
  for (let answer of answers) {
    if (answer.value === '') continue;
    answersArray.push(answer.value);
  }

  let questionObj = {
    question: question.value,
    UUID: getId(),
    buttons: answersArray,
    keepButtons: keepButtons,
    disable_notification: disable_notification,
    columns: columns,
  };
  Homey.get('questions', (err, questionString) => {
    if (err) return Homey.alert(err);
    let json = [];
    if (questionString !== null) {
      json = JSON.parse(questionString);
    }
    json.push(questionObj);
    Homey.set('questions', JSON.stringify(json), (err) => {
      if (err) return Homey.alert(err);
    });
  });

  clearAddQuestionForm();
  delay(1000)
    .then(() => {
      updateQuestions();
    });
}

function editQuestion() {
  let question = document.getElementById('question-name-edit').value;
  let uuid = document.getElementById('question-uuid-edit').value;
  let keepButtons = document.getElementById('question-answer-edit-keep-answers').checked ?? false;
  let disable_notification = document.getElementById('question-silent-question-edit').checked ?? false;
  let answers = document.getElementsByClassName('answer-edit-input');
  let columns = document.getElementById('columnSizeEdit').value ?? 2;
  if (question.value === '' || question.value === ' ') {
    Homey.alert('Empty question field');
  }
  let answersArray = [];
  for (let answer of answers) {
    if (answer.value === '') continue;
    answersArray.push(answer.value);
  }
  let questionObj = {
    question: question,
    UUID: uuid,
    buttons: answersArray,
    keepButtons: keepButtons,
    disable_notification: disable_notification,
    columns: columns,
  };
  Homey.get('questions', (err, questionString) => {
    if (err) return Homey.alert(err);
    let json = [];
    if (questionString !== null) {
      json = JSON.parse(questionString);
    }
    json = json.filter((q) => q.UUID !== uuid);
    if (questionObj.UUID.length > 10) questionObj.UUID = getId();
    json.push(questionObj);
    Homey.set('questions', JSON.stringify(json), (err) => {
      if (err) return Homey.alert(err);
    });
  });

  toggleEditField(false);
  delay(1000)
    .then(() => {
      updateQuestions();
    });
}

async function onEditQuestion(uuid) {
  let question = await getQuestion(uuid);
  loadQuestion(question);
  toggleEditField();
}

async function onDeleteQuestion(uuid) {
  Homey.get('questions', (err, questionJson) => {
    if (err) return Homey.alert(err);
    if (questionJson === null) return;
    const json = JSON.parse(questionJson);
    const questionFilter = json.filter((user) => user.UUID !== uuid);
    Homey.set('questions', JSON.stringify(questionFilter), (err) => {
      if (err) return Homey.alert(err);
    });
    updateQuestions();
  });
}

function onDeleteUser(userId) {
  Homey.get('users', (err, users) => {
    if (err) return Homey.alert(err);
    if (users === null) return;
    const json = JSON.parse(users);
    const newUsers = json.filter((user) => user.userId !== userId);
    Homey.set('users', JSON.stringify(newUsers), (err) => {
      if (err) return Homey.alert(err);
    });
    updateUsers();
  });
}

function onSaveToken() {
  let usePasswordElement = document.getElementById('usePassword');
  document.getElementById('running-status')
    .classList
    .remove('running');
  Homey.set('bot-token', document.getElementById('bot-token').value, (err) => {
    if (err) return Homey.alert(err);
  });
  Homey.set('useBll', document.getElementById('useBll').checked ?? false, (err) => {
    if (err) return Homey.alert(err);
  });
  Homey.set('use-password', usePasswordElement.checked, (err) => {
    if (err) return Homey.alert(err);
  });
  if (usePasswordElement.checked) {
    Homey.set('password', document.getElementById('bot-password').value, (err) => {
      if (err) return Homey.alert(err);
    });
  }
  delay(1000)
    .then(() => {
      updateLogs();
    });
}

function createWarningBox(text) {
  let warningBox = document.createElement('div');
  warningBox.style.position = 'fixed';
  warningBox.style.bottom = '1%';
  warningBox.style.left = '50%';
  warningBox.style.width = '25%';
  warningBox.style.padding = '5px';
  warningBox.style.fontWeight = 'bold';
  warningBox.style.transform = 'translateX(-50%)';
  warningBox.style.border = '1px solid black';
  warningBox.style.backgroundColor = 'rgba(200, 0, 0, 0.75)';
  warningBox.style.textAlign = 'center';
  warningBox.innerHTML = text;
  document.body.appendChild(warningBox);
}

function onHomeyReady(Homey) {
  if (Homey.isMock) {
    createWarningBox('Homey is Mock');
    Homey.set('questions', JSON.stringify([
      {
        question: 'Mock Question 1',
        UUID: 'fmjCEVNnqH',
        buttons: [
          'Yes', 'No', 'Maybe'
        ],
        keepButtons: false,
        disable_notification: false,
        columns: 1
      },
      {
        question: 'Mock Question 2',
        UUID: '38xyunmfH5',
        buttons: [
          'Yes', 'No', 'Maybe'
        ],
        keepButtons: true,
        disable_notification: false,
        columns: 2
      }
      ]));
    Homey.set('bot-token', "This is mock token");
    Homey.set('users', JSON.stringify([
      {
        chatName: 'Mock chatName 1',
        userId: '321213124124',
      },
      {
        chatName: 'Mock chatName 1',
        userId: '31245153',
      }
    ]));
    Homey.set('logs', "[]");
  }

  Array.from(document.getElementsByClassName('tab-links'))
    .forEach(function(element) {
      element.addEventListener('click', handleTab);
    });
  document.getElementById('defaultOpen')
    .click();
  createNewInputField();
  createNewInputField();

  Homey.get('bot-token', (err, botToken) => {
    if (err) return Homey.alert(err);
    document.getElementById('bot-token').value = botToken;
  });

  Homey.get('password', (err, pw) => {
    if (err) return Homey.alert(err);
    document.getElementById('bot-password').value = pw ?? '';
  });

  Homey.get('use-password', (err, bool) => {
    if (err) return Homey.alert(err);
    document.getElementById('usePassword').checked = bool ?? false;
    togglePassword();
  });

  Homey.get('useBll', (err, bool) => {
    if (err) return Homey.alert(err);
    document.getElementById('useBll').checked = bool ?? false;
  });

  updateStatus();
  updateUsers();
  updateQuestions();
  updateLogs();
  Homey.ready();

}

function clearLogs() {
  Homey.set('logs', '[]', (err) => {
    if (err) return Homey.alert(err);
  });
  document.getElementById('logs-list').value = '';
}

function clearAllUsers() {
  Homey.unset('users');
  document.getElementById('users-list').innerHTML = 'Empty! :(';
}

function clearAddQuestionForm() {
  document.getElementById('question-answer-col').innerHTML = '';
  document.getElementById('question-name').value = '';
  document.getElementById('columnSize').value = 2;
  document.getElementById('columnSizeDisplay').innerHTML = '2';
  document.getElementById('question-silent-question').checked = false;
  document.getElementById('question-answer-keep-answers').checked = false;
  createNewInputField();
  createNewInputField();
}

function createNewInputField() {
  const container = document.getElementById('question-answer-col');
  const newElem = document.createElement('input');
  newElem.setAttribute('type', 'text');
  newElem.classList.add('homey-form-input');
  newElem.classList.add('answer-input'); //Selector to get answers
  newElem.classList.add('mb-1');
  newElem.placeholder = 'your answer...';
  if (container.children.length >= 25) return;
  container.appendChild(newElem);
}

function createNewInputFieldForEdit(value = '') {
  const container = document.getElementById('question-answer-edit-col');
  const newElem = document.createElement('input');
  newElem.setAttribute('type', 'text');
  newElem.classList.add('answer-');
  newElem.classList.add('homey-form-input');
  newElem.classList.add('answer-edit-input'); //Selector to get answers!
  newElem.classList.add('mb-1');
  newElem.value = value;
  newElem.placeholder = 'your answer...';
  if (container.children.length >= 25) return;
  container.appendChild(newElem);
}

function toggleEditField(bool = true) {
  if (bool) {
    document.getElementById('question-add-field')
      .classList
      .add('hidden');
    document.getElementById('question-edit-field')
      .classList
      .remove('hidden');
  } else {
    document.getElementById('question-add-field')
      .classList
      .remove('hidden');
    // Reset to default
    clearAddQuestionForm();
    document.getElementById('question-edit-field')
      .classList
      .add('hidden');
  }
}

/**
 * NanoId https://github.com/ai/nanoid
 *
 * @param length
 * @returns {string|string}
 */
function getId(length = 10) {
  return crypto.getRandomValues(new Uint8Array(length))
    .reduce(((t, e) => t += (e &= 63) < 36 ? e.toString(36) : e < 62 ? (e - 26).toString(36)
      .toUpperCase() : e > 62 ? '-' : '_'), '');
}
