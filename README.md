<div align="center">

# TaskFlow — Task Management System

**A production-grade REST API with JWT Authentication, Role-Based Access Control, and a modern Next.js dashboard**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Deployed on Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=white)](https://your-backend.onrender.com)
[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white)](https://your-app.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

| Resource | URL |
|---|---|
| 🌐 **Live App** | [https://your-app.vercel.app](https://your-app.vercel.app) |
| 📡 **API Base** | [https://your-backend.onrender.com/api/v1](https://your-backend.onrender.com/api/v1) |
| 📚 **Swagger Docs** | [https://your-backend.onrender.com/api-docs](https://your-backend.onrender.com/api-docs) |
| 🔁 **Health Check** | [https://your-backend.onrender.com/health](https://your-backend.onrender.com/health) |

> Replace `your-backend` and `your-app` with your actual Render & Vercel URLs after deploying.

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Test Accounts](#-test-accounts)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Local Development](#-local-development)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [RBAC — Roles & Permissions](#-rbac--roles--permissions)
- [Admin Role Management](#-admin-role-management)
- [Deployment](#-deployment)
- [Scalability](#-scalability)

---

## ✨ Features

| Feature | Details |
|---|---|
| **Authentication** | JWT in `HttpOnly` + `SameSite=None` + `Secure` cookies — XSS & CSRF-safe |
| **RBAC** | Three roles: `admin`, `manager`, `user` — enforced at both route and service layer |
| **Role Assignment API** | Admin-only endpoint to promote/demote users without DB access |
| **Validation** | Zod schemas on every endpoint — 422 with field-level error messages |
| **Security** | Helmet, CORS allowlist, 10kb body limit, registration role sanitization |
| **API Versioning** | All routes under `/api/v1/` |
| **Swagger UI** | Full OpenAPI 3.0 docs with schemas, examples, and all error codes |
| **Pagination** | Status/priority filtering + page/limit query params |
| **Optimistic UI** | Task status updates instantly — API call happens in background |
| **Frontend** | Next.js 14 App Router · Glassmorphism dark theme · Framer Motion animations |
| **Deployment** | Backend on Render · Frontend on Vercel · DB on MongoDB Atlas |

---

## 🧪 Test Accounts

These accounts are seeded into the database via `npm run seed` and are ready to use immediately.

> ⚠️ **Change these credentials before going to production.**

### 🔴 Admin Account
```
Email   : admin@taskflow.dev
Password: Admin@1234
Role    : admin
ID      : 69aaae21452ef67e2e82a130
```
**Can do:** Everything — list all users, assign roles, delete any task, update any task, view all tasks.

### 🟡 Manager Account
```
Email   : manager@taskflow.dev
Password: Manager@1234
Role    : manager
ID      : 69aaae21452ef67e2e82a133
```
**Can do:** View all tasks, update any task, create tasks, delete own tasks. Cannot delete others' tasks or manage user roles.

### 🟢 Regular User
Register via `POST /api/v1/auth/register` — all new accounts default to `user` role.

---

## 🏗️ Architecture

```
HTTP Request
    │
    ▼
  Express Router (/api/v1/...)
    │
    ├── isAuthenticated (JWT cookie check)
    ├── authorizeRoles(...roles) → 403 if role not allowed
    ├── validate(zodSchema)     → 422 if body invalid
    │
    ▼
  Controller  ──►  Service  ──►  Repository  ──►  MongoDB Atlas
                  (RBAC ownership checks live here)
```

The backend uses the **Controller → Service → Repository** pattern:
- **Controller** — HTTP in/out, calls service, returns JSON
- **Service** — Business logic + per-resource RBAC ownership checks
- **Repository** — Pure Mongoose queries, zero business logic

---

## 📁 Project Structure

```
Assignment/
├── backend/
│   ├── render.yaml                    # Render deployment config
│   ├── .env.example                   # Environment variable template
│   └── src/
│       ├── config/                    # env.ts, db.ts
│       ├── middleware/                # auth.middleware.ts, validate, error
│       ├── models/                    # User & Task Mongoose schemas
│       ├── modules/
│       │   ├── auth/                  # register, login, logout, /me
│       │   ├── tasks/                 # Full CRUD with RBAC
│       │   └── admin/                 # User listing + role assignment (admin only)
│       ├── scripts/
│       │   └── seed.ts                # Database seeder (admin + manager accounts)
│       ├── app.ts                     # Express + Swagger + CORS
│       └── server.ts                  # Entry point
│
├── frontend/
│   ├── vercel.json                    # Vercel deployment config
│   └── src/
│       ├── app/
│       │   ├── (auth)/                # /login, /register
│       │   └── dashboard/             # Protected dashboard
│       ├── components/                # TaskCard, TaskDrawer, Sidebar, Topbar
│       ├── context/                   # AuthContext
│       └── lib/                       # Axios instance with interceptors
│
├── README.md
└── SCALABILITY.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 + TypeScript 5.4 |
| Backend Framework | Express.js |
| Database | MongoDB Atlas + Mongoose 8 |
| Auth | JWT + HttpOnly cookies (`sameSite: none` in production) |
| Password Hashing | bcrypt (12 rounds) |
| Validation | Zod — full schema validation with field-level errors |
| API Docs | Swagger UI / OpenAPI 3.0 |
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS — glassmorphism dark theme |
| Animations | Framer Motion |
| HTTP Client | Axios with request/response interceptors |
| Security | Helmet, CORS allowlist, body size limit |
| Backend Hosting | Render |
| Frontend Hosting | Vercel |
| Database Hosting | MongoDB Atlas |

---

## 🚀 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/abhi-14gyan/taskmanagement.git
cd taskmanagement
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGODB_URI and secrets
npm run dev            # hot-reload at http://localhost:5000
```

### 3. Seed the database (creates admin + manager accounts)

```bash
cd backend
npm run seed
```

### 4. Frontend setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev            # http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | `development` or `production` | `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster/db` |
| `JWT_SECRET` | Signing secret (min 32 chars) | `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `COOKIE_SECRET` | Cookie signing secret | `openssl rand -hex 32` |
| `CLIENT_URL` | Frontend origin for CORS | `https://your-app.vercel.app` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://your-backend.onrender.com/api/v1` |

> ⚠️ **Never commit `.env` or `.env.local`.** Only commit the `.example` files.

---

## 📡 API Reference

> Full interactive docs: [`/api-docs`](https://your-backend.onrender.com/api-docs)

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/v1/auth/register` | ❌ | Register — role always forced to `user` |
| `POST` | `/api/v1/auth/login` | ❌ | Login → sets HttpOnly JWT cookie |
| `POST` | `/api/v1/auth/logout` | ❌ | Clear session cookie |
| `GET` | `/api/v1/auth/me` | ✅ | Get current user profile |

### Task Endpoints

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api/v1/tasks` | ✅ | List tasks — scoped by role (see query params below) |
| `POST` | `/api/v1/tasks` | ✅ | Create a new task |
| `GET` | `/api/v1/tasks/:id` | ✅ | Get single task |
| `PATCH` | `/api/v1/tasks/:id` | ✅ | Partial update (any subset of fields) |
| `DELETE` | `/api/v1/tasks/:id` | ✅ | Delete — own task or any task (admin) |

#### `GET /api/v1/tasks` — Query Parameters

| Parameter | Type | Values | Default | Description |
|---|---|---|---|---|
| `status` | string | `todo` \| `in-progress` \| `done` | — | Filter by status |
| `priority` | string | `low` \| `medium` \| `high` | — | Filter by priority |
| `page` | integer | ≥ 1 | `1` | Page number |
| `limit` | integer | 1–100 | `10` | Results per page |

Example: `GET /api/v1/tasks?status=in-progress&priority=high&page=1&limit=5`

### Admin Endpoints

| Method | Endpoint | Auth | Role | Description |
|---|---|:---:|---|---|
| `GET` | `/api/v1/admin/users` | ✅ | **admin** | List all users + their roles |
| `PATCH` | `/api/v1/admin/users/:id/role` | ✅ | **admin** | Assign `user`/`manager`/`admin` |

### Error Response Format

All errors follow a consistent structure:

```json
{ "success": false, "message": "Human-readable error" }
```

Validation errors (422) include field-level details:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" },
    { "field": "password", "message": "Must contain at least 1 uppercase letter and 1 number" }
  ]
}
```

| Status | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Bad request (business rule violation) |
| `401` | Not authenticated — no or invalid JWT cookie |
| `403` | Authenticated but wrong role |
| `404` | Resource not found |
| `409` | Conflict (e.g. email taken, role already set) |
| `422` | Validation failed (Zod schema error) |
| `500` | Internal server error |

---

## 🔐 RBAC — Roles & Permissions

All new registrations are **hard-locked to `role: 'user'`** — even if a client sends `"role": "admin"` in the request body, it is stripped by Zod and overwritten in the service layer.

### Permission Matrix

| Action | `user` | `manager` | `admin` |
|---|:---:|:---:|:---:|
| Register / Login | ✅ | ✅ | ✅ |
| Self-assign admin at register | ❌ | ❌ | ❌ |
| View **own / assigned** tasks | ✅ | ✅ | ✅ |
| View **all** tasks | ❌ | ✅ | ✅ |
| Create task | ✅ | ✅ | ✅ |
| Update **own** tasks | ✅ | ✅ | ✅ |
| Update **any** task | ❌ | ✅ | ✅ |
| Delete **own** tasks | ✅ | ✅ | ✅ |
| Delete **any** task | ❌ | ❌ | ✅ |
| List all users | ❌ | ❌ | ✅ |
| Assign / change roles | ❌ | ❌ | ✅ |
| Change **own** role | ❌ | ❌ | ❌ |

### Where RBAC is Enforced

| Layer | What it does |
|---|---|
| **Route middleware** — `authorizeRoles('admin')` | Blocks non-admins at the router before the controller runs |
| **Service layer** — ownership checks | `extractId(task.createdBy) === userId` — prevents cross-user tampering even if route guard is bypassed |
| **Schema layer** — Zod | Strips unknown fields like `role` from registration body |
| **Service layer** — hard-code | `role: 'user'` always set in `AuthService.register()` |

---

## 🛡️ Admin Role Management

### Promote a user to Manager

```bash
PATCH /api/v1/admin/users/64b2f0ef.../role
Authorization: must be logged in as admin@taskflow.dev
Content-Type: application/json

{ "role": "manager" }
```

**Response:**
```json
{
  "success": true,
  "message": "Role updated to 'manager'",
  "data": {
    "user": {
      "_id": "64b2f0ef8e1a2c001f3d9abc",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "manager"
    }
  }
}
```

### List all users (see current roles)

```bash
GET /api/v1/admin/users
Authorization: must be logged in as admin@taskflow.dev
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "users": [
      { "_id": "69aaae21452ef67e2e82a130", "name": "Admin Tester",   "email": "admin@taskflow.dev",   "role": "admin" },
      { "_id": "69aaae21452ef67e2e82a133", "name": "Manager Tester", "email": "manager@taskflow.dev", "role": "manager" },
      { "_id": "...",                      "name": "Jane Doe",       "email": "jane@example.com",     "role": "user" }
    ]
  }
}
```

### Business Rules

| Scenario | Status | Message |
|---|---|---|
| Non-admin calls endpoint | `403` | `Access denied: Unauthorized role.` |
| Admin changes own role | `400` | `You cannot change your own role. Ask another admin.` |
| User already has that role | `409` | `User already has the role 'manager'` |
| Invalid role value | `422` | Zod validation error |
| User ID not found | `404` | `User not found` |

> **Note:** Role changes take effect on the user's **next login** — their current JWT keeps the old role until it expires or they re-login.

---

## ☁️ Deployment

### Backend → Render

1. Push to GitHub
2. [render.com](https://render.com) → **New Web Service** → connect repo → **Root Directory:** `backend`
3. Set env vars in Render Dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=<your Atlas URI>
   JWT_SECRET=<run: openssl rand -hex 32>
   COOKIE_SECRET=<run: openssl rand -hex 32>
   CLIENT_URL=https://your-app.vercel.app
   ```
4. Click **Deploy** — the admin and manager accounts are already in your Atlas database.
   No need to run the seed again.

### Frontend → Vercel

1. [vercel.com](https://vercel.com) → **New Project** → **Root Directory:** `frontend`
2. Add env variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
   ```

> **Render free tier:** Sleeps after 15 min of inactivity. First request takes ~30s. Upgrade to Starter ($7/mo) to avoid this.

---

## 📈 Scalability

See [SCALABILITY.md](./SCALABILITY.md) for a detailed breakdown:

- Redis distributed caching for task list responses
- Horizontal scaling with Docker + load balancing
- MongoDB indexing strategy
- Rate limiting and API abuse prevention
- Future microservices decomposition

---

<div align="center">

Built for the **Primetrade.ai Internship Assignment** · March 2026

</div>
