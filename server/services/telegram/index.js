const AdminBot = require('./AdminBot');
const KitchenBot = require('./KitchenBot');
const Order = require('../../models/Order');
const Payment = require('../../models/Payment');
const MenuItem = require('../../models/MenuItem');

class TelegramBotManager {
    constructor() {
        this.adminBot = null;
        this.kitchenBot = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) {
            console.log('[TelegramManager] Bots already initialized');
            return;
        }

        const adminToken = process.env.TELEGRAM_ADMIN_BOT_TOKEN;
        const kitchenToken = process.env.TELEGRAM_KITCHEN_BOT_TOKEN;
        const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
        const kitchenChatId = process.env.TELEGRAM_KITCHEN_CHAT_ID;

        try {
            // Initialize Admin Bot
            if (adminToken) {
                console.log('[TelegramManager] Initializing Admin Bot...');
                this.adminBot = new AdminBot(adminToken, adminChatId, false);
                
                this.adminBot.bot.on('error', (error) => {
                    console.error('[AdminBot] Error:', error.message);
                });

                console.log('[TelegramManager] Admin Bot initialized');
            } else {
                console.log('[TelegramManager] No admin bot token configured');
            }

            // Initialize Kitchen Bot
            if (kitchenToken) {
                console.log('[TelegramManager] Initializing Kitchen Bot...');
                this.kitchenBot = new KitchenBot(kitchenToken, kitchenChatId, false);
                
                this.kitchenBot.bot.on('error', (error) => {
                    console.error('[KitchenBot] Error:', error.message);
                });

                console.log('[TelegramManager] Kitchen Bot initialized');
            } else {
                console.log('[TelegramManager] No kitchen bot token configured');
            }

            this.isInitialized = true;
            console.log('[TelegramManager] All bots initialized successfully');

        } catch (error) {
            console.error('[TelegramManager] Failed to initialize bots:', error.message);
        }
    }

    // Notify admin of new order
    async notifyNewOrder(order) {
        if (!this.adminBot) {
            console.log('[TelegramManager] Admin bot not initialized');
            return null;
        }

        return this.adminBot.sendOrderNotification(order);
    }

    // Notify admin of payment
    async notifyPayment(order) {
        if (!this.adminBot) {
            console.log('[TelegramManager] Admin bot not initialized');
            return null;
        }

        return this.adminBot.sendPaymentNotification(order);
    }

    // Notify kitchen of order
    async notifyKitchen(order) {
        if (!this.kitchenBot) {
            console.log('[TelegramManager] Kitchen bot not initialized');
            return null;
        }

        return this.kitchenBot.sendOrderNotification(order);
    }

    // Update order status
    async updateOrderStatus(orderId, status) {
        try {
            const order = await Order.findById(orderId);
            if (!order) {
                throw new Error('Order not found');
            }

            order.status = status;
            order[`${status}At`] = new Date();
            await order.save();

            // Notify appropriate parties
            if (status === 'preparing' && this.kitchenBot) {
                await this.kitchenBot.sendMessage(
                    this.kitchenBot.adminChatId,
                    `👨‍🍳 Started preparing order ${order.orderIdDisplay}`
                );
            } else if (status === 'ready' && this.adminBot) {
                await this.adminBot.sendMessage(
                    this.adminBot.adminChatId,
                    `🍽️ Order ${order.orderIdDisplay} is ready!`
                );
            } else if (status === 'delivered' && this.adminBot) {
                await this.adminBot.sendMessage(
                    this.adminBot.adminChatId,
                    `🎉 Order ${order.orderIdDisplay} delivered!`
                );
            }

            return order;
        } catch (error) {
            console.error('[TelegramManager] Error updating order status:', error);
            throw error;
        }
    }

    // Broadcast message to all admin channels
    async broadcast(message) {
        const promises = [];
        
        if (this.adminBot) {
            promises.push(this.adminBot.sendMessage(this.adminBot.adminChatId, message));
        }
        
        if (this.kitchenBot) {
            promises.push(this.kitchenBot.sendMessage(this.kitchenBot.adminChatId, message));
        }

        return Promise.all(promises);
    }
}

// Singleton instance
const telegramManager = new TelegramBotManager();

module.exports = telegramManager;
