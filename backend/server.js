require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());           // lets the HTML page call the API from another origin
app.use(express.json());   // parse JSON request bodies

// Serve the frontend too, so one deployed link gives you both the page and the API
app.use(express.static(path.join(__dirname, '..', 'frontend')));

const FIELDS = [
  'course_code', 'course_name', 'day_of_week',
  'start_time', 'end_time', 'venue', 'lecturer', 'study_goal',
];

// Keep only known fields; trim strings; empty string becomes null
function pickFields(body) {
  const out = {};
  for (const f of FIELDS) {
    const v = body[f];
    out[f] = typeof v === 'string' ? (v.trim() || null) : (v ?? null);
  }
  return out;
}

function validId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'id must be a positive integer' });
    return null;
  }
  return id;
}

// GET /api/timetable -> list all records
app.get('/api/timetable', (req, res) => {
  const rows = db.prepare('SELECT * FROM timetable ORDER BY id').all();
  res.json(rows);
});

// GET /api/timetable/:id -> get one record
app.get('/api/timetable/:id', (req, res) => {
  const id = validId(req, res);
  if (id === null) return;
  const row = db.prepare('SELECT * FROM timetable WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Record not found' });
  res.json(row);
});

// POST /api/timetable -> create a record
app.post('/api/timetable', (req, res) => {
  const data = pickFields(req.body || {});
  if (!data.course_code) {
    return res.status(400).json({ error: 'course_code is required' });
  }
  const result = db.prepare(`
    INSERT INTO timetable
      (course_code, course_name, day_of_week, start_time, end_time, venue, lecturer, study_goal)
    VALUES
      (@course_code, @course_name, @day_of_week, @start_time, @end_time, @venue, @lecturer, @study_goal)
  `).run(data);
  const created = db.prepare('SELECT * FROM timetable WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// PUT /api/timetable/:id -> update a record
app.put('/api/timetable/:id', (req, res) => {
  const id = validId(req, res);
  if (id === null) return;
  const data = pickFields(req.body || {});
  if (!data.course_code) {
    return res.status(400).json({ error: 'course_code is required' });
  }
  const result = db.prepare(`
    UPDATE timetable SET
      course_code = @course_code,
      course_name = @course_name,
      day_of_week = @day_of_week,
      start_time  = @start_time,
      end_time    = @end_time,
      venue       = @venue,
      lecturer    = @lecturer,
      study_goal  = @study_goal,
      updated_at  = CURRENT_TIMESTAMP
    WHERE id = @id
  `).run({ ...data, id });
  if (result.changes === 0) return res.status(404).json({ error: 'Record not found' });
  res.json(db.prepare('SELECT * FROM timetable WHERE id = ?').get(id));
});

// DELETE /api/timetable/:id -> delete a record
app.delete('/api/timetable/:id', (req, res) => {
  const id = validId(req, res);
  if (id === null) return;
  const result = db.prepare('DELETE FROM timetable WHERE id = ?').run(id);
  if (result.changes === 0) return res.status(404).json({ error: 'Record not found' });
  res.json({ message: 'Record deleted', id });
});

// Unknown API routes return JSON, not HTML
app.use('/api', (req, res) => res.status(404).json({ error: 'Route not found' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
