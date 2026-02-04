const BotService = require('./BotService');
const Order = require('../../models/Order');

class KitchenBot extends BotService {
    constructor(token, kitchenChatId, useWebhook = false) {
        super(token, kitchenChatId, useWebhook);
        this.setupCommands();
    }

    setupCommands() {
        // Status update commands
        this.bot.onText(/\/start/, (msg) => this.start(msg));
        this.bot.onText(/\/orders/, (msg) => this.showKitchenOrders(msg));
        this.bot.onText(/\/ready (.+)/, (msg, match) => this.markReady(msg, match[1]));
        this.bot.onText(/\/deliver (.+)/, (msg, match) => this.markDelivering(msg, match[1]));
        this.bot.onText(/\/complete (.+)/, (msg, match) => this.markComplete(msg, match[1]));
        
        // Callback queries
        this.bot.on('callback_query', (query) => this.handleCallback(query));
    }

    start(msg) {
        this.sendMessage(msg.chat.id, `
<b>👨‍🍳 Kitchen Bot Ready!</b>

Available commands:
📦 <b>/orders</b> - View active kitchen orders
✅ <b>/ready [order_id]</b> - Mark order as ready
🚗 <b>/deliver [order_id]</b> - Mark order as out for delivery
🎉 <b>/complete [order_id]</b> - Mark order as delivered
        `);
    }

    async showKitchenOrders(msg) {
        // Get orders in preparation or ready states
        const orders = await Order.find({
            status: { $in: ['confirmed', 'preparing', 'ready'] }
        })
        .populate('userId', 'username phone')
        .sort({ orderDate: 1 });

        if (orders.length === 0) {
            return this.sendMessage(msg.chat.id, '✅ No active kitchen orders.');
        }

        // Group by status
        const byStatus = {
            confirmed: orders.filter(o => o.status === 'confirmed'),
            preparing: orders.filter(o => o.status === 'preparing'),
            ready: orders.filter(o => o.status === 'ready')
        };

        const buildOrderList = (list, status, emoji) => 
            list.length > 0 
                ? list.map((order, i) => {
                    const itemsList = order.items
                        .filter(item => item.serviceType === 'restaurant')
                        .map(item => `   • ${item.name} x${item.qty}`)
                        .join('\n');
                    
                    return `${emoji} <b>#${order.orderIdDisplay}</b>\n` +
                           `   Customer: ${order.userId?.username || 'Guest'}\n` +
                           `   Time: ${new Date(order.orderDate).toLocaleString()}\n` +
                           `${itemsList}`;
                }).join('\n\n')
                : '   None';

        const message = `
<b>👨‍🍳 Kitchen Dashboard</b>

⏳ <b>CONFIRMED (${byStatus.confirmed.length})</b>
${buildOrderList(byStatus.confirmed, 'confirmed', '⏳')}

👨‍🍳 <b>PREPARING (${byStatus.preparing.length})</b>
${buildOrderList(byStatus.preparing, 'preparing', '👨‍🍳')}

🍽️ <b>READY (${byStatus.ready.length})</b>
${buildOrderList(byStatus.ready, 'ready', '🍽️')}
        `;

        this.sendMessage(msg.chat.id, message, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '⏳ Show All', callback_data: 'kitchen_all' },
                        { text: '🔄 Refresh', callback_data: 'kitchen_refresh' }
                    ]
                ]
            }
        });
    }

    async markReady(msg, orderId) {
        try {
            // Extract order ID from various formats
            const cleanId = orderId.replace('#', '').trim();
            const order = await Order.findById(cleanId);

            if (!order) {
                return this.sendMessage(msg.chat.id, `Order ${cleanId} not found.`);
            }

            if (order.status !== 'preparing') {
                return this.sendMessage(msg.chat.id, `Order ${order.orderIdDisplay} is not in preparing status. Current: ${order.status}`);
            }

            order.status = 'ready';
            order.readyAt = new Date();
            await order.save();

            this.sendMessage(msg.chat.id, `🍽️ Order ${order.orderIdDisplay} is now <b>READY</b> for pickup/delivery!`);

            // Notify admin
            if (this.adminChatId) {
                this.sendMessage(this.adminChatId, `🍽️ Order ${order.orderIdDisplay} is ready!`);
            }

        } catch (error) {
            this.sendMessage(msg.chat.id, 'Error: ' + error.message);
        }
    }

    async markDelivering(msg, orderId) {
        try {
            const cleanId = orderId.replace('#', '').trim();
            const order = await Order.findById(cleanId);

            if (!order) {
                return this.sendMessage(msg.chat.id, `Order ${cleanId} not found.`);
            }

            if (order.status !== 'ready') {
                return this.sendMessage(msg.chat.id, `Order ${order.orderIdDisplay} must be ready first.`);
            }

            order.status = 'out-for-delivery';
            order.outForDeliveryAt = new Date();
            await order.save();

            this.sendMessage(msg.chat.id, `🚗 Order ${order.orderIdDisplay} is now <b>out for delivery</b>!`);

        } catch (error) {
            this.sendMessage(msg.chat.id, 'Error: ' + error.message);
        }
    }

    async markComplete(msg, orderId) {
        try {
            const cleanId = orderId.replace('#', '').trim();
            const order = await Order.findById(cleanId);

            if (!order) {
                return this.sendMessage(msg.chat.id, `Order ${cleanId} not found.`);
            }

            order.status = 'delivered';
            order.deliveredAt = new Date();
            await order.save();

            this.sendMessage(msg.chat.id, `🎉 Order ${order.orderIdDisplay} marked as <b>DELIVERED</b>!`);

        } catch (error) {
            this.sendMessage(msg.chat.id, 'Error: ' + error.message);
        }
    }

    async handleCallback(query) {
        const [action, type, orderId] = query.data.split('_');

        switch (action) {
            case 'start':
                await this.start(query.message);
                break;
            case 'kitchen':
                await this.showKitchenOrders(query.message);
                break;
        }

        this.bot.answerCallbackQuery(query.id);
    }

    // Override to include admin chat for notifications
    async sendOrderNotification(order, statusEmoji = {}) {
        const emoji = {
            pending: '⏳',
            confirmed: '✅',
            preparing: '👨‍🍳',
            ready: '🍽️',
            'out-for-delivery': '🚗',
            delivered: '🎉',
            cancelled: '❌',
            ...statusEmoji
        };

        // Filter to restaurant items only
        const restaurantItems = order.items.filter(item => item.serviceType === 'restaurant');
        
        if (restaurantItems.length === 0) {
            return null; // Not a kitchen order
        }

        const itemsList = restaurantItems
            .map(item => `• ${item.name} x${item.qty} - ₦${item.price * item.qty}`)
            .join('\n');

        const message = `
<b>🍔 Kitchen Order ${order.orderIdDisplay || ''}</b>

<b>Customer:</b> ${order.userId?.username || 'Guest'}
<b>Phone:</b> ${order.userId?.phone || 'N/A'}
<b>Time:</b> ${new Date(order.orderDate).toLocaleString()}
<b>Total:</b> ₦${order.totalAmount}

<b>Items:</b>
${itemsList}

<b>Status:</b> ${emoji[order.status]} ${order.status}
        `;

        // Send to kitchen
        this.sendMessage(this.adminChatId, message, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '👨‍🍳 Start Preparing', callback_data: `kitchen_start_${order._id}` },
                        { text: '🍽️ Ready', callback_data: `kitchen_ready_${order._id}` }
                    ]
                ]
            }
        });

        // Also send to admin
        if (this.adminChatId) {
            this.sendMessage(this.adminChatId, message, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '✅ Accept', callback_data: `order_accept_${order._id}` },
                            { text: '❌ Reject', callback_data: `order_reject_${order._id}` }
                        ]
                    ]
                }
            });
        }
    }

    // Method to start preparing an order
    async startPreparing(orderId) {
        try {
            const order = await Order.findById(orderId);
            if (order) {
                order.status = 'preparing';
                order.preparingStartedAt = new Date();
                await order.save();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error starting preparation:', error);
            return false;
        }
    }
}

module.exports = KitchenBot;
