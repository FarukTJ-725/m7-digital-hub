const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5001;
const JWT_SECRET = 'mock_secret_key';

app.use(cors());
app.use(express.json());

// --- IN-MEMORY DATABASE ---
const db = {
    users: [], // Each user: { id, username, email, password, gamerProfile: { username, level, winRate, goals, streak, createdAt } }
    menu: [
        { _id: 'm1', name: 'Double Cheese Burger', price: 4500, category: 'Burgers', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
        { _id: 'm2', name: 'Spicy Chicken Wings', price: 3800, category: 'Sides', imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500' },
        { _id: 'm3', name: 'Jollof Rice Special', price: 5200, category: 'Main', imageUrl: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=500' },
        { _id: 'm4', name: 'Hub Monster Shake', price: 2500, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500' },
        { _id: 'm5', name: 'Crispy French Fries', price: 1500, category: 'Sides', imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500' },
        { _id: 'm6', name: 'Iced Vanilla Latte', price: 2200, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500' }
    ],
    orders: [],
    payments: [],
    printJobs: []
};

// --- AUTH MIDDLEWARE ---
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// --- ROUTES ---

// Auth
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (db.users.find(u => u.email === email)) return res.status(400).json({ message: 'User already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { 
        id: Date.now().toString(), 
        username, 
        email, 
        password: hashedPassword,
        gamerProfile: null // No gamer profile by default
    };
    db.users.push(newUser);
    
    const token = jwt.sign({ user: { id: newUser.id, username: newUser.username, email: newUser.email } }, JWT_SECRET);
    res.status(201).json({ token, user: { id: newUser.id, username: newUser.username, email: newUser.email, gamerProfile: null } });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ user: { id: user.id, username: user.username, email: user.email } }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, gamerProfile: user.gamerProfile } });
});

// Gamer Profile Routes
app.post('/api/gamer/create', auth, (req, res) => {
    const { gamerTag } = req.body;
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.gamerProfile) return res.status(400).json({ message: 'Gamer profile already exists' });

    user.gamerProfile = {
        username: gamerTag,
        level: 1,
        winRate: 0,
        goals: 0,
        streak: 0,
        createdAt: new Date()
    };
    
    res.status(201).json(user.gamerProfile);
});

app.get('/api/gamer/me', auth, (req, res) => {
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.gamerProfile);
});

// Menu
app.get('/api/menu', (req, res) => res.json(db.menu));

// Orders
app.post('/api/orders', auth, (req, res) => {
    const newOrder = {
        _id: 'ord' + Date.now(),
        userId: req.user.id,
        items: req.body.items,
        totalAmount: req.body.totalAmount,
        status: 'pending',
        createdAt: new Date()
    };
    db.orders.push(newOrder);
    res.status(201).json(newOrder);
});

app.get('/api/orders', auth, (req, res) => {
    const userOrders = db.orders.filter(o => o.userId === req.user.id);
    res.json(userOrders);
});

// Payments
app.post('/api/payment/process', auth, (req, res) => {
    const payment = {
        _id: 'pay' + Date.now(),
        ...req.body,
        userId: req.user.id,
        status: 'completed'
    };
    db.payments.push(payment);
    // Update order status
    const order = db.orders.find(o => o._id === req.body.orderId);
    if (order) order.status = 'confirmed';
    res.status(201).json(payment);
});

// Print Hub
app.post('/api/print/submit', auth, (req, res) => {
    const job = {
        _id: 'prt' + Date.now(),
        ...req.body,
        userId: req.user.id,
        status: 'queued'
    };
    db.printJobs.push(job);
    res.status(201).json(job);
});

app.get('/api/print', auth, (req, res) => {
    const userJobs = db.printJobs.filter(j => j.userId === req.user.id);
    res.json(userJobs);
});

app.get('/', (req, res) => res.send('🚀 MOCK BRIDGE SERVER RUNNING'));

app.listen(PORT, () => {
    console.log(`\n✅ MOCK BRIDGE SERVER active on http://localhost:${PORT}`);
    console.log(`🛠️  Mirroring live backend functionality (In-Memory)`);
});
