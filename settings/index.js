const botTokenElement = document.getElementById('bot-token');
const usersElement = document.getElementById('users-list');
const questionListElement = document.getElementById('question-list');
const logsElement = document.getElementById('logs-list');
const saveElement = document.getElementById('save');
const clearElement = document.getElementById('clear');
const clearAllQuestionElement = document.getElementById('clearQuestions');
const clearLogsElement = document.getElementById('clearLogs');
const runningStatusElement = document.getElementById('running-status');
const usePasswordElement = document.getElementById('usePassword');
const usePasswordDivElement = document.getElementById('usePasswordDiv');
const botPasswordElement = document.getElementById('bot-password');
const addQuestionElement = document.getElementById('addQuestion');
const editQuestionElement = document.getElementById('editQuestion');

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

function updateQuestions(Homey) {
  Homey.get('questions', (err, questions) => {
    if (err) return Homey.alert(err);
    if (questions === null) return;
    const json = JSON.parse(questions);
    let html = '';
    for (let i = 0; i < json.length; i++) {
      const obj = json[i];

      html += `${'<div class="row">'
        + '            <div class="col">'}${obj.question}</div>`
        + '            <div class="col" style="flex-direction: row">'
        + `                <button id="editQuestion" data-id="${obj.UUID}">E</button>`
        + `                <button id="deleteQuestion" data-id="${obj.UUID}">X</button>`
        + '            </div>'
        + '        </div>';
    }
    questionListElement.innerHTML = html;
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
  if (usePasswordElement.checked) {
    usePasswordDivElement.classList.remove('hidden');
  } else {
    usePasswordDivElement.classList.add('hidden');
  }
}

function getQuestion(Homey, UUID) {
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
  document.getElementById('question-answer-edit-col').innerHTML = '';
  Question.buttons.forEach((b) => {
    createNewInputFieldForEdit(b);
  });
}

function addQuestion(Homey) {
  let question = document.getElementById('question-name');
  let answers = document.getElementsByClassName('answer-input');
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
    UUID: uuidv4(),
    buttons: answersArray
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
      updateQuestions(Homey);
    });
}

function editQuestion(Homey) {
  let question = document.getElementById('question-name-edit').value;
  let uuid = document.getElementById('question-uuid-edit').value;
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
    buttons: answersArray
  };
  Homey.get('questions', (err, questionString) => {
    if (err) return Homey.alert(err);
    let json = [];
    if (questionString !== null) {
      json = JSON.parse(questionString);
    }
    json = json.filter((q) => q.UUID !== uuid);
    json.push(questionObj);
    Homey.set('questions', JSON.stringify(json), (err) => {
      if (err) return Homey.alert(err);
    });
  });

  toggleEditField(false);
  delay(1000)
    .then(() => {
      updateQuestions(Homey);
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
    botTokenElement.value = botToken;
  });

  Homey.get('password', (err, pw) => {
    if (err) return Homey.alert(err);
    botPasswordElement.value = pw ?? '';
  });

  Homey.get('use-password', (err, bool) => {
    if (err) return Homey.alert(err);
    usePasswordElement.checked = bool ?? false;
    togglePassword();
  });

  updateStatus(Homey);
  updateUsers(Homey);
  updateQuestions(Homey);
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

  questionListElement.addEventListener('click', async (e) => {
    if (e.target.tagName.toUpperCase() === 'BUTTON') {
      if (e.target.id === 'deleteQuestion') {
        removeQuestion(Homey, e.target.dataset.id);
      }
      if (e.target.id === 'editQuestion') {
        let question = await getQuestion(Homey, e.target.dataset.id);
        loadQuestion(question);
        toggleEditField();
      }
    }
  });

  usePasswordElement.addEventListener('click', () => {
    togglePassword();
  });

  saveElement.addEventListener('click', () => {
    runningStatusElement.classList.remove('running');
    Homey.set('bot-token', botTokenElement.value, (err) => {
      if (err) return Homey.alert(err);
    });
    Homey.set('use-password', usePasswordElement.checked, (err) => {
      if (err) return Homey.alert(err);
    });
    if (usePasswordElement.checked) {
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

  addQuestionElement.addEventListener('click', () => {
    addQuestion(Homey);
  });

  editQuestionElement.addEventListener('click', () => {
    editQuestion(Homey);
  });

  clearElement.addEventListener('click', () => {
    Homey.unset('users');
    usersElement.innerHTML = 'Empty! :(';
  });

  clearAllQuestionElement.addEventListener('click', () => {
    Homey.unset('questions');
    usersElement.innerHTML = 'Empty! :(';
  });

  clearLogsElement.addEventListener('click', () => {
    Homey.set('logs', '[]', (err) => {
      if (err) return Homey.alert(err);
    });
    logsElement.innerHTML = '';
  });
  Homey.ready();
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
  newElem.classList.add('answer-input');
  if (container.children.length >= 25) return;
  container.appendChild(newElem);
}

function removeQuestion(Homey, UUID) {
  Homey.get('questions', (err, questionJson) => {
    if (err) return Homey.alert(err);
    if (questionJson === null) return;
    const json = JSON.parse(questionJson);
    const questionFilter = json.filter((user) => user.UUID !== UUID);
    Homey.set('questions', JSON.stringify(questionFilter), (err) => {
      if (err) return Homey.alert(err);
    });
    updateQuestions(Homey);
  });
}

function createNewInputFieldForEdit(value = '') {
  const container = document.getElementById('question-answer-edit-col');
  const newElem = document.createElement('input');
  newElem.setAttribute('type', 'text');
  newElem.classList.add('answer-edit-input');
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

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

