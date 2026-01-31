Below is a **submission-ready `README.md`** you can copy-paste directly into your project.
It’s written in a **clear, professional tone** and covers exactly what reviewers expect: setup, persistence layer, and key design decisions—without overexplaining.

---

# Pastebin Lite

Pastebin Lite is a lightweight web application that allows users to create **temporary, shareable text pastes** with optional **time-to-live (TTL)** and **maximum view limits**.
The application focuses on simplicity, security, and clean architecture.

---

## 🚀 Features

* Create text pastes with optional expiration (TTL in seconds)
* Optional maximum view count per paste
* Shareable, short URLs
* Server-side validation for expired or invalid pastes
* Light / Dark theme toggle with persistence
* Clean, modern UI
* Safe rendering of text (prevents script execution)

---

## 🛠 Tech Stack

* **Frontend:** Next.js (Pages Router), React
* **Backend:** Next.js API Routes
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Styling:** Inline styles (custom dark/light theme)
* **ID Generation:** `nanoid`

---

## 📦 Persistence Layer

The application uses **PostgreSQL** as the persistence layer, accessed via **Prisma ORM**.

### Database Model (Paste)

Each paste is stored with the following properties:

* `id` – short, URL-friendly string (generated using `nanoid`)
* `content` – text content of the paste
* `createdAt` – creation timestamp
* `expiresAt` – optional expiration timestamp (derived from TTL)
* `maxViews` – optional maximum allowed views
* `currentViews` – tracks how many times the paste has been viewed

PostgreSQL was chosen for:

* Strong consistency
* Reliability
* Easy integration with Prisma
* Compatibility with hosted providers like Neon / Vercel

---

## ▶️ Running the App Locally

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd pastebin-lite
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Configure environment variables

Create a file named `.env.local` in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
```

> You can use a local PostgreSQL instance or a hosted provider like Neon.

---

### 4. Set up Prisma

Generate the Prisma client:

```bash
npx prisma generate
```

Run the initial migration to create database tables:

```bash
npx prisma migrate dev --name init
```

---

### 5. Start the development server

```bash
npm run dev
```

Open your browser and visit:

```
http://localhost:3000
```

---

## 🧠 Important Design Decisions

### 1. Short, URL-Friendly IDs

Instead of UUIDs, the app uses **short string IDs** generated with `nanoid`.
This makes shareable links cleaner and more user-friendly.

---

### 2. Expiry & View Limits Enforced Server-Side

A paste becomes unavailable when:

* The current time exceeds `expiresAt`, or
* `currentViews` reaches `maxViews`

These rules are enforced **on the server**, ensuring:

* No bypass via client manipulation
* Correct HTTP 404 responses for expired or invalid pastes

---

### 3. Server-Side Rendering for Paste View

The paste view page (`/p/[id]`) uses **server-side fetching** to:

* Immediately return a `404` for expired or missing pastes
* Avoid exposing invalid content to the client

---

### 4. Safe Content Rendering

Paste content is rendered inside a `<pre>` element without using `dangerouslySetInnerHTML`.
This ensures:

* Whitespace is preserved
* No scripts or HTML are executed (prevents XSS)

---

### 5. Theme Management

* Light and Dark themes are implemented manually
* Theme preference is stored in `localStorage`
* Both the create page and view page share the same theme system

This avoids external styling dependencies while keeping the UI consistent.

---

### 6. Prisma Client Management

A singleton Prisma client pattern is used to:

* Prevent excessive database connections during development
* Ensure compatibility with serverless environments

---

## 📄 Project Structure (High Level)

```
pages/
  index.js            → Create paste UI
  p/[id].js           → View paste UI (SSR)
  api/
    pastes/
      index.js        → Create paste API
      [id].js         → Fetch paste API
prisma/
  schema.prisma       → Database schema
lib/
  db.js               → Prisma client singleton
```

---

## ✅ Status

This project is **fully functional**, production-ready for a take-home assignment, and designed with clarity, correctness, and maintainability in mind.
