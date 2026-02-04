const mongoose = require('mongoose');

const BotUserSchema = new mongoose.Schema({
    telegramId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        trim: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    role: {
        type: String,
        enum: ['admin', 'chef', 'game_admin', 'customer', 'driver'],
        default: 'customer'
    },
    linkedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    notificationsEnabled: {
        type: Boolean,
        default: true
    },
    languageCode: {
        type: String,
        default: 'en'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
BotUserSchema.index({ telegramId: 1 });
BotUserSchema.index({ role: 1 });
BotUserSchema.index({ linkedUserId: 1 });

// Update lastActive on save
BotUserSchema.pre('save', function(next) {
    this.lastActive = new Date();
    next();
});

module.exports = mongoose.model('BotUser', BotUserSchema);
