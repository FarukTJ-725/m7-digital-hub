# Alternative Free Hosting Options

Render requires payment info on file even for free tier. Here are alternatives:

---

## Option 1: Railway.app (No Payment Required for Limited)

**Pros:**

- No credit card required for free tier
- Easy GitHub integration
- Automatic deployments

**Steps:**

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your `m7-digital-hub` repo
5. Configure:
   - **Root Directory:** `server`
   - **Start Command:** `node server.js`
6. Add environment variables in Railway dashboard:
   - `MONGODB_URI` (from MongoDB Atlas)
   - `TELEGRAM_ADMIN_TOKEN`
   - `TELEGRAM_KITCHEN_TOKEN`
   - `JWT_SECRET`

**Frontend Deployment:**

1. In Railway, click **"New Project"**
2. Select repo
3. Configure:
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx serve -s dist -l 3000`
4. Add environment variable:
   - `VITE_API_URL` = your backend URL (e.g., `https://m7-backend-production.up.railway.app`)

---

## Option 2: Cyclic.sh (Full-Stack Free)

**Pros:**

- Full-stack deployments (frontend + backend in one)
- No credit card required

**Steps:**

1. Go to https://cyclic.sh
2. Sign up with GitHub
3. Click **"Connect Repository"**
4. Select your `m7-digital-hub` repo
5. Configure:
   - **Root Directory:** leave empty (deploys entire repo)
   - **Build Command:** `cd client && npm install && npm run build`
   - **Start Command:** `cd server && npm install && node server.js`
6. Add environment variables:
   - `MONGODB_URI`
   - `TELEGRAM_ADMIN_TOKEN`
   - `TELEGRAM_KITCHEN_TOKEN`
   - `JWT_SECRET`

**Note:** You may need to create a `cyclic.sh` configuration file.

---

## Option 3: Vercel + Railway (Separate Deployments)

**Frontend on Vercel (Free):**

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click **"Add New..."** → **"Project"**
4. Select your repo
5. Configure:
   - **Root Directory:** `client`
   - **Framework Preset:** `Vite`
6. Add environment variable:
   - `VITE_API_URL` = your backend URL

**Backend on Railway (Free):**

1. Go to https://railway.app
2. Deploy `server` directory as shown above

---

## Option 4: Fly.io (Free Tier)

**Pros:**

- Good for persistent apps
- Free tier includes 3 shared VMs

**Steps:**

1. Go to https://fly.io
2. Install Fly CLI: `brew install flyctl`
3. Sign up: `fly auth signup`
4. Create app: `fly launch`
5. Configure `fly.toml` for your app

---

## Recommended: Railway + MongoDB Atlas

| Service  | Platform      | Cost |
| -------- | ------------- | ---- |
| Backend  | Railway       | Free |
| Frontend | Vercel        | Free |
| Database | MongoDB Atlas | Free |

**Total: $0/month**

---

## MongoDB Atlas Setup (Required for All Options)

1. Go to https://cloud.mongodb.com
2. Create free account
3. Create free cluster (select AWS, closest region)
4. Create database user:
   - Username: `admin`
   - Password: Generate strong password
5. **Network Access:**
   - Click **"Network Access"** → **"Add IP Address"**
   - Add: `0.0.0.0/0` (allows all IPs)
6. **Get Connection String:**
   - Click **"Connect"** → **"Connect your application"**
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Example: `mongodb+srv://admin:mypassword@cluster.mongodb.net/digital_hub?retryWrites=true&w=majority`

---

## Quick Start with Railway (Recommended)

```bash
# Install Railway CLI
brew install railwaycli/railway/railway

# Login
railway login

# Initialize project
railway init

# Deploy backend
cd server
railway up

# Set environment variables
railway variables set MONGODB_URI="your_connection_string"
railway variables set TELEGRAM_ADMIN_TOKEN="your_bot_token"
railway variables set TELEGRAM_KITCHEN_TOKEN="your_kitchen_bot_token"
railway variables set JWT_SECRET="your_secret"
```
