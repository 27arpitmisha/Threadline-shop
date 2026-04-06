# Threadline — MERN t-shirt storefront

Full-stack demo for an online tee shop: **MongoDB**, **Express**, **React** (Vite), **Node**. Includes auth (JWT), product catalog, cart (guest + logged-in), and checkout that creates orders on the server.

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

## Quick start

### 1. Database and API

```bash
cd server
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, and optionally ADMIN_EMAIL (see Admin below)
npm install
npm run seed   # optional: loads sample products
npm run dev    # API on http://localhost:5001 (5000 is often taken by macOS AirPlay)
```

### 2. Web app

In a second terminal:

```bash
cd client
cp .env.example .env   # optional; default uses Vite proxy to /api
npm install
npm run dev
```

Then open http://localhost:5173. Anything you type after `npm run dev` on the same command is passed through to Vite and can trigger “Unused args” errors.

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5001`, so the client can call the API and load uploaded images without CORS friction.

### 3. Production build (client)

```bash
cd client
npm run build
npm run preview
```

Set `VITE_API_URL` in `client/.env` to your deployed API base (e.g. `https://api.example.com/api`) when not using the dev proxy.

## Deploy step by step (backend first, then frontend)

### Phase 1 — Backend only (Postman)

Use this to get a public API URL before touching the React app. **Postman does not use CORS**, so you can call the API as soon as it is live.

**1. MongoDB Atlas**

1. Create a free [Atlas](https://www.mongodb.com/atlas) cluster.  
2. **Database Access** → add a user (username + password).  
3. **Database** → **Connect** → Drivers → copy the **SRV** connection string and replace `<password>` with your user’s password.  
4. **Network Access** → **Add IP Address** → **`0.0.0.0/0`** (allow from anywhere) so Render can connect.  

**2. Render — Web Service for the API**

1. Sign up at [Render](https://render.com) and connect your Git provider.  
2. **New** → **Blueprint** → select this repo → Render reads [`render.yaml`](render.yaml) (API-only: `rootDir: server`, `npm ci`, `npm start`).  

   *Or* **New** → **Web Service** and set manually:

   | Setting | Value |
   |--------|--------|
   | **Root Directory** | `server` |
   | **Build Command** | `npm ci` |
   | **Start Command** | `npm start` |
   | **Health Check Path** | `/api/health` |

3. **Environment** (same tab) → **Add Environment Variable**:

   | Key | Value |
   |-----|--------|
   | `MONGODB_URI` | Your Atlas SRV URI (must include the password). |
   | `JWT_SECRET` | Long random string (e.g. 32+ chars). |
   | `ADMIN_EMAIL` | *(Optional)* Email that should get admin on register/login. |

   Render sets **`PORT`** automatically — do not override it.

4. Create the service and wait for the first deploy. The URL looks like `https://threadline-api.onrender.com` (name may vary).

**3. Smoke test in Postman**

Use your real host (no trailing slash on the base).

1. **GET** `https://<your-service>.onrender.com/api/health`  
   → Expect JSON `{ "ok": true }`. The first request after idle may take **30–60s** on the free tier (cold start).

2. **POST** `https://<your-service>.onrender.com/api/auth/register`  
   - Headers: `Content-Type: application/json`  
   - Body (raw JSON), for example:  
     `{ "name": "Test", "email": "you@example.com", "password": "your-secure-password" }`  
   → Expect `201` and a `token` in the response.

3. **GET** `https://<your-service>.onrender.com/api/products`  
   → Expect a JSON array (empty until you seed).

**4. Seed sample products (optional)**

Render dashboard → your service → **Shell**:

```bash
node src/seed.js
```

If the shell opens at the repo root instead, run: `cd server && node src/seed.js`.

---

### Phase 2 — Frontend (after the API works)

Host the Vite app on **Vercel**, **Netlify**, or **Cloudflare Pages** (all have free tiers). Example for **Vercel**:

1. **New Project** → import this repo.  
2. **Root Directory**: `client`  
3. **Framework Preset**: Vite (or leave auto-detect).  
4. **Build Command**: `npm run build`  
5. **Output Directory**: `dist`  
6. **Environment Variables** (production):

   | Key | Value |
   |-----|--------|
   | `VITE_API_URL` | `https://<your-service>.onrender.com/api` |

7. Deploy. Copy your production URL (e.g. `https://threadline.vercel.app`).

**8. CORS on the API**

In Render → your API service → **Environment** → add or update:

| Key | Value |
|-----|--------|
| `CLIENT_ORIGIN` | Your frontend origin only, e.g. `https://threadline.vercel.app` (no path). For Vercel preview URLs too, use commas: `https://threadline.vercel.app,https://threadline-git-main-xxx.vercel.app` |

Save → Render will redeploy. The browser will then be allowed to call your API with cookies/JSON from that origin.

---

### Optional: one URL (API + built SPA on the same Render service)

From the **repo root** locally or in CI: `npm run build` then run the server with `NODE_ENV=production` so Express serves `client/dist`. On Render you would use an empty **Root Directory**, `buildCommand: npm run build`, `startCommand: npm start`, and set `NODE_ENV=production`. This is optional if you already use Phase 2 split hosting.

**Free tier caveats:** services may **sleep** when idle. **`uploads/` on the API** is **ephemeral** on Render — prefer external image URLs or object storage for anything important.

## Features

- **Home** — hero, featured products, trust strip  
- **Shop** — filters, search, product grid  
- **Product** — size/color, quantity, add to cart  
- **Cart** — line items, qty updates, remove, order summary (free shipping over ₹5,999)  
- **Auth** — register, login, JWT stored in `localStorage`, guest cart merges on login  
- **Checkout** — shipping form; demo “place order” creates an order, clears cart, adjusts stock (no real payment)  
- **Admin** — `/admin` UI to create, edit, delete products; image upload (stored under `server/uploads/`) or external image URL

### Admin access

1. Set `ADMIN_EMAIL` in `server/.env` to the email you will use (e.g. `you@company.com`).
2. Register a new account with that email, or log in with an existing account that uses it — the server assigns `role: "admin"` on register or on login.
3. Open http://localhost:5173/admin — use **Admin** in the nav when logged in.

## API overview

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/auth/register` | `{ name, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |
| GET | `/api/auth/me` | Bearer token |
| GET | `/api/products` | `?category=&search=&featured=true` |
| GET | `/api/products/:slug` | Single product |
| GET/POST/PATCH/DELETE | `/api/cart` … | Bearer token required |
| POST | `/api/orders/checkout` | Bearer token, `{ shippingAddress }` |
| GET | `/api/admin/products` | Admin Bearer token |
| POST | `/api/admin/products` | Admin, `multipart/form-data` (fields + optional `image` file or `imageUrl`) |
| PATCH | `/api/admin/products/:id` | Admin, multipart (same fields; image optional) |
| DELETE | `/api/admin/products/:id` | Admin Bearer token |

## Project layout

- `server/` — Express app, Mongoose models, routes  
- `client/` — React SPA, Tailwind CSS v4, React Router
