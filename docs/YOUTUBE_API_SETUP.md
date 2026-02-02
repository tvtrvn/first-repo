# YouTube Data API v3 – Setup Guide (Server-Side Next.js)

## Part 1: Google Cloud Console (Click-by-Click)

### 1.1 Create a Google Cloud project

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)** and sign in.
2. Open the **project** dropdown at the top (next to “Google Cloud”).
3. Click **“New Project”**.
4. **Project name:** e.g. `my-youtube-app`.
5. **Organization:** leave default (or pick one).
6. Click **“Create”**. Wait for the project to be created.
7. Use the project dropdown again and **select the new project** so it’s the active one.

### 1.2 Enable YouTube Data API v3

1. In the left sidebar, go to **“APIs & Services”** → **“Library”**  
   (or open: https://console.cloud.google.com/apis/library).
2. In the search box, type **“YouTube Data API v3”**.
3. Click the **“YouTube Data API v3”** card.
4. Click **“Enable”**. Wait until it says the API is enabled.

### 1.3 Create an API key

1. Go to **“APIs & Services”** → **“Credentials”**  
   (or: https://console.cloud.google.com/apis/credentials).
2. Click **“+ Create Credentials”** at the top.
3. Choose **“API key”**.
4. A key is created and a modal appears. **Copy the key** (e.g. `AIzaSy...`).
5. Click **“Close”** (you will restrict it in the next section).

### 1.4 Restrict the API key (server-side only)

1. On the **Credentials** page, find your new key under **“API keys”**.
2. Click the **pencil (Edit)** icon on that key.
3. **Application restrictions**
   - Select **“None”** for local development (so `localhost` can call your Next.js API routes that use the key).
   - For production-only restriction, see Part 2 below.
4. **API restrictions**
   - Select **“Restrict key”**.
   - In the list, **check only:** **“YouTube Data API v3”**.
   - Leave all other APIs unchecked.
5. Click **“Save”**.

---

## Part 2: API Restrictions & Application Restrictions

### Which API restrictions to enable

- **Restrict key:** Yes.
- **APIs allowed:** Only **YouTube Data API v3**. No other APIs.

This limits the key to YouTube Data API only; if the key leaks, it can’t be used for other Google APIs.

### Application restriction for server-side Next.js

Your Next.js app uses the key only in **API routes** (server). The key is never sent to the browser. So:

- **Application restriction** controls *who can use the key* when they call Google’s APIs.
- For server-side use, the key is used from:
  - **Local:** your machine (no fixed IP; often no restriction).
  - **Vercel:** Vercel’s servers (IPs can change; “IP addresses” is possible but brittle).

**Recommended:**

| Environment   | Application restriction | Notes |
|---------------|-------------------------|--------|
| **Local dev** | **None**                | Easiest. Key only in `.env.local`, never in client bundle. |
| **Vercel**    | **None**                | Key in Vercel env vars only; never exposed to browser. |

**Optional (stricter, more setup):**

- **HTTP referrer:** Not suitable — that’s for browser requests; your server calls the API, so referrer is from your backend, not your domain in a useful way for key restriction.
- **IP addresses (Vercel):** You can add Vercel’s outbound IPs, but they can change; you’d need to maintain the list. Only do this if you need IP-level locking and accept maintenance.

**Summary:** Use **“None”** for application restriction, and **“Restrict key”** with only **YouTube Data API v3** for both local and Vercel. Security comes from keeping the key in server env only and not exposing it to the client.

---

## Part 3: Add Key to `.env.local` and Verify

### 3.1 Add the key to `.env.local`

1. In your project root, open or create **`.env.local`** (same folder as `package.json`).
2. Add one line (replace with your real key):

```bash
# YouTube Data API v3 – server only (never expose to browser)
YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

3. Save the file.  
4. Ensure **`.env.local`** is in **`.gitignore`** (Next.js usually adds it). Never commit this file.

### 3.2 Verify with a Next.js API route

You already have an API route that uses the key. Use it to verify:

1. **Start the dev server** (from project root):

```bash
npm run dev
```

2. **Call the API route** (key is used only on the server):
   - Browser: open **http://localhost:3000/api/youtube/test**
   - Or: `curl http://localhost:3000/api/youtube/test`

3. **Success:** JSON with `"success": true` and a `videos` array.  
4. **Failure:**  
   - `YOUTUBE_API_KEY is not configured` → check `.env.local` and restart `npm run dev`.  
   - `403` or API error → check that YouTube Data API v3 is enabled and that the key is restricted only to “YouTube Data API v3” (no typo).

### 3.3 Deploying on Vercel

1. In Vercel: **Project** → **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `YOUTUBE_API_KEY`
   - **Value:** your API key
   - **Environment:** Production (and Preview if you want).
3. Redeploy. Your server-side code will read `process.env.YOUTUBE_API_KEY` on Vercel; the key is still never sent to the browser.

---

## Checklist

- [ ] Google Cloud project created
- [ ] YouTube Data API v3 enabled
- [ ] API key created and copied
- [ ] Key restricted to “YouTube Data API v3” only
- [ ] Application restriction set (None recommended)
- [ ] `.env.local` has `YOUTUBE_API_KEY=...`
- [ ] `http://localhost:3000/api/youtube/test` returns success and videos
- [ ] For Vercel: `YOUTUBE_API_KEY` added in project Environment Variables
