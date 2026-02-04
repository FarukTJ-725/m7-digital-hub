# M7 Digital Hub - Cloud Deployment Guide

This guide covers deploying your M7 Digital Hub app and Telegram bots to the cloud for 24/7 operation.

## Prerequisites

1. **GitHub Account** - Push your code to a GitHub repository
2. **MongoDB Atlas Account** - Free cloud database at https://cloud.mongodb.com
3. **Render.com Account** - Free web hosting at https://render.com

---

## Step 1: Push Code to GitHub

```bash
cd /Users/FarukTJ/Documents/ANTIGRAVITY/app
git init
git add .
git commit -m "Initial commit - M7 Digital Hub"
git create -m main
# Follow GitHub instructions to push
```

---

## Step 2: Create MongoDB Atlas Database

1. Go to https://cloud.mongodb.com
2. Create free account → Create free cluster
3. Create database user (username/password)
4. **Network Access:** Add IP `0.0.0.0/0` (allows all IPs)
5. **Get connection string:**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/digital_hub?retryWrites=true&w=majority`

---

## Step 3: Deploy Backend + Telegram Bots to Render

### Create Web Service on Render:

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `m7-backend`
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free

### Add Environment Variables:

In Render dashboard, go to **Environment** tab and add:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/digital_hub
TELEGRAM_ADMIN_TOKEN=your_admin_bot_token_here
TELEGRAM_KITCHEN_TOKEN=your_kitchen_bot_token_here
JWT_SECRET=any_random_secret_string
PORT=5001
```

### Click "Create Web Service"

---

## Step 4: Deploy Frontend to Render

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `m7-frontend`
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx serve -s dist -l 3000`
   - **Plan:** Free

### Add Environment Variables:

```
VITE_API_URL=https://m7-backend.onrender.com
```

### Click "Create Web Service"

**Note:** You'll need to update `client/vite.config.ts` to proxy to your backend URL instead of localhost:

```typescript
// client/vite.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://m7-backend.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
```

---

## Step 5: Create Telegram Bots

### Using @BotFather on Telegram:

1. Open Telegram → Search @BotFather
2. Send `/newbot`
3. Follow instructions to create:
   - Name: `M7 Admin Bot`
   - Username: `M7AdminBot`
4. **Copy the HTTP API token**
5. Repeat for Kitchen Bot:
   - Name: `M7 Kitchen Bot`
   - Username: `M7KitchenBot`
6. Add bot tokens to Render backend environment variables

---

## Step 6: Update Telegram Webhook (Production)

For production, bots use webhooks instead of polling. Update your server code to set webhooks:

```javascript
// In server/services/telegram/index.js
const TelegramBot = require("node-telegram-bot-api");

// For webhook mode (production)
const bot = new TelegramBot(token, {
  webHook: {
    port: process.env.PORT || 5001,
    autoOpen: false,
  },
});

// Set webhook
bot.setWebHook(`https://your-backend-url.com/bot${token}`);
```

**Note:** Render's free tier doesn't support persistent webhooks well. For production, consider:

- Upgrade to Render Paid ($25/mo)
- Use Railway with persistent servers
- Use DigitalOcean VPS with PM2

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Render.com                        │
│  ┌─────────────────┐    ┌─────────────────────┐   │
│  │   m7-frontend  │    │      m7-backend      │   │
│  │   (Static)     │────│   (Node.js + Mongo)  │   │
│  │   Port 3000    │    │   Port 5001          │   │
│  └─────────────────┘    └─────────────────────┘   │
│         │                        │                │
│         │                        │                │
│         └───────────┬────────────┘                │
│                     │                             │
└─────────────────────────────────────────────────────┘
                      │
           ┌──────────┴──────────┐
           │                     │
    ┌──────▼──────┐      ┌───────▼───────┐
    │  Telegram   │      │    MongoDB    │
    │  Admin Bot  │      │    Atlas      │
    │  M7Kitchen  │      │   (Cloud)     │
    └─────────────┘      └───────────────┘
```

---

## Estimated Monthly Cost

| Service            | Free Tier       | Paid Tier      |
| ------------------ | --------------- | -------------- |
| Render Web Service | 750 hours/month | $25/month      |
| MongoDB Atlas      | Free            | ~$9/month      |
| **Total**          | **$0**          | **~$34/month** |

---

## Quick Commands for Local Development

```bash
# Start locally with mock data (no MongoDB needed)
cd /Users/FarukTJ/Documents/ANTIGRAVITY/app
./run-app.sh

# Start with real MongoDB
cd server && npm install && npm start
cd client && npm run dev
```

---

## Troubleshooting

### Bot not responding?

- Check Render logs for errors
- Ensure environment variables are set
- Verify MongoDB connection string is correct

### CORS errors?

- Update CORS origin in `server/server.js` to include your frontend URL

### Webhook issues?

- Use polling mode for development
- Webhooks require HTTPS and persistent server
