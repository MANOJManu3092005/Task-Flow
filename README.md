# TaskFlow — Project Management Tool

A simple, modern project management web app built for the **CodeAlpha Full Stack Development Internship — Task 3**.

TaskFlow lets you create projects, organize work on a Kanban-style board (To Do → In Progress → Review → Done), assign tasks to teammates, and discuss work through comments — all in a clean, responsive UI.

---

## Features

- User registration and login (JWT-based authentication, passwords hashed with bcrypt)
- Dashboard with project/task stats and recent activity
- Create, edit, and delete projects
- Kanban project board with four columns and status updates
- Create, view, and delete tasks (title, description, assignee, priority, due date)
- Task detail view with comments (add, view, delete your own)
- Basic profile page with editable name/email
- Fully responsive layout (desktop, laptop, tablet, mobile)
- Demo data included so the app isn't empty on first run

---

## Tech Stack

**Frontend:** HTML, CSS, vanilla JavaScript
**Backend:** Node.js, Express.js
**Database:** MongoDB (via Mongoose)
**Auth:** JWT + bcrypt

---

## Folder Structure

```
TaskFlow/
├── frontend/           # Static HTML/CSS/JS client
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── projects.html
│   ├── project.html    # Kanban board
│   ├── profile.html
│   ├── css/style.css
│   └── js/              # api.js, auth.js, layout.js, dashboard.js, projects.js, project.js, profile.js
│
├── backend/
│   ├── server.js
│   ├── seed.js          # Populates demo data
│   ├── config/db.js
│   ├── models/           # User, Project, Task, Comment
│   ├── routes/           # auth, projects, tasks, comments
│   ├── controllers/
│   ├── middleware/auth.js
│   ├── package.json
│   └── .env.example
│
├── README.md
└── .gitignore
```

---

## 1. Prerequisites

- [Node.js](https://nodejs.org/) v18 or newer
- A MongoDB database — either:
  - **Local MongoDB** installed on your machine ([download here](https://www.mongodb.com/try/download/community)), or
  - A free **MongoDB Atlas** cluster ([https://www.mongodb.com/atlas](https://www.mongodb.com/atlas))

---

## 2. Install dependencies

Open a terminal in the `backend` folder and run:

```bash
cd backend
npm install
```

---

## 3. Configure MongoDB & environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and set your values:

```
MONGO_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=replace_this_with_a_long_random_secret_key
PORT=5000
```

- **Local MongoDB:** if MongoDB is running locally, the default `MONGO_URI` above works as-is.
- **MongoDB Atlas:** replace `MONGO_URI` with your connection string, e.g.
  `mongodb+srv://<username>:<password>@cluster0.mongodb.net/taskflow`
- **JWT_SECRET:** use any long, random string — this signs your login tokens.

---

## 4. Load demo data (recommended)

This fills the database with 3 sample projects, 10 tasks, and some comments, so the dashboard and board aren't empty:

```bash
npm run seed
```

You should see a confirmation in the terminal along with demo login credentials (also listed below).

---

## 5. Start the backend server

```bash
npm start
```

You should see:

```
MongoDB connected successfully
TaskFlow server running on http://localhost:5000
```

For development with auto-restart on file changes, use `npm run dev` instead (requires `nodemon`, already listed as a dev dependency).

---

## 6. Open the app

The Express server also serves the frontend, so once it's running, just open your browser to:

```
http://localhost:5000
```

You'll be redirected to the login page automatically.

> Alternatively, you can open `frontend/login.html` directly in a browser or with a tool like VS Code's Live Server — the API calls are relative (`/api/...`), so make sure the backend is running on port 5000 for that to work too.

---

## Demo login credentials

After running `npm run seed`, you can log in with any of these accounts (all use the same password):

| Email                | Password      |
|-----------------------|---------------|
| john@taskflow.com     | password123   |
| sarah@taskflow.com    | password123   |
| mike@taskflow.com     | password123   |

Or just register a brand new account from the **Register** page.

---

## API Overview

| Method | Endpoint                     | Description                  |
|--------|-------------------------------|-------------------------------|
| POST   | /api/register                 | Create a new account          |
| POST   | /api/login                    | Log in and receive a JWT      |
| GET    | /api/profile                  | Get current user's profile    |
| PUT    | /api/profile                  | Update current user's profile |
| GET    | /api/users                    | List all users (for assigning tasks) |
| GET    | /api/projects                 | List your projects            |
| POST   | /api/projects                 | Create a project              |
| PUT    | /api/projects/:id             | Update a project               |
| DELETE | /api/projects/:id             | Delete a project               |
| GET    | /api/tasks?project=:id        | List tasks (optionally by project) |
| POST   | /api/tasks                    | Create a task                  |
| PUT    | /api/tasks/:id                | Update a task (e.g. change status) |
| DELETE | /api/tasks/:id                | Delete a task                  |
| GET    | /api/tasks/:id/comments        | List comments on a task        |
| POST   | /api/tasks/:id/comments        | Add a comment to a task        |
| DELETE | /api/comments/:id              | Delete your own comment        |

All routes except register/login require an `Authorization: Bearer <token>` header.

---

## Notes

- This is intentionally a **simple, internship-level project** — no WebSockets, real-time sync, or complex permission systems.
- Drag-and-drop was intentionally left out in favor of a simple status dropdown in the task detail view, as allowed by the assignment.
- `node_modules/` and `.env` are excluded from this package — run `npm install` and set up your own `.env` as described above.
