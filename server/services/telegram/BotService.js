const TelegramBot = require('node-telegram-bot-api');

class BotService {
    constructor(token, adminChatId = null, useWebhook = false) {
        this.token = token;
        this.adminChatId = adminChatId;
        this.useWebhook = useWebhook;
        
        if (useWebhook) {
            const webhookUrl = process.env.WEBHOOK_URL;
            this.bot = new TelegramBot(token, {
                webHook: {
                    port: process.env.WEBHOOK_PORT || 5002,
                    autoOpen: false
                }
            });
            if (webhookUrl) {
                this.bot.setWebHook(`${webhookUrl}/bot${token}`);
            }
        } else {
            this.bot = new TelegramBot(token, { polling: true });
        }
    }

    async sendMessage(chatId, text, options = {}) {
        try {
            return await this.bot.sendMessage(chatId, text, {
                parse_mode: 'HTML',
                ...options
            });
        } catch (error) {
            console.error(`[${this.constructor.name}] Error sending message:`, error.message);
            return null;
        }
    }

    async sendPhoto(chatId, photoUrl, caption = '', options = {}) {
        try {
            return await this.bot.sendPhoto(chatId, photoUrl, {
                caption,
                parse_mode: 'HTML',
                ...options
            });
        } catch (error) {
            console.error(`[${this.constructor.name}] Error sending photo:`, error.message);
            return null;
        }
    }

    async editMessage(chatId, messageId, text, options = {}) {
        try {
            return await this.bot.editMessageText(text, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML',
                ...options
            });
        } catch (error) {
            console.error(`[${this.constructor.name}] Error editing message:`, error.message);
            return null;
        }
    }

    async answerCallbackQuery(callbackQueryId, text = '', options = {}) {
        try {
            return await this.bot.answerCallbackQuery(callbackQueryId, {
                text,
                ...options
            });
        } catch (error) {
            console.error(`[${this.constructor.name}] Error answering callback:`, error.message);
            return null;
        }
    }

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

        const itemsList = order.items
            .map(item => `• ${item.name} x${item.qty} - ₦${item.price * item.qty}`)
            .join('\n');

        const serviceEmoji = {
            restaurant: '🍔',
            game: '🎮',
            print: '🖨️',
            ecommerce: '🛍️',
            logistics: '🚗',
            streaming: '📺',
            download: '📥'
        };

        const message = `
<b>🆕 New Order ${order.orderIdDisplay || ''}</b>

<b>Customer:</b> ${order.userId?.username || 'Guest'}
<b>Service:</b> ${serviceEmoji[order.items[0]?.serviceType] || '📦'} ${order.items[0]?.serviceType || 'General'}
<b>Time:</b> ${new Date(order.orderDate).toLocaleString()}
<b>Total:</b> ₦${order.totalAmount}

<b>Items:</b>
${itemsList}

<b>Status:</b> ${emoji[order.status]} ${order.status}
        `;

        return this.sendMessage(this.adminChatId, message, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✅ Accept', callback_data: `order_accept_${order._id}` },
                        { text: '❌ Reject', callback_data: `order_reject_${order._id}` }
                    ],
                    [
                        { text: '👨‍🍳 Kitchen', callback_data: `order_kitchen_${order._id}` }
                    ]
                ]
            }
        });
    }

    async sendPaymentNotification(order) {
        const message = `
💰 <b>Payment Received</b>

<b>Order:</b> ${order.orderIdDisplay}
<b>Amount:</b> ₦${order.totalAmount}
<b>Customer:</b> ${order.userId?.username || 'Guest'}
<b>Reference:</b> ${order.paymentReference || 'N/A'}
<b>Time:</b> ${new Date().toLocaleString()}

Please verify the payment and confirm the order.
        `;

        return this.sendMessage(this.adminChatId, message, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✅ Verify Payment', callback_data: `verify_${order._id}` },
                        { text: '❌ Reject', callback_data: `reject_payment_${order._id}` }
                    ]
                ]
            }
        });
    }

    processUpdate(update) {
        if (this.bot && this.useWebhook) {
            this.bot.processUpdate(update);
        }
    }
}

module.exports = BotService;
