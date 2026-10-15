# 🚀 JobPilot AI — Production Cloud Deployment Guide

This guide walks you through deploying **JobPilot AI** to production using **Vercel** (hosting & serverless functions) and **Supabase** (PostgreSQL with Row-Level Security), while taking full advantage of the **Google Gemini API free tier** and **Vercel Cron**.

---

## 📋 Overview of Zero-Mandatory-Cost Architecture

| Component | Provider | Tier | Role |
|---|---|---|---|
| **Frontend & API Routes** | [Vercel](https://vercel.com) | Hobby (Free) | Next.js 14 App Router, Edge Middleware, Serverless API |
| **Relational Database** | [Supabase](https://supabase.com) | Free Tier | PostgreSQL 15, Row-Level Security (RLS), Auto REST |
| **Automated Scheduler** | Vercel Cron | Free Tier | Runs `/api/cron/job-search` daily at 09:00 UTC |
| **AI Reasoning Engine** | Google AI Studio | Free Tier | Gemini 1.5/2.0 Flash (15 RPM free quota) with offline fallback |
| **Document Exporting** | Client / Serverless | Open Source | Selectable text ATS PDFs (`jspdf`) & DOCX (`docx`) |

---

## 🛠️ Step 1: Set Up Supabase Database

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open [`src/lib/db/schema.sql`](src/lib/db/schema.sql) in this repository, copy all contents, and execute them in the SQL Editor.
   * This creates all tables (`users`, `master_resumes`, `candidate_experiences`, `jobs`, `applications`, `tailored_resumes`, `scheduled_searches`, etc.).
   * Enables Row-Level Security (RLS) policies ensuring users can only view and modify their own records.
4. Obtain your API credentials:
   * Go to **Project Settings** > **API**.
   * Copy the **Project URL** (`https://xyzcompany.supabase.co`).
   * Copy the **anon / public key** (`eyJhbGciOi...`).

---

## 🤖 Step 2: Obtain Google Gemini API Key (Free)

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **Create API Key**.
4. Copy your key (`AIzaSy...`).
   * Note: The platform includes a 100% offline rule-based deterministic fallback. If no key is provided, the platform functions seamlessly without errors.

---

## 🚢 Step 3: Deploy to Vercel

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: complete JobPilot AI platform"
   git branch -M main
   git remote add origin https://github.com/<your-username>/jobpilot-ai.git
   git push -u origin main
   ```
2. Log into [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your `jobpilot-ai` repository.
4. Under **Environment Variables**, add the following:
   * `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
   * `GEMINI_API_KEY`: Your Google AI Studio API Key.
   * `CRON_SECRET`: Any random 32-character secret string (e.g. `openssl rand -hex 16`).
5. Click **Deploy**.

---

## ⏰ Step 4: Verify Automated Daily Searches (Vercel Cron)

The repository includes a pre-configured [`vercel.json`](vercel.json):
```json
{
  "framework": "nextjs",
  "crons": [
    {
      "path": "/api/cron/job-search",
      "schedule": "0 9 * * *"
    }
  ]
}
```
* Vercel will automatically trigger `/api/cron/job-search` daily at 09:00 UTC.
* The endpoint discovers new openings from public Greenhouse & Lever boards, scores them against candidate profiles, and generates notifications for roles exceeding the candidate's minimum match threshold.

---

## 🧪 Step 5: Verify Deployment & Health Check

* Test the public landing page: `https://<your-deployment>.vercel.app`
* Test the API health endpoint: `https://<your-deployment>.vercel.app/api/db/test-connection`
* Test the Cron endpoint:
  ```bash
  curl -X POST https://<your-deployment>.vercel.app/api/cron/job-search \
    -H "Authorization: Bearer <your-CRON_SECRET>"
  ```
