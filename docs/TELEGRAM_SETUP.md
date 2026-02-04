# Telegram Bot Setup Guide for M7 Digital Hub

## Step 1: Create Your Bots

### 1. Message @BotFather on Telegram

Open Telegram and search for @BotFather

### 2. Create Admin Bot

```
/newbot
Name: M7 Admin Bot
Username: m7_admin_bot
```

Copy the **HTTP API Token** shown (e.g., `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

### 3. Create Kitchen Bot

```
/newbot
Name: M7 Kitchen Bot
Username: m7_kitchen_bot
```

Copy the **HTTP API Token**

## Step 2: Get Your Chat ID

### Method 1: Using @userinfobot

1. Open a conversation with your bot (start it first)
2. Message @userinfobot on Telegram
3. Forward a message from your bot/group to @userinfobot
4. It will reply with your Chat ID (a number like `123456789`)

### Method 2: Using the Bot

1. Add the bot to your group or start a conversation
2. Send any message to the bot
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Look for `chat.id` in the response

## Step 3: Configure Environment Variables

Edit `server/.env`:

```env
# Telegram Bot Tokens (from BotFather)
TELEGRAM_ADMIN_BOT_TOKEN=your_admin_bot_token_here
TELEGRAM_KITCHEN_BOT_TOKEN=your_kitchen_bot_token_here

# Your Chat ID (from @userinfobot)
TELEGRAM_ADMIN_CHAT_ID=your_personal_chat_id
TELEGRAM_KITCHEN_CHAT_ID=your_kitchen_group_chat_id
```

## Step 4: Install Dependencies

```bash
cd /Users/FarukTJ/Documents/ANTIGRAVITY/app/server
npm install node-telegram-bot-api
```

## Step 5: Start the Server

```bash
cd /Users/FarukTJ/Documents/ANTIGRAVITY/app/server
node server.js
```

## Bot Commands

### Admin Bot:

- `/menu` - View menu items
- `/orders` - View all orders
- `/payments` - Verify payments
- `/game` - GameHub dashboard
- `/recordmatch` - Record FC26 match
- `/rankings` - View gamer rankings
- `/stats` - Platform statistics

### Kitchen Bot:

- `/orders` - View kitchen orders
- `/ready [order_id]` - Mark as ready
- `/deliver [order_id]` - Mark as out for delivery

## Testing the Bots

1. Start the server
2. Open Telegram
3. Message your Admin Bot `/start`
4. Place an order in the app
5. Watch for the notification in your Telegram!

## Troubleshooting

**Bot not responding?**

- Check that the bot token is correct
- Make sure the bot is not blocked
- Verify the chat ID format (should be a number)

**No notifications?**

- Add the bot to your group
- Make the bot an admin (for group messages)
- Check server logs for errors

**Webhooks not working?**

- Use polling mode (default) for local development
- For production, configure HTTPS webhook URL in `.env`
