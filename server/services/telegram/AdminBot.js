const BotService = require('./BotService');
const Order = require('../../models/Order');
const Payment = require('../../models/Payment');
const MenuItem = require('../../models/MenuItem');
const User = require('../../models/User');
const GamerProfile = require('../../models/GamerProfile');
const MatchResult = require('../../models/MatchResult');

class AdminBot extends BotService {
    constructor(token, adminChatId, useWebhook = false) {
        super(token, adminChatId, useWebhook);
        this.setupCommands();
    }

    setupCommands() {
        // Menu commands
        this.bot.onText(/\/menu/, (msg) => this.showMenu(msg));
        this.bot.onText(/\/addmenu (.+)/, (msg, match) => this.addMenuItem(msg, match[1]));
        this.bot.onText(/\/editmenu (.+)/, (msg, match) => this.editMenuItem(msg, match[1]));
        this.bot.onText(/\/deletemenu (.+)/, (msg, match) => this.deleteMenuItem(msg, match[1]));

        // Order commands
        this.bot.onText(/\/orders/, (msg) => this.showOrders(msg));
        this.bot.onText(/\/order (.+)/, (msg, match) => this.showOrderDetails(msg, match[1]));
        this.bot.onText(/\/pending/, (msg) => this.showPendingOrders(msg));

        // Payment commands
        this.bot.onText(/\/payments/, (msg) => this.showPendingPayments(msg));

        // User commands
        this.bot.onText(/\/users/, (msg) => this.showUsers(msg));
        this.bot.onText(/\/user (.+)/, (msg, match) => this.showUserDetails(msg, match[1]));

        // GameHub commands
        this.bot.onText(/\/game/, (msg) => this.showGameHub(msg));
        this.bot.onText(/\/recordmatch/, (msg) => this.startRecordMatch(msg));
        this.bot.onText(/\/matchresult (.+)/, (msg, match) => this.recordMatch(msg, match[1]));
        this.bot.onText(/\/rankings/, (msg) => this.showRankings(msg));
        this.bot.onText(/\/gamer (.+)/, (msg, match) => this.showGamerProfile(msg, match[1]));

        // Stats commands
        this.bot.onText(/\/stats/, (msg) => this.showStats(msg));
        this.bot.onText(/\/start/, (msg) => this.start(msg));

        // Callback queries
        this.bot.on('callback_query', (query) => this.handleCallback(query));
    }

    start(msg) {
        this.sendMessage(msg.chat.id, `
<b>👋 Welcome to M7 Digital Hub Admin Bot!</b>

Available commands:
🍔 <b>Menu:</b> /menu, /addmenu, /editmenu, /deletemenu
📦 <b>Orders:</b> /orders, /order [id], /pending
💰 <b>Payments:</b> /payments
👥 <b>Users:</b> /users, /user [id]
🎮 <b>GameHub:</b> /game, /recordmatch, /rankings, /gamer [id]
📊 <b>Stats:</b> /stats
        `);
    }

    // Menu Commands
    async showMenu(msg) {
        const items = await MenuItem.find().sort({ category: 1, name: 1 });
        
        if (items.length === 0) {
            return this.sendMessage(msg.chat.id, '📋 No menu items yet. Use /addmenu to add items.');
        }

        const menuText = items.map(item => 
            `${item.name} - ₦${item.price} (${item.category})`
        ).join('\n');

        this.sendMessage(msg.chat.id, `<b>📋 Menu Items</b>\n\n${menuText}`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔄 Refresh', callback_data: 'menu_refresh' }]
                ]
            }
        });
    }

    async addMenuItem(msg, itemData) {
        try {
            // Format: /addmenu Name Price Category
            const parts = itemData.split(' ');
            const name = parts[0];
            const price = parseInt(parts[1]);
            const category = parts.slice(2).join(' ');

            if (!name || isNaN(price) || !category) {
                return this.sendMessage(msg.chat.id, 
                    'Invalid format. Use: /addmenu Name Price Category\nExample: /addmenu Burger 1500 Food');
            }

            const item = new MenuItem({ name, price, category });
            await item.save();

            this.sendMessage(msg.chat.id, `✅ Added "${name}" - ₦${price} (${category})`);
        } catch (error) {
            this.sendMessage(msg.chat.id, 'Error adding menu item: ' + error.message);
        }
    }

    // Order Commands
    async showOrders(msg) {
        const orders = await Order.find()
            .populate('userId', 'username')
            .sort({ orderDate: -1 })
            .limit(20);

        if (orders.length === 0) {
            return this.sendMessage(msg.chat.id, '📦 No orders found.');
        }

        const ordersText = orders.map(order => {
            const statusEmoji = {
                pending: '⏳',
                confirmed: '✅',
                preparing: '👨‍🍳',
                ready: '🍽️',
                delivered: '🎉',
                cancelled: '❌'
            };
            return `${statusEmoji[order.status]} #${order.orderIdDisplay || order._id.toString().slice(-6)} - ₦${order.totalAmount}`;
        }).join('\n');

        this.sendMessage(msg.chat.id, `<b>📦 Recent Orders</b>\n\n${ordersText}`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔄 Refresh', callback_data: 'orders_refresh' }],
                    [{ text: '⏳ Pending', callback_data: 'orders_pending' }]
                ]
            }
        });
    }

    async showPendingOrders(msg) {
        const orders = await Order.find({ status: 'pending' })
            .populate('userId', 'username')
            .sort({ orderDate: 1 });

        if (orders.length === 0) {
            return this.sendMessage(msg.chat.id, '✅ No pending orders.');
        }

        const ordersText = orders.map((order, index) => {
            const itemsList = order.items.slice(0, 3).map(item => 
                `${item.name} x${item.qty}`
            ).join(', ');
            
            return `${index + 1}. #${order.orderIdDisplay || order._id.toString().slice(-6)} - ${order.userId?.username || 'Guest'}\n   ${itemsList} - ₦${order.totalAmount}`;
        }).join('\n\n');

        this.sendMessage(msg.chat.id, `<b>⏳ Pending Orders (${orders.length})</b>\n\n${ordersText}`, {
            reply_markup: {
                inline_keyboard: orders.map(order => [
                    { 
                        text: `✅ #${order.orderIdDisplay || order._id.toString().slice(-6)}`, 
                        callback_data: `accept_order_${order._id}` 
                    }
                ])
            }
        });
    }

    async showPendingPayments(msg) {
        const orders = await Order.find({ paymentStatus: 'pending_verification' })
            .populate('userId', 'username')
            .sort({ orderDate: -1 });

        if (orders.length === 0) {
            return this.sendMessage(msg.chat.id, '✅ No pending payments.');
        }

        const paymentsText = orders.map(order => `
<b>Order:</b> ${order.orderIdDisplay}
<b>Customer:</b> ${order.userId?.username || 'Guest'}
<b>Amount:</b> ₦${order.totalAmount}
<b>Items:</b> ${order.items.length}
        `).join('\n');

        this.sendMessage(msg.chat.id, `<b>💰 Pending Payments (${orders.length})</b>\n${paymentsText}`, {
            reply_markup: {
                inline_keyboard: orders.map(order => [
                    [
                        { text: `✅ Verify #${order.orderIdDisplay}`, callback_data: `verify_${order._id}` },
                        { text: `❌ Reject #${order.orderIdDisplay}`, callback_data: `reject_payment_${order._id}` }
                    ]
                ])
            }
        });
    }

    // GameHub Commands
    async showGameHub(msg) {
        const recentMatches = await MatchResult.find().sort({ matchDate: -1 }).limit(5);
        const topGamers = await GamerProfile.find().sort({ 'stats.winRate': -1 }).limit(5);

        const matchesText = recentMatches.length > 0 
            ? recentMatches.map(m => `${m.player1Username} ${m.player1Score}-${m.player2Score} ${m.player2Username}`).join('\n')
            : 'No matches yet';

        const gamersText = topGamers.length > 0
            ? topGamers.map((g, i) => `${i+1}. ${g.gamerUsername} - ${g.stats.winRate}% WR`).join('\n')
            : 'No gamers yet';

        this.sendMessage(msg.chat.id, `
<b>🎮 GameHub Dashboard</b>

<b>🏆 Top Gamer Rankings</b>
${gamersText}

<b>🕐 Recent Matches</b>
${matchesText}

Use /recordmatch to record a new match
Use /rankings to see all rankings
        `, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🎮 Record Match', callback_data: 'game_record' }],
                    [{ text: '🏆 Rankings', callback_data: 'game_rankings' }]
                ]
            }
        });
    }

    async startRecordMatch(msg) {
        this.sendMessage(msg.chat.id, `
<b>🎮 Record New Match</b>

Please provide match details:
/matchresult [player1] [player2] [team1] [team2] [score]

<b>Example:</b>
/matchresult john_doe jane_smith real_madrid barcelona 3-2

<b>Teams:</b>
Real Madrid, Barcelona, Man City, Liverpool, Bayern, PSG, Juventus, Inter, Chelsea, Man Utd, Arsenal, Tottenham
        `);
    }

    async recordMatch(msg, matchData) {
        try {
            const parts = matchData.split(' ');
            if (parts.length < 5) {
                return this.sendMessage(msg.chat.id, 'Invalid format. Use:\n/matchresult player1 player2 team1 team2 score');
            }

            const player1 = parts[0];
            const player2 = parts[1];
            const team1 = parts[2].replace(/_/g, ' ');
            const team2 = parts[3].replace(/_/g, ' ');
            const scoreParts = parts[4].split('-');
            
            if (scoreParts.length !== 2) {
                return this.sendMessage(msg.chat.id, 'Invalid score format. Use: 3-2');
            }

            const player1Score = parseInt(scoreParts[0]);
            const player2Score = parseInt(scoreParts[1]);

            // Get gamer profiles
            const profile1 = await GamerProfile.findOne({ gamerUsername: player1 });
            const profile2 = await GamerProfile.findOne({ gamerUsername: player2 });

            if (!profile1 || !profile2) {
                return this.sendMessage(msg.chat.id, `Player not found: ${!profile1 ? player1 : player2}`);
            }

            // Create match record
            const match = new MatchResult({
                player1Id: profile1._id,
                player2Id: profile2._id,
                player1Username: profile1.gamerUsername,
                player2Username: profile2.gamerUsername,
                player1Team: team1,
                player2Team: team2,
                player1Score,
                player2Score,
                gameVersion: 'FC26'
            });

            await match.save();

            // Update stats
            await this.updatePlayerStats(profile1._id, match);
            await this.updatePlayerStats(profile2._id, match);

            const winner = player1Score > player2Score 
                ? profile1.gamerUsername 
                : player2Score > player1Score 
                    ? profile2.gamerUsername 
                    : 'Draw';

            this.sendMessage(msg.chat.id, `
<b>✅ Match Recorded!</b>

⚽ ${profile1.gamerUsername} (${team1}) ${player1Score} - ${player2Score} (${team2}) ${profile2.gamerUsername}

🏆 Winner: ${winner}
            `);

        } catch (error) {
            this.sendMessage(msg.chat.id, 'Error recording match: ' + error.message);
        }
    }

    async updatePlayerStats(profileId, match) {
        const profile = await GamerProfile.findById(profileId);
        if (!profile) return;

        profile.stats.matchesPlayed += 1;
        
        if (match.winnerId) {
            if (match.winnerId.toString() === profileId.toString()) {
                profile.stats.wins += 1;
                profile.stats.currentStreak += 1;
                if (profile.stats.currentStreak > profile.stats.longestStreak) {
                    profile.stats.longestStreak = profile.stats.currentStreak;
                }
            } else {
                profile.stats.losses += 1;
                profile.stats.currentStreak = 0;
            }
        } else {
            profile.stats.draws += 1;
            profile.stats.currentStreak = 0;
        }
        
        if (profileId.toString() === match.player1Id.toString()) {
            profile.stats.goalsScored += match.player1Score;
            profile.stats.goalsConceded += match.player2Score;
        } else {
            profile.stats.goalsScored += match.player2Score;
            profile.stats.goalsConceded += match.player1Score;
        }
        
        await profile.save();
    }

    async showRankings(msg) {
        const rankings = await GamerProfile.find()
            .sort({ 'stats.winRate': -1, 'stats.goalsScored': -1 })
            .limit(20);

        if (rankings.length === 0) {
            return this.sendMessage(msg.chat.id, '🏆 No gamers ranked yet.');
        }

        const rankingsText = rankings.map((g, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
            return `${medal} ${g.gamerUsername} | ${g.stats.wins}W ${g.stats.losses}L | ${g.stats.winRate}% WR | ${g.stats.goalsScored} goals`;
        }).join('\n');

        this.sendMessage(msg.chat.id, `<b>🏆 Gamer Rankings</b>\n\n${rankingsText}`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔄 Refresh', callback_data: 'rankings_refresh' }]
                ]
            }
        });
    }

    async showGamerProfile(msg, identifier) {
        const profile = await GamerProfile.findOne({
            $or: [
                { _id: identifier },
                { gamerUsername: identifier }
            ]
        });

        if (!profile) {
            return this.sendMessage(msg.chat.id, 'Gamer profile not found.');
        }

        this.sendMessage(msg.chat.id, `
<b>👤 ${profile.gamerUsername}</b>

🏟️ Team: ${profile.favoriteTeam}
📊 Win Rate: ${profile.stats.winRate}%
🏆 Wins: ${profile.stats.wins} | Losses: ${profile.stats.losses}
⚽ Goals: ${profile.stats.goalsScored}
🔥 Current Streak: ${profile.stats.currentStreak}
🏅 Longest Streak: ${profile.stats.longestStreak}
        `);
    }

    async showStats(msg) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = {
            totalOrders: await Order.countDocuments(),
            pendingOrders: await Order.countDocuments({ status: 'pending' }),
            todayOrders: await Order.countDocuments({ orderDate: { $gte: today } }),
            totalUsers: await User.countDocuments(),
            totalGamers: await GamerProfile.countDocuments(),
            totalMatches: await MatchResult.countDocuments()
        };

        this.sendMessage(msg.chat.id, `
<b>📊 Platform Statistics</b>

📦 Orders:
   Total: ${stats.totalOrders}
   Pending: ${stats.pendingOrders}
   Today: ${stats.todayOrders}

👥 Users: ${stats.totalUsers}
🎮 Gamers: ${stats.totalGamers}
⚽ Matches: ${stats.totalMatches}
        `);
    }

    // Callback query handler
    async handleCallback(query) {
        const [action, type, id] = query.data.split('_');

        switch (action) {
            case 'accept':
                await this.acceptOrder(id, query);
                break;
            case 'verify':
                await this.verifyPayment(id, query);
                break;
            case 'reject':
                if (type === 'payment') {
                    await this.rejectPayment(id, query);
                } else {
                    await this.rejectOrder(id, query);
                }
                break;
            case 'menu':
                await this.showMenu(query.message);
                break;
            case 'orders':
                if (type === 'refresh' || type === 'pending') {
                    await this.showPendingOrders(query.message);
                } else {
                    await this.showOrders(query.message);
                }
                break;
            case 'rankings':
                await this.showRankings(query.message);
                break;
            case 'game':
                await this.showGameHub(query.message);
                break;
        }

        this.bot.answerCallbackQuery(query.id);
    }

    async acceptOrder(orderId, query) {
        try {
            const order = await Order.findById(orderId);
            if (order) {
                order.status = 'confirmed';
                await order.save();
                this.sendMessage(query.message.chat.id, `✅ Order ${order.orderIdDisplay} accepted!`);
                
                // Send to kitchen
                await this.sendOrderNotification(order);
            }
        } catch (error) {
            this.sendMessage(query.message.chat.id, 'Error: ' + error.message);
        }
    }

    async rejectOrder(orderId, query) {
        try {
            const order = await Order.findById(orderId);
            if (order) {
                order.status = 'cancelled';
                await order.save();
                this.sendMessage(query.message.chat.id, `❌ Order ${order.orderIdDisplay} cancelled.`);
            }
        } catch (error) {
            this.sendMessage(query.message.chat.id, 'Error: ' + error.message);
        }
    }

    async verifyPayment(orderId, query) {
        try {
            const order = await Order.findById(orderId);
            if (order) {
                order.paymentStatus = 'verified';
                order.status = 'confirmed';
                order.confirmedAt = new Date();
                await order.save();
                
                this.sendMessage(query.message.chat.id, `✅ Payment verified for ${order.orderIdDisplay}`);
                
                // Notify kitchen
                await this.sendOrderNotification(order);
            }
        } catch (error) {
            this.sendMessage(query.message.chat.id, 'Error: ' + error.message);
        }
    }

    async rejectPayment(orderId, query) {
        try {
            const order = await Order.findById(orderId);
            if (order) {
                order.paymentStatus = 'failed';
                order.status = 'cancelled';
                await order.save();
                
                this.sendMessage(query.message.chat.id, `❌ Payment rejected for ${order.orderIdDisplay}`);
            }
        } catch (error) {
            this.sendMessage(query.message.chat.id, 'Error: ' + error.message);
        }
    }
}

module.exports = AdminBot;
