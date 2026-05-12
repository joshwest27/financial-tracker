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
| **Week 6** | Proposal submitted; Repository layout (`/server`, `/client`). |
| **Week 7 & 8** | Express + MongoDB; User + JWT auth; Categories and Transactions CRUD with indexes; minimal React app proving end-to-end flow. |
| **Week 9** | Monthly report (aggregation / `$lookup`); summary/analytics UI; API tests above **80%** coverage; README run instructions. |
| **Week 10** | Rehearse & present the **5-minute** demo. |

---

## Repo status

Proposal only for now; implementation begins after the proposal deadline.
