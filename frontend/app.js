// ---------------------------------------------------------------
// API address
// - Served by the Node server (local or deployed): same origin, so a relative path works.
// - Opened directly as a file or from another host: set API_BASE below,
//   e.g. 'https://your-app.onrender.com'
// ---------------------------------------------------------------
const API_BASE = location.protocol === 'file:' ? 'http://localhost:3000' : '';
const API_URL = `${API_BASE}/api/timetable`;

const FIELDS = [
  'course_code', 'course_name', 'day_of_week',
  'start_time', 'end_time', 'venue', 'lecturer', 'study_goal',
];

const form = document.getElementById('timetable-form');
const recordId = document.getElementById('record-id');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const rowsEl = document.getElementById('rows');
const emptyEl = document.getElementById('empty');
const statusEl = document.getElementById('status');

let records = [];

function setStatus(message, type = '') {
  statusEl.textContent = message;
  statusEl.className = type;
}

// Small helper so every request handles JSON and errors the same way
async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// READ: load all records and draw the table
async function loadRecords() {
  try {
    records = await request(API_URL);
    renderTable();
  } catch (err) {
    setStatus(`Could not load the timetable: ${err.message}. Is the server running?`, 'error');
  }
}

function renderTable() {
  rowsEl.innerHTML = '';
  emptyEl.hidden = records.length > 0;

  for (const r of records) {
    const tr = document.createElement('tr');

    const cells = [
      r.id,
      [r.course_code, r.course_name].filter(Boolean).join(' - '),
      r.day_of_week || '',
      [r.start_time, r.end_time].filter(Boolean).join(' to '),
      r.venue || '',
      r.lecturer || '',
      r.study_goal || '',
    ];
    for (const value of cells) {
      const td = document.createElement('td');
      td.textContent = value; // textContent keeps user input from being run as HTML
      tr.appendChild(td);
    }

    const actions = document.createElement('td');
    const wrap = document.createElement('div');
    wrap.className = 'row-actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEdit(r.id));

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'danger';
    delBtn.addEventListener('click', () => removeRecord(r));

    wrap.append(editBtn, delBtn);
    actions.appendChild(wrap);
    tr.appendChild(actions);
    rowsEl.appendChild(tr);
  }
}

function formData() {
  const body = {};
  for (const f of FIELDS) body[f] = document.getElementById(f).value;
  return body;
}

function resetForm() {
  form.reset();
  recordId.value = '';
  formTitle.textContent = 'Add a class';
  saveBtn.textContent = 'Save class';
  cancelBtn.hidden = true;
}

// Load a row's values into the form so it can be saved with PUT
function startEdit(id) {
  const r = records.find((x) => x.id === id);
  if (!r) return;
  for (const f of FIELDS) document.getElementById(f).value = r[f] ?? '';
  recordId.value = r.id;
  formTitle.textContent = `Edit class #${r.id}`;
  saveBtn.textContent = 'Update class';
  cancelBtn.hidden = false;
  setStatus('');
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('course_code').focus();
}

// CREATE (POST) or UPDATE (PUT)
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = recordId.value;
  try {
    if (id) {
      await request(`${API_URL}/${id}`, { method: 'PUT', body: JSON.stringify(formData()) });
      setStatus('Class updated.', 'ok');
    } else {
      await request(API_URL, { method: 'POST', body: JSON.stringify(formData()) });
      setStatus('Class added.', 'ok');
    }
    resetForm();
    await loadRecords();
  } catch (err) {
    setStatus(err.message, 'error');
  }
});

cancelBtn.addEventListener('click', () => {
  resetForm();
  setStatus('');
});

// DELETE
async function removeRecord(r) {
  if (!confirm(`Delete ${r.course_code}?`)) return;
  try {
    await request(`${API_URL}/${r.id}`, { method: 'DELETE' });
    if (recordId.value === String(r.id)) resetForm();
    setStatus('Class deleted.', 'ok');
    await loadRecords();
  } catch (err) {
    setStatus(err.message, 'error');
  }
}

loadRecords();
