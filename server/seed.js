require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');

const menuItems = [
    { name: 'Double Cheese Burger', price: 4500, category: 'Burgers', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
    { name: 'Spicy Chicken Wings', price: 3800, category: 'Sides', imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500' },
    { name: 'Jollof Rice Special', price: 5200, category: 'Main', imageUrl: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=500' },
    { name: 'Hub Monster Shake', price: 2500, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500' },
    { name: 'Crispy French Fries', price: 1500, category: 'Sides', imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500' },
    { name: 'Iced Vanilla Latte', price: 2200, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500' }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB for seeding...');
        
        await MenuItem.deleteMany({});
        console.log('Cleared existing menu items.');
        
        await MenuItem.insertMany(menuItems);
        console.log('Database Seeded Successfully! 🍔');
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
