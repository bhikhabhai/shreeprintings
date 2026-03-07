# Shree Printings — Attendance Management System

A modern, admin-only web application for managing employee attendance, shifts, and salary computation. Built with Next.js, Prisma, Tailwind CSS, and shadcn/ui.

---

## ✨ Features

- **Dashboard** — Real-time stats (Present/Absent/Avg Hours) + today's attendance overview
- **Employee Management** — Add, edit, soft-delete employees with shift & hourly rate
- **Daily Attendance** — Date-navigable bulk entry with auto-calculated work hours & status
- **Monthly Reports** — Full salary breakdown (Work Hrs, Extra Hrs, Payable Hrs, Total Pay)
- **Excel Import** — Upload `.xlsx` files to bulk-import employees & attendance history
- **Overnight Shift Support** — Correctly handles shifts crossing midnight (e.g., 22:00 → 06:00)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database | SQLite (dev) / PostgreSQL via Supabase (prod) |
| ORM | Prisma 5 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Icons | Lucide React |

---

## 🚀 Deployment Guide (100% Free)

### Prerequisites

- [Node.js](https://nodejs.org/) v20+ installed
- A [GitHub](https://github.com) account
- A [Supabase](https://supabase.com) account (free tier)
- A [Vercel](https://vercel.com) account (free tier)

---

### Step 1: Set Up the Database (Supabase)

1. Go to [supabase.com](https://supabase.com) and sign up / log in.
2. Click **"New Project"** → Choose a name and set a database password → Click **Create**.
3. Wait for the project to finish provisioning (~2 minutes).
4. Go to **Settings → Database** in the left sidebar.
5. Scroll to **"Connection string"** → Select **URI** tab.
6. Copy the connection string. It will look like:
   ```
   postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
7. **Replace `[YOUR-PASSWORD]`** with the password you set during project creation.

> ⚠️ **Keep this connection string safe** — you'll need it in Steps 2 and 3.

---

### Step 2: Prepare the Code for Production

#### 2a. Switch Prisma from SQLite to PostgreSQL

Open `prisma/schema.prisma` and change the datasource:

```diff
  datasource db {
-   provider = "sqlite"
+   provider = "postgresql"
    url      = env("DATABASE_URL")
  }
```

#### 2b. Update `.env` with Supabase URL

Open `.env` and replace the DATABASE_URL:

```env
DATABASE_URL="postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres"
```

#### 2c. Push the Schema to Supabase

Run these commands in the `shreeprintings` folder:

```bash
npx prisma generate
npx prisma db push
```

You should see: `Your database is now in sync with your Prisma schema.`

---

### Step 3: Deploy to Vercel (Free)

#### 3a. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/shreeprintings.git
git push -u origin main
```

#### 3b. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New → Project"**.
3. Select the **shreeprintings** repository from your GitHub repos.
4. **Add Environment Variables** before deploying:
   - Click **"Environment Variables"**
   - Add: `DATABASE_URL` = your Supabase connection string from Step 1
5. Click **"Deploy"**.
6. Wait ~2 minutes. Your app will be live at `https://shreeprintings.vercel.app` (or similar).

---

### Step 4: Verify the Deployment

1. Open your Vercel URL in a browser.
2. Go to **Employees** → Add a test employee.
3. Go to **Attendance** → Log a time entry.
4. Go to **Reports** → Generate a monthly report.
5. If everything works, you're live! 🎉

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Set up the local SQLite database
npx prisma db push

# Start the dev server
npm run dev
```

App runs at **http://localhost:3000**

---

## 📁 Project Structure

```
shreeprintings/
├── prisma/
│   └── schema.prisma          # Database models
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── employees/     # Employee CRUD endpoints
│   │   │   ├── attendance/    # Attendance bulk upsert
│   │   │   ├── reports/       # Monthly salary computation
│   │   │   └── import/        # Excel file import
│   │   ├── employees/         # Employee management page
│   │   ├── attendance/        # Daily attendance entry page
│   │   ├── reports/           # Monthly salary reports page
│   │   ├── import/            # Excel import page
│   │   ├── layout.tsx         # Root layout with sidebar
│   │   └── page.tsx           # Dashboard
│   ├── components/
│   │   ├── sidebar.tsx        # Navigation sidebar
│   │   └── ui/                # shadcn/ui components
│   └── lib/
│       ├── calculations.ts    # Business logic (hours, salary)
│       ├── prisma.ts          # Prisma client singleton
│       └── utils.ts           # Utility functions
├── .env                       # Database URL (do not commit)
└── package.json
```

---

## 📊 Business Logic

| Rule | Condition |
|------|-----------|
| **Present** | Work hours ≥ 7h |
| **Half Day** | Work hours ≥ 4h |
| **Short Day** | Work hours > 0h |
| **Absent** | No In/Out time |
| **Extra Hours** | `max(0, Work Hours − 12)` |
| **Total Pay** | `(Work Hrs + Extra Hrs) × Hourly Rate` |

---

## 🔄 Importing from Excel

1. Navigate to **Import Data** in the sidebar.
2. Upload an `.xlsx` file with the standard format:
   - Sheet name: `MonthYear` (e.g., `Jan2026`, `Feb2026`)
   - Row 1: `Emp ID | Emp Name | Shift | Hourly Rate | OT Rate | 01-Jan (Thu) | ...`
   - Row 2: Sub-headers per date: `In Time | Out Time | Work Hours | Overtime | Status`
   - Row 3+: Employee data
3. Click **Import Data** — employees and attendance records will be created/updated automatically.
