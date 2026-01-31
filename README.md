# Pastebin-Lite

A lightweight Pastebin-like application built with **Next.js**, **Prisma**, and **PostgreSQL**, supporting disposable pastes with **time-based expiration**, **view-count limits**, and **optional password protection**.

This project was built as part of a take-home assignment.

---

## 🚀 Features

* Create a paste and receive a shareable URL
* View pastes via `/p/:id`
* Optional expiration using:

  * Time-to-live (TTL)
  * Maximum number of views
* Paste becomes unavailable when **either constraint is reached**
* Optional **password protection** for private pastes
* Safe rendering of content (no script execution)
* Deterministic time support for testing
* Fully server-side enforced constraints
* Deployed and works on **Vercel**

---

## 🛠 Tech Stack

* **Frontend & Backend**: Next.js (Pages Router)
* **Database**: PostgreSQL (hosted on Neon)
* **ORM**: Prisma
* **Styling**: CSS / inline styles
* **Deployment**: Vercel

---

## 📦 Persistence Layer

This application uses **PostgreSQL** as its persistence layer, hosted on **Neon**, and accessed via **Prisma ORM**.

All paste data (content, expiration time, view limits, and password hashes) is stored in the database.
The application does **not** rely on in-memory storage, ensuring data persists across requests and deployments.

---

## 🔐 Password-Protected Pastes (Additional Feature)

When creating a paste, users may optionally provide a **password**.

* Passwords are **never stored in plain text**
* Passwords are hashed using `bcrypt`
* If a paste is password-protected:

  * Accessing the paste requires submitting the correct password
  * Unauthorized requests receive a `401 Unauthorized` response
* If no password is provided, the paste is publicly accessible

This feature is **optional** and does not affect public pastes.

---

## ▶️ How to Run Locally

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd pastebin-lite
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Start the development server

```bash
npm run dev
```

The app will be available at:

```
http://localhost:3000
```

---

## 🔌 API Endpoints

### Health Check

```
GET /api/healthz
```

Returns `200 OK` if the service is running.

---

### Create a Paste

```
POST /api/pastes
```

**Request body:**

```json
{
  "content": "string",
  "ttl_seconds": 3600,
  "max_views": 5,
  "password": "optional-string"
}
```

**Response:**

```json
{
  "id": "abc123"
}
```

---

### Fetch a Paste

```
GET /api/pastes/:id
```

**Response (public paste):**

```json
{
  "content": "string",
  "remaining_views": 4,
  "expires_at": "2026-01-01T00:00:00.000Z"
}
```

**Response (password-protected paste):**

* Returns `401 Unauthorized` if password is required

To unlock:

```
POST /api/pastes/:id
```

**Request body:**

```json
{
  "password": "your-password"
}
```

---

## 🧪 Deterministic Time for Testing

For automated testing, deterministic time behavior is supported.

If the environment variable below is set:

```env
TEST_MODE=1
```

And the request includes the header:

```
x-test-now-ms: <timestamp-in-ms>
```

The server will use this timestamp as the current time **only for expiration logic**.

This ensures predictable behavior during testing.

---

## 🧠 Design Decisions

* **Short IDs** generated using `nanoid` for clean, URL-friendly links
* **Server-side enforcement** of TTL, view limits, and password checks
* **Prisma ORM** chosen for schema management and type safety
* **PostgreSQL** used for durable persistence
* **bcrypt hashing** for secure password storage
* **Safe rendering** using `<pre>` tags to prevent script execution
* Deterministic time support added to satisfy automated testing requirements

---
