# ICT251 Activity 4 - Student Timetable & Goals (Question 3)

Single-table CRUD app: Node.js + Express REST API, SQLite database, HTML/JavaScript frontend.

- Resource: `timetable`
- Table: `timetable` (id, course_code, course_name, day_of_week, start_time, end_time, venue, lecturer, study_goal, created_at, updated_at)
- Database: Node's built-in `node:sqlite` (needs Node 22.13 or newer, no build tools)

## Run locally

```
cd backend
npm install
npm start
```

Open http://localhost:3000 (the server also serves the frontend).
The database file and 10 sample records are created automatically on first start.

## Environment variables (backend/.env)

```
PORT=3000
DB_PATH=./data/timetable.db
```

## API

| Method | URL                   | Purpose           |
|--------|-----------------------|-------------------|
| GET    | /api/timetable        | List all records  |
| GET    | /api/timetable/:id    | Get one record    |
| POST   | /api/timetable        | Create a record   |
| PUT    | /api/timetable/:id    | Update a record   |
| DELETE | /api/timetable/:id    | Delete a record   |

`course_code` is required for POST and PUT. All responses are JSON.

## Postman

Import `postman/ICT251_Timetable.postman_collection.json`. Set the `base_url` variable to the
local or deployed address, then run the requests in order (POST saves the new id for PUT and DELETE).
