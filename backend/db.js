// SQLite database using Node's built-in node:sqlite (no native build tools needed)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const configured = process.env.DB_PATH || './data/timetable.db';
const dbPath = path.isAbsolute(configured)
  ? configured
  : path.resolve(__dirname, configured);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL');

// Create the table from schema.sql
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// Seed 10 sample records if the table is empty
const { count } = db.prepare('SELECT COUNT(*) AS count FROM timetable').get();
if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO timetable
      (course_code, course_name, day_of_week, start_time, end_time, venue, lecturer, study_goal)
    VALUES
      (@course_code, @course_name, @day_of_week, @start_time, @end_time, @venue, @lecturer, @study_goal)
  `);

  const samples = [
    { course_code: 'ICT251', course_name: 'Web Technologies',            day_of_week: 'Monday',    start_time: '08:00', end_time: '10:00', venue: 'Lab 1',         lecturer: 'Mr. Phiri',   study_goal: 'Finish Node.js CRUD assignment' },
    { course_code: 'ICT261', course_name: 'Object Oriented Programming', day_of_week: 'Monday',    start_time: '10:30', end_time: '12:30', venue: 'Lab 2',         lecturer: 'Dr. Banda',   study_goal: 'Complete JavaFX lab' },
    { course_code: 'ICT211', course_name: 'Digital Logic',               day_of_week: 'Tuesday',   start_time: '08:00', end_time: '10:00', venue: 'LT 3',          lecturer: 'Mr. Mulenga', study_goal: 'Revise Boolean algebra' },
    { course_code: 'MAT201', course_name: 'Discrete Mathematics',        day_of_week: 'Tuesday',   start_time: '11:00', end_time: '13:00', venue: 'LT 1',          lecturer: 'Dr. Zulu',    study_goal: 'Practise 10 set theory problems' },
    { course_code: 'ICT231', course_name: 'Database Systems',            day_of_week: 'Wednesday', start_time: '09:00', end_time: '11:00', venue: 'Lab 3',         lecturer: 'Ms. Tembo',   study_goal: 'Learn SQL joins' },
    { course_code: 'PHY201', course_name: 'Physics for Computing',       day_of_week: 'Wednesday', start_time: '14:00', end_time: '16:00', venue: 'Science Block', lecturer: 'Dr. Chanda',  study_goal: 'Read chapter 4 on circuits' },
    { course_code: 'ICT241', course_name: 'Computer Networks',           day_of_week: 'Thursday',  start_time: '08:00', end_time: '10:00', venue: 'LT 2',          lecturer: 'Mr. Kunda',   study_goal: 'Understand the OSI model' },
    { course_code: 'COM101', course_name: 'Communication Skills',        day_of_week: 'Thursday',  start_time: '13:00', end_time: '15:00', venue: 'Room 12',       lecturer: 'Mrs. Mwale',  study_goal: 'Prepare presentation' },
    { course_code: 'ICT271', course_name: 'Systems Analysis',            day_of_week: 'Friday',    start_time: '09:00', end_time: '11:00', venue: 'Room 8',        lecturer: 'Mr. Daka',    study_goal: 'Draw a use case diagram' },
    { course_code: 'ICT281', course_name: 'Introduction to Python',      day_of_week: 'Friday',    start_time: '14:00', end_time: '16:00', venue: 'Lab 1',         lecturer: 'Ms. Lungu',   study_goal: 'Finish 5 practice programs' },
  ];

  db.exec('BEGIN');
  try {
    for (const row of samples) insert.run(row);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  console.log(`Seeded ${samples.length} sample records`);
}

module.exports = db;
