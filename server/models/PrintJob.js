const mongoose = require('mongoose');

const PrintJobSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Will reference the User model once implemented
        default: null
    },
    fileName: {
        type: String,
        required: true,
        trim: true
    },
    fileSize: {
        type: Number, // Size in bytes
        required: true,
        min: 0
    },
    numPages: {
        type: Number,
        required: true,
        min: 1
    },
    printOptions: {
        color: { type: Boolean, default: false },
        duplex: { type: Boolean, default: false }, // true for double-sided
        binding: { type: String, enum: ['none', 'staple', 'spiral'], default: 'none' }
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled', 'awaiting-payment'],
        default: 'awaiting-payment' // Initial status
    },
    submissionDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PrintJob', PrintJobSchema);
