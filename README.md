# ✅ TaskFlow — Team Task Manager

A full-stack web application for managing projects, assigning tasks, and tracking team progress with role-based access control.

## 🔗 Live Demo
- **Frontend:** https://your-frontend.railway.app
- **Backend API:** https://your-backend.railway.app
- **API Docs:** https://your-backend.railway.app/docs

---

## 🚀 Features

- **Authentication** — Signup/Login with JWT tokens
- **Role-Based Access** — Admin (full control) and Member (limited access)
- **Project Management** — Create, update, delete projects; manage team members
- **Kanban Task Board** — Visual task tracking across To Do / In Progress / Completed
- **Task Assignment** — Assign tasks to team members with due dates and priority
- **Dashboard** — Live stats: total projects, tasks by status, overdue tasks
- **My Tasks** — Personalized view of all tasks assigned to the logged-in user
- **Overdue Detection** — Visual warnings for past-due tasks

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Auth | JWT (python-jose) + bcrypt |
| ORM | SQLAlchemy |
| Deployment | Railway |

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Database
Create a PostgreSQL database named `taskmanager`:
```sql
CREATE DATABASE taskmanager;
```
Tables are auto-created on first run.

---

## 🌐 Deployment (Railway)

### Backend
1. Create new Railway project → Deploy from GitHub
2. Select `/backend` as root directory
3. Add environment variables:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `SECRET_KEY` — a random secret string
4. Add PostgreSQL plugin in Railway

### Frontend
1. Create new Railway service → Deploy from GitHub
2. Select `/frontend` as root directory
3. Add environment variable:
   - `REACT_APP_API_URL` — your backend Railway URL

---

## 📋 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/projects | List all projects |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Get project |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |
| POST | /api/projects/:id/members | Add member |
| DELETE | /api/projects/:id/members/:uid | Remove member |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/projects/:id/tasks | List project tasks |
| POST | /api/projects/:id/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| GET | /api/my-tasks | My assigned tasks |
| GET | /api/dashboard | Dashboard stats |

---

## 🔐 Role-Based Access

| Feature | Admin | Member |
|---|---|---|
| Create projects | ✅ | ✅ |
| Delete any project | ✅ | ❌ (own only) |
| Add/remove members | ✅ (own project) | ❌ |
| Create tasks | ✅ | ✅ |
| Update task status | ✅ | ✅ |
| View all projects | ✅ | Own projects only |

---

## 👩‍💻 Author
Built by Reeti Pandey
