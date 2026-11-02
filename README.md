# Rizq (Next.js) — debt payoff planner

Next.js (App Router) + Firebase Auth + Firestore. Simple **username + password** login (no Google, no email).
Local-first: works offline from `localStorage`, and syncs your plan, ticks, settings and spending across devices.
Free to run: Firebase Spark plan + Vercel Hobby.

```
app/        layout, page, global CSS (Next.js)
lib/        rizq-app.js (app logic) · cloud.ts (Firebase) · seed.json (starting data)
public/     logo, icons, PWA manifest
firestore.rules   security rules (each user can only read/write their own document)
```

## 1. Firebase (project `rizq-dcc33`)
1. Console → **Firestore Database** (already created) → **Rules** → paste `firestore.rules` → **Publish**.
2. **Authentication → Sign-in method → Email/Password → Enable** (leave “Email link” off). Google is no longer needed.
3. **Project settings → General → Your apps → Web (`</>`)** → register `rizq-web` → copy the SDK config.

> **Never put the Admin SDK / service-account `.json` key in this project, on GitHub or in Vercel.** The website doesn't use it.
> If it was shared anywhere, delete it: Project settings → Service accounts → Manage service account permissions → Keys.

## 2. Run locally
```bash
npm install
cp .env.example .env.local     # then fill apiKey, appId, messagingSenderId
npm run dev                    # http://localhost:3000
```
`localhost` is an authorized sign-in domain by default.

## 3. Deploy to Vercel
```bash
git init && git add . && git commit -m "Rizq (Next.js)"
git branch -M main
git remote add origin https://github.com/<you>/rizq.git && git push -u origin main
```
Vercel → **Add New → Project → Import** the repo (Next.js is auto-detected) →
**Environment Variables**: add `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_APP_ID`,
`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` → **Deploy**.
(Or: `npx vercel --prod`.)

Then Firebase → **Authentication → Settings → Authorized domains → Add** your `*.vercel.app` domain.
Open the site → **Sign up** with a username + password → you're in. Use **Log in** on your other devices.

## How username login works
Firebase Auth needs an email-shaped id, so `shalique` is stored as `shalique@users.rizq.app` (a placeholder, no real mailbox).
That means **there is no password-reset email** — keep your password safe. Usernames: 3–20 letters, numbers, `.` or `_`; password 6+ characters.

## One-time data upload (your personal starting data)
`lib/seed.json` holds your current plan. It is only used by `npm run dev` (never in the production build).
1. `npm run dev` → open http://localhost:3000 → **Sign up** → your data uploads to Firestore automatically (or Debts → **Upload data now**).
2. After it's uploaded, blank the file before pushing to GitHub: `echo '{}' > lib/seed.json`. Other devices just log in and pull the data.

## Notes
- Optional: once your own account exists, you can stop others signing up (Firebase console → Authentication → Settings → User actions → disable "Enable create (sign-up)" if available), or keep the GitHub repo private.
- `NEXT_PUBLIC_*` values are public identifiers, not secrets; protection comes from the Firestore rules + login.
- Install on phone: iPhone Safari → Share → Add to Home Screen · Android Chrome → ⋮ → Install app.
- Free limits (Firestore Spark): 1 GiB, 50K reads / 20K writes per day. Your data is one small document.
# rizq
