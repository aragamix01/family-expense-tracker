# Go Live Guide

---

## Step 1: Supabase (Database)

### Create the project
1. Go to https://supabase.com → Sign up free
2. Click **New Project**
3. Fill in:
   - Name: `family-expense-tracker`
   - Database password: save this somewhere safe
   - Region: **Southeast Asia (Singapore)**
4. Wait ~2 min for it to provision

### Run the schema
1. Left sidebar → **SQL Editor** → **New query**
2. Copy everything from `supabase/schema.sql`
3. Paste into the editor → click **Run**
4. You should see: `Success. No rows returned`

### Copy your keys
1. Left sidebar → **Project Settings** → **API**
2. Save these 3 values:

| Key | Env Variable |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon / public key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role / secret key | `SUPABASE_SERVICE_ROLE_KEY` |

---

## Step 2: LINE Developers Console

### Create a LINE Login channel
1. Go to https://developers.line.biz → Log in with her LINE account
2. **Create a Provider** (e.g. `Family Tracker`)
3. Inside the provider → **Create a new channel** → choose **LINE Login**
4. Fill in:
   - Channel name: `Family Tracker`
   - App type: **Web app**
5. Click Create

### Add a LIFF app
1. Inside the channel → **LIFF** tab → **Add**
2. Fill in:
   - LIFF app name: `Family Tracker`
   - Size: **Full**
   - Endpoint URL: your Vercel URL (get from Step 3, update this after)
   - Scope: check **profile** and **openid**
   - Bot link feature: **Off**
3. Click Add → copy the **LIFF ID** → this is `NEXT_PUBLIC_LIFF_ID`

### Get her LINE User ID
**Option A (easiest) — do after first deploy:**
1. Temporarily add `console.log("LINE User ID:", p.userId)` in `src/contexts/LiffContext.tsx` after `setProfile(lineProfile)`
2. Push → Vercel redeploys
3. She opens the LIFF URL inside LINE
4. Check Vercel Function Logs → copy her userId
5. Set it as `NEXT_PUBLIC_ADMIN_LINE_USER_ID` in Vercel env vars
6. Remove the `console.log` → push again

---

## Step 3: Vercel (Deploy)

### Import the repo
1. Go to https://vercel.com → Sign up with GitHub
2. Click **Add New Project** → import `aragamix01/family-expense-tracker`
3. Framework: **Next.js** (auto-detected)
4. Add all 5 environment variables before deploying:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_LIFF_ID` | Step 2 |
| `NEXT_PUBLIC_ADMIN_LINE_USER_ID` | Step 2 (get after first deploy) |
| `NEXT_PUBLIC_SUPABASE_URL` | Step 1 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Step 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | Step 1 |

5. Click **Deploy** → wait ~1 min
6. Copy your Vercel URL (e.g. `https://family-expense-tracker.vercel.app`)

### Update LIFF endpoint
1. Back in LINE Developers Console → your LIFF app
2. Update **Endpoint URL** to your actual Vercel URL
3. Save

### Share the link
- LIFF URL format: `https://liff.line.me/YOUR_LIFF_ID`
- She sends this to the family LINE group
- Family taps it → opens inside LINE → register screen → picks their name → done

---

## After Setup

- Every push to `main` triggers an auto-redeploy on Vercel — no manual steps needed
- She is the only admin (her LINE User ID is hardcoded in `NEXT_PUBLIC_ADMIN_LINE_USER_ID`)
- Family members register themselves by opening the LIFF link and picking their name
