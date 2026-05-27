# Financial Tracker

A simple web app for tracking monthly income and expenses.

---

## Project proposal (JS-330)

### 1. Context / subject matter

Personal finance: users log **income** and **expenses**, assign **categories** (for example Food, Rent, Travel), and see **monthly summaries** so they can understand where their money goes.

### 2. Problem this project solves

Many people want a lightweight way to record transactions and see totals for a month without spreadsheets or heavy apps. This project gives them a small **React** UI backed by a **REST API** so data is stored reliably and summaries are easy to pull.

### 3. Technical components

| Layer | Stack (planned) |
| --- | --- |
| API | **Node.js** + **Express**, **MongoDB** (native driver or Mongoose) |
| Auth | **JWT** (register / login); **Bearer token** in `Authorization` header; protected routes for user-owned data |
| Front-end | **React** (Vite), simple forms and lists; charts or summary lists for analytics |

**Data models (high level)**

- **User** — credentials / profile fields needed for auth (email, hashed password, etc.).
- **Category** — name, type (income vs expense optional), `userId` (each user owns their categories).
- **Transaction** — amount, date, type (income/expense), description, `userId`, `categoryId` (reference).

**API routes (planned)**

- **Auth:** `POST /auth/register`, `POST /auth/login` (and optionally `GET /auth/me`).
- **Categories CRUD:** `GET/POST /categories`, `GET/PATCH/DELETE /categories/:id`.
- **Transactions CRUD:** `GET/POST /transactions`, `GET/PATCH/DELETE /transactions/:id`.
- **Summary / analytics:** e.g. `GET /reports/monthly?year=…&month=…` — returns totals and breakdown by category (implemented with a **MongoDB aggregation** pipeline).

**External data:** None required for the core app.

**Database**

- **Indexes:** e.g. unique compound index on `(userId, category name)` or single-field indexes on `userId`, `transaction.date`, and `categoryId` for queries and uniqueness where it makes sense.
- **Aggregation:** monthly report route uses `$match`, `$group`, and optionally **`$lookup`** to join category names onto grouped transactions.

### 4. How course requirements will be met

| Requirement | Plan |
| --- | --- |
| Express API | REST API built with Express. |
| Authentication & authorization | JWT after login/register; middleware verifies token; users only access their own categories and transactions. |
| Two CRUD resource sets (excluding auth) | **Categories** and **Transactions** each have full CRUD. |
| Indexes | MongoDB indexes for performance and sensible uniqueness (e.g. per-user constraints). |
| Text search, aggregations, or lookups | **Aggregation** on the monthly report; **`$lookup`** (or embedded denormalization + aggregation) for category breakdown. Optional: **text index** on transaction `description` for search later. |
| Tests & coverage | **Jest** + **Supertest** (or similar) for route and auth tests; aim for **> 80%** coverage on the API. |
| Demo / grading | **Simple React front-end** calling the API during the live presentation; behavior aligned with the course requirements. |

### 5. Timeline and task breakdown

| Target | Focus |
| --- | --- |
| **Week 6** | Proposal submitted; repository layout (API at root, `financial-tracker-fe/`). |
| **Week 7 & 8** | Express + MongoDB; User + JWT auth; Categories and Transactions CRUD with indexes; minimal React app proving end-to-end flow. |
| **Week 9** | Monthly report (aggregation / `$lookup`); summary/analytics UI; API tests above **80%** coverage; README run instructions. |
| **Week 10** | Rehearse & present the **5-minute** demo. |

---

## Project structure

| Path | Purpose |
| --- | --- |
| Root (`index.js`, `server.js`, …) | Express API |
| `models/`, `daos/`, `routes/`, `middleware/` | Backend layers (class pattern) |
| `financial-tracker-fe/` | React (Vite) client |

## Local development

**Prerequisites:** Node 20+, MongoDB running locally (or set `MONGO_URL`).

**API**

```bash
cp .env.example .env
# edit JWT_SECRET in .env
npm install
npm run dev
```

API runs at `http://localhost:3000`.

**Front-end**

```bash
cd financial-tracker-fe
npm install
npm run dev
```

App runs at `http://localhost:5173`. Vite proxies API routes to the backend in dev.

**Try the app:** register or log in → add categories → add transactions → view the **Summary** tab for monthly totals and category breakdown.

**Tests**

```bash
npm test
npm run test:coverage
```

Jest loads `JWT_SECRET` automatically for tests via `jest.setup.js`. Coverage target is **> 80%** on API routes and supporting code.

## Deploy to Railway (optional)

Use **two services** in one Railway project, both connected to the same GitHub repo.

### 1. API service

| Setting | Value |
| --- | --- |
| Root directory | `/` (repo root) |
| Build command | *(leave default — `npm install`)* |
| Start command | `npm start` |

**Variables**

| Variable | Example |
| --- | --- |
| `MONGO_URL` | Atlas URI with DB name, e.g. `mongodb+srv://...@cluster.net/financial-tracker?...` |
| `JWT_SECRET` | Long random string |
| `CLIENT_ORIGIN` | Front-end Railway URL, e.g. `https://your-fe.up.railway.app` |

Railway sets `PORT` automatically. After deploy, verify: `GET https://your-api.up.railway.app/health`.

**Atlas:** allow Railway in Network Access (e.g. `0.0.0.0/0` for a class demo).

### 2. Front-end service

| Setting | Value |
| --- | --- |
| Root directory | `financial-tracker-fe` |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |

**Variables**

| Variable | Example |
| --- | --- |
| `VITE_API_URL` | API Railway URL, e.g. `https://your-api.up.railway.app` |

`VITE_API_URL` is baked in at **build** time — set it before deploying (or redeploy after changing it).

### 3. Deploy order

1. Deploy the **API** and confirm `/health` works.
2. Deploy the **FE** with `VITE_API_URL` pointing at the API.
3. Set **`CLIENT_ORIGIN`** on the API to the FE URL (update and redeploy if the FE URL was unknown at first).
4. Register a user on the live app and confirm data appears in Atlas.

---

## Update Breakdown

Status as of the current codebase.

### Complete

| Area | Status |
| --- | --- |
| **Repository layout** | Express API at repo root; React client in `financial-tracker-fe/`. |
| **Express REST API** | Running with CORS, JSON body parsing, `/health`, and routed resources. |
| **MongoDB / Mongoose** | User, Category, and Transaction models with relationships. |
| **Authentication** | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`; JWT middleware on protected routes; users only access their own data. |
| **Categories CRUD (API)** | Full `GET` / `POST` / `GET :id` / `PATCH :id` / `DELETE :id`. |
| **Transactions CRUD (API)** | Full `GET` / `POST` / `GET :id` / `PATCH :id` / `DELETE :id`. |
| **Indexes** | Unique compound on categories `(userId, name)`; indexes on `userId`, transaction `date`, and `categoryId`. |
| **Aggregation / lookup** | `GET /reports/monthly` uses `$match`, `$lookup` (categories), and `$group` for monthly totals and per-category breakdown. |
| **API tests & coverage** | Jest + Supertest for auth, categories, transactions, and reports; coverage **> 80%** (statements/lines threshold in `package.json`). |
| **React front-end (local)** | Register / log in / log out; Categories tab (add, list, delete); Transactions tab (add, list, delete); Summary tab (month picker, income/expense totals, balance, pie charts by category). |
| **README** | Local dev, test commands, and Railway deploy instructions. |
| **Railway — API** | Backend service already deployed (MongoDB Atlas, `JWT_SECRET`, health check). |

### Remaining

| Area | Status |
| --- | --- |
| **Railway — front-end** | Add the **front-end service** only (see [Deploy to Railway](#deploy-to-railway-optional) §2): root `financial-tracker-fe`, build `npm install && npm run build`, start `npm start`, set `VITE_API_URL` to the live API URL before build. |
| **Railway — CORS** | After the FE URL is known, set **`CLIENT_ORIGIN`** on the API to that URL (redeploy API if it was not set when the FE went live). |
| **Live smoke test** | Register on the deployed app, add categories and transactions, open Summary, confirm data in Atlas. |
| **Week 10 demo** | Presentation |

### Optional (if time permits)

- **Text search** on transaction `description`.
- **Cleanup UI** — Make UI pretty.
