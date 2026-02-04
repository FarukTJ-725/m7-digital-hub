const mongoose = require('mongoose');

// Order Item Schema with multi-service support
const OrderItemSchema = new mongoose.Schema({
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        default: null
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    qty: {
        type: Number,
        required: true,
        min: 1
    },
    // Multi-service support
    serviceType: {
        type: String,
        enum: ['restaurant', 'game', 'print', 'ecommerce', 'logistics', 'streaming', 'download'],
        default: 'restaurant'
    },
    // Service-specific details
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { _id: true }); // Include _id for subdocuments

const OrderSchema = new mongoose.Schema({
    // Display-friendly order ID
    orderIdDisplay: {
        type: String,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    items: [OrderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    // Order status workflow
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    // Payment workflow
    paymentStatus: {
        type: String,
        enum: ['pending', 'pending_verification', 'verified', 'failed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['bank_transfer', 'card', 'wallet', 'other'],
        default: 'bank_transfer'
    },
    paymentReference: {
        type: String
    },
    // Timestamps
    orderDate: {
        type: Date,
        default: Date.now
    },
    confirmedAt: {
        type: Date
    },
    preparingAt: {
        type: Date
    },
    readyAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    // Notes
    notes: {
        type: String
    },
    specialInstructions: String
});

// Generate order ID before saving
OrderSchema.pre('save', function(next) {
    if (!this.orderIdDisplay) {
        this.orderIdDisplay = `DH-${Date.now().toString().slice(-8)}`;
    }
    next();
});

// Index for faster queries
OrderSchema.index({ orderIdDisplay: 1 });
OrderSchema.index({ userId: 1, orderDate: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Order', OrderSchema);
