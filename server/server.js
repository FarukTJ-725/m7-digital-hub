require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const User = require('./models/User');
const Payment = require('./models/Payment');
const PrintJob = require('./models/PrintJob');
const GamerProfile = require('./models/GamerProfile');
const MatchResult = require('./models/MatchResult');
const auth = require('./middleware/auth');
const errorHandler = require('./middleware/error');
const telegramManager = require('./services/telegram');

const app = express();
const PORT = process.env.PORT || 5001;

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'; 

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital_hub')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

// Health check endpoint for Railway
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
// Get all menu items
app.get('/api/menu', async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.json(menuItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single menu item by ID
app.get('/api/menu/:id', async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json(menuItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new menu item
app.post('/api/menu', async (req, res) => {
    const menuItem = new MenuItem({
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
        imageUrl: req.body.imageUrl
    });
    try {
        const newMenuItem = await menuItem.save();
        res.status(201).json(newMenuItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a menu item
app.put('/api/menu/:id', async (req, res) => {
    try {
        const updatedMenuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedMenuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json(updatedMenuItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a menu item
app.delete('/api/menu/:id', async (req, res) => {
    try {
        const deletedMenuItem = await MenuItem.findByIdAndDelete(req.params.id);
        if (!deletedMenuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json({ message: 'Menu item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Order Routes
// Create a new order (protected)
app.post('/api/orders', auth, async (req, res) => {
    const { items, totalAmount } = req.body;
    try {
        const newOrder = new Order({
            userId: req.user.id, 
            items,
            totalAmount
        });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all orders (protected - user specific)
app.get('/api/orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).populate('items.menuItemId', 'name price');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single order by ID (protected - user specific)
app.get('/api/orders/:id', auth, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, userId: req.user.id }).populate('items.menuItemId', 'name price');
        if (!order) {
            return res.status(404).json({ message: 'Order not found or not authorized' });
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update order status
app.put('/api/orders/:id/status', auth, async (req, res) => {
    const { status } = req.body;
    try {
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { status },
            { new: true, runValidators: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found or not authorized' });
        }
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ==================== UNIFIED ORDER ROUTES ====================

// Create order with unified cart (supports multiple service types)
app.post('/api/orders/create', auth, async (req, res) => {
    const { items, totalAmount } = req.body;
    try {
        // Generate order ID
        const orderIdDisplay = `DH-${Date.now().toString().slice(-8)}`;
        
        const order = new Order({
            userId: req.user.id,
            items: items.map(item => ({
                menuItemId: item.menuItemId || item.id,
                name: item.name,
                price: item.price,
                qty: item.qty,
                serviceType: item.serviceType || 'restaurant',
                details: item.details || {}
            })),
            totalAmount,
            status: 'pending',
            paymentStatus: 'pending',
            orderIdDisplay
        });
        
        await order.save();
        
        // Send Telegram notification to admin and kitchen
        await telegramManager.notifyNewOrder(order);
        
        res.status(201).json({ 
            orderId: order._id,
            orderIdDisplay: order.orderIdDisplay
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Confirm payment (user submits payment confirmation)
app.post('/api/orders/:id/confirm-payment', auth, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        order.paymentStatus = 'pending_verification';
        await order.save();
        
        // Send Telegram notification to admins
        await telegramManager.notifyPayment(order);
        
        res.json({ 
            message: 'Payment confirmation submitted',
            orderId: order._id,
            orderIdDisplay: order.orderIdDisplay
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Verify payment (admin only - would need admin auth middleware)
app.post('/api/payments/verify', auth, async (req, res) => {
    const { orderId, verified, notes } = req.body;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        if (verified) {
            order.paymentStatus = 'verified';
            order.status = 'confirmed';
            order.confirmedAt = new Date();
            await order.save();
            
            // Notify kitchen of confirmed order
            await telegramManager.notifyKitchen(order);
            
            res.json({ message: 'Payment verified, order confirmed' });
        } else {
            order.paymentStatus = 'failed';
            order.status = 'cancelled';
            await order.save();
            
            res.json({ message: 'Payment not verified', notes });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Payment Routes
// Process a new payment (protected)
app.post('/api/payment/process', auth, async (req, res) => {
    const { orderId, amount, paymentMethod, transactionId } = req.body;
    if (!orderId || !amount || !paymentMethod || !transactionId) {
        return res.status(400).json({ message: 'Missing required payment details.' });
    }
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const newPayment = new Payment({
            userId: req.user.id,
            orderId,
            amount,
            currency: 'NGN',
            transactionId,
            paymentMethod,
            status: 'completed'
        });
        await newPayment.save();
        await Order.findByIdAndUpdate(orderId, { status: 'confirmed' });
        res.status(201).json(newPayment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single payment by ID (protected - user specific)
app.get('/api/payment/:id', auth, async (req, res) => {
    try {
        const payment = await Payment.findOne({ _id: req.params.id, userId: req.user.id });
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found or not authorized' });
        }
        res.json(payment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Print Job Routes
// Submit a new print job (protected)
app.post('/api/print/submit', auth, async (req, res) => {
    const { fileName, fileSize, numPages, printOptions, price } = req.body;
    try {
        const newPrintJob = new PrintJob({
            userId: req.user.id,
            fileName,
            fileSize,
            numPages,
            printOptions,
            price
        });
        await newPrintJob.save();
        res.status(201).json(newPrintJob);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all print jobs (protected - user specific)
app.get('/api/print', auth, async (req, res) => {
    try {
        const printJobs = await PrintJob.find({ userId: req.user.id });
        res.json(printJobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single print job by ID (protected - user specific)
app.get('/api/print/:id', auth, async (req, res) => {
    try {
        const printJob = await PrintJob.findOne({ _id: req.params.id, userId: req.user.id });
        if (!printJob) {
            return res.status(404).json({ message: 'Print job not found or not authorized' });
        }
        res.json(printJob);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update print job status
app.put('/api/print/:id/status', auth, async (req, res) => {
    const { status } = req.body;
    try {
        const updatedPrintJob = await PrintJob.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { status },
            { new: true, runValidators: true }
        );
        if (!updatedPrintJob) {
            return res.status(404).json({ message: 'Print job not found or not authorized' });
        }
        res.json(updatedPrintJob);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ==================== GAMER PROFILE ROUTES ====================

// Create or get gamer profile
app.post('/api/gamer/profile', auth, async (req, res) => {
    const { gamerUsername, favoriteTeam, gamingStyle, preferredPosition } = req.body;
    try {
        // Check if profile already exists
        let profile = await GamerProfile.findOne({ userId: req.user.id });
        if (profile) {
            return res.status(400).json({ message: 'Gamer profile already exists' });
        }
        
        // Check if username is taken
        const existingUsername = await GamerProfile.findOne({ gamerUsername });
        if (existingUsername) {
            return res.status(400).json({ message: 'Gamer username already taken' });
        }
        
        profile = new GamerProfile({
            userId: req.user.id,
            gamerUsername,
            favoriteTeam,
            gamingStyle,
            preferredPosition
        });
        
        await profile.save();
        res.status(201).json(profile);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get my gamer profile
app.get('/api/gamer/profile', auth, async (req, res) => {
    try {
        const profile = await GamerProfile.findOne({ userId: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: 'Gamer profile not found' });
        }
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get gamer profile by username
app.get('/api/gamer/profile/:username', async (req, res) => {
    try {
        const profile = await GamerProfile.findOne({ gamerUsername: req.params.username });
        if (!profile) {
            return res.status(404).json({ message: 'Gamer profile not found' });
        }
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update gamer profile
app.put('/api/gamer/profile', auth, async (req, res) => {
    const { favoriteTeam, gamingStyle, preferredPosition } = req.body;
    try {
        const profile = await GamerProfile.findOneAndUpdate(
            { userId: req.user.id },
            { favoriteTeam, gamingStyle, preferredPosition },
            { new: true }
        );
        if (!profile) {
            return res.status(404).json({ message: 'Gamer profile not found' });
        }
        res.json(profile);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get gamer rankings
app.get('/api/gamer/rankings', async (req, res) => {
    try {
        const rankings = await GamerProfile.find()
            .sort({ 'stats.winRate': -1, 'stats.goalsScored': -1 })
            .limit(20);
        res.json(rankings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==================== MATCH RESULT ROUTES ====================

// Record a match result (admin only for now)
app.post('/api/matches/record', auth, async (req, res) => {
    const { player1Username, player2Username, player1Team, player2Team, player1Score, player2Score, gameVersion, matchType } = req.body;
    try {
        // Find player profiles
        const profile1 = await GamerProfile.findOne({ gamerUsername: player1Username });
        const profile2 = await GamerProfile.findOne({ gamerUsername: player2Username });
        
        if (!profile1 || !profile2) {
            return res.status(404).json({ message: 'Player not found' });
        }
        
        const match = new MatchResult({
            player1Id: profile1._id,
            player2Id: profile2._id,
            player1Username: profile1.gamerUsername,
            player2Username: profile2.gamerUsername,
            player1Team,
            player2Team,
            player1Score,
            player2Score,
            gameVersion: gameVersion || 'FC26',
            matchType: matchType || 'casual',
            recordedBy: req.user.id
        });
        
        await match.save();
        
        // Update player stats
        await GamerProfile.updateStats(profile1._id, match);
        await GamerProfile.updateStats(profile2._id, match);
        
        res.status(201).json(match);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get recent matches
app.get('/api/matches/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const matches = await MatchResult.find({ status: 'confirmed' })
            .sort({ matchDate: -1 })
            .limit(limit);
        res.json(matches);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get head-to-head
app.get('/api/matches/head2head/:player1/:player2', async (req, res) => {
    try {
        const profile1 = await GamerProfile.findOne({ gamerUsername: req.params.player1 });
        const profile2 = await GamerProfile.findOne({ gamerUsername: req.params.player2 });
        
        if (!profile1 || !profile2) {
            return res.status(404).json({ message: 'Player not found' });
        }
        
        const { matches, stats } = await MatchResult.getHeadToHead(profile1._id, profile2._id);
        res.json({ player1: profile1.gamerUsername, player2: profile2.gamerUsername, matches, stats });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get my match history
app.get('/api/matches/my', auth, async (req, res) => {
    try {
        const profile = await GamerProfile.findOne({ userId: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: 'Gamer profile not found' });
        }
        
        const matches = await MatchResult.getRecentMatches(profile._id);
        res.json(matches);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Auth Routes (public)
// Register a new user
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        user = new User({ username, email, password });
        await user.save();
        const payload = { user: { id: user.id } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Authenticate user & get token (Login)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const payload = { user: { id: user.id } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Basic route
app.get('/', (req, res) => {
    res.send('Digital Hub Backend API is running!');
});

// Apply error handler as last middleware
app.use(errorHandler);

// Initialize Telegram Bots
telegramManager.initialize().then(() => {
    console.log('Telegram bots initialized');
}).catch(err => {
    console.error('Failed to initialize Telegram bots:', err.message);
});

app.listen(PORT, () => {
    console.log(`Digital Hub Backend API running on port ${PORT}`);
});
