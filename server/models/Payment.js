const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Will reference the User model once implemented
        default: null
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        required: true,
        default: 'NGN' // Assuming Nigerian Naira based on frontend code
    },
    transactionId: {
        type: String,
        unique: true,
        required: true // Simulated unique ID for the transaction
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['bank_transfer', 'card', 'paypal', 'other'], // Example methods
        default: 'bank_transfer'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    paymentDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Payment', PaymentSchema);
