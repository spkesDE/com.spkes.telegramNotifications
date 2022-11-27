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
        + `                <button id="removeUser" onclick="onDeleteUser('${obj.UUID}')" class="btn-delete" ><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="icon" viewBox="0 0 16 16">
  <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/>
</svg></button>`
        + '            </div>'
        + '        </div>'
        + '        <hr style="margin-top: 0.5em; margin-bottom: 0.5em"/>';
    }
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
        + `                <button onclick="onEditQuestion('${obj.UUID}')" id="editQuestion" class="btn-edit"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="icon" viewBox="0 0 16 16">
  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
</svg></button>`
        + `                <button onclick="onDeleteQuestion('${obj.UUID}')" id="deleteQuestion" class="btn-delete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="icon" viewBox="0 0 16 16">
  <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/>
</svg></button>`
        + '            </div>'
        + '        </div>'
        + '        <hr style="margin-top: 0.5em; margin-bottom: 0.5em"/>';
    }
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
    for (let i = 0; i < json.length; i++) {
      const obj = json[i];
      if(obj.debug && !showDebugLogs) continue;
      logs += `[${obj.date}] ${obj.message}\n`;
    }
    document.getElementById('logs-list').value = logs;
  });
}

function updateStatus() {
  Homey.get('bot-running', (err, status) => {
    if (err) return Homey.alert(err);
    if (status) {
      document.getElementById('running-status').classList.add('running');
    } else {
      document.getElementById('running-status').classList.remove('running');
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
    document.getElementById('usePasswordDiv').classList.remove('hidden');
  } else {
    document.getElementById('usePasswordDiv').classList.add('hidden');
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
  Question.buttons.forEach((b) => {
    createNewInputFieldForEdit(b);
  });
}

function addQuestion() {
  let question = document.getElementById('question-name');
  let answers = document.getElementsByClassName('answer-input');
  let keepButtons = document.getElementById('question-answer-keep-answers').checked ?? false;
  let disable_notification = document.getElementById('question-silent-question').checked ?? false;
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
    disable_notification: disable_notification
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
    disable_notification: disable_notification
  };
  Homey.get('questions', (err, questionString) => {
    if (err) return Homey.alert(err);
    let json = [];
    if (questionString !== null) {
      json = JSON.parse(questionString);
    }
    json = json.filter((q) => q.UUID !== uuid);
    if(questionObj.UUID.length > 10) questionObj.UUID = getId();
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

function onDeleteUser(userId){
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
  document.getElementById('running-status').classList.remove('running');
  Homey.set('bot-token', document.getElementById('bot-token').value, (err) => {
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
      updateStatus();
      updateLogs();
    });
}

function onHomeyReady(Homey) {
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

  updateStatus();
  updateUsers();
  updateQuestions();
  updateLogs();
  Homey.ready();
}

function clearLogs(){
  Homey.set('logs', '[]', (err) => {
    if (err) return Homey.alert(err);
  });
  document.getElementById('logs-list').innerHTML = '';
}

function clearAllUsers(){
  Homey.unset('users');
  document.getElementById('users-list').innerHTML = 'Empty! :(';
}

function clearAddQuestionForm() {
  document.getElementById('question-answer-col').innerHTML = '';
  document.getElementById('question-name').value = '';
  createNewInputField();
  createNewInputField();
}

function createNewInputField() {
  const container = document.getElementById('question-answer-col');
  const newElem = document.createElement('input');
  newElem.setAttribute('type', 'text');
  newElem.classList.add('homey-form-input');
  newElem.classList.add('mb-1');
  if (container.children.length >= 25) return;
  container.appendChild(newElem);
}

function createNewInputFieldForEdit(value = '') {
  const container = document.getElementById('question-answer-edit-col');
  const newElem = document.createElement('input');
  newElem.setAttribute('type', 'text');
  newElem.classList.add('homey-form-input');
  newElem.classList.add('mb-1');
  newElem.value = value;
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
    .reduce(((t,e) =>t+=(e&=63)<36?e.toString(36):e<62?(e-26).toString(36).toUpperCase():e>62?"-":"_"),"");
}

