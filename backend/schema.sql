-- Question 3: Student Timetable & Goals (resource: timetable, table: timetable)
CREATE TABLE IF NOT EXISTS timetable (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  course_code  TEXT NOT NULL,
  course_name  TEXT,
  day_of_week  TEXT,
  start_time   TEXT,
  end_time     TEXT,
  venue        TEXT,
  lecturer     TEXT,
  study_goal   TEXT,
  created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
