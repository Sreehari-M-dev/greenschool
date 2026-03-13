require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin (You will need your service account key)
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
});

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greenschool', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Schemas & Models ---
const recordSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Firebase UID
    userName: { type: String }, // Store Google Display Name
    type: { type: String, enum: ['electricity', 'water', 'waste', 'tree'], required: true },
    value: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    notes: String
});

const Record = mongoose.model('Record', recordSchema);

const campaignSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String },
    title: String,
    description: String,
    dateCompleted: Date
});

const Campaign = mongoose.model('Campaign', campaignSchema);

const limitSchema = new mongoose.Schema({
    month: { type: String, required: true }, // Format: YYYY-MM
    electricity: { type: Number, default: 0 },
    water: { type: Number, default: 0 },
    waste: { type: Number, default: 0 }
});

const Limit = mongoose.model('Limit', limitSchema);

// --- Auth Middleware ---
const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid Token' });
    }
};

// --- Routes ---
// Get all tracks for the logged-in user
app.get('/api/records', verifyToken, async (req, res) => {
    try {
        const records = await Record.find({ userId: req.user.uid }).sort({ date: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new track (Electricity, Water, Waste, Tree)
app.post('/api/records', verifyToken, async (req, res) => {
    try {
        const newRecord = new Record({
            ...req.body,
            userId: req.user.uid,
            userName: req.user.name || req.user.email || 'Student'
        });
        await newRecord.save();
        res.status(201).json(newRecord);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Add an awareness campaign
app.post('/api/campaigns', verifyToken, async (req, res) => {
    try {
        const newCampaign = new Campaign({
            ...req.body,
            userId: req.user.uid,
            userName: req.user.name || req.user.email || 'Student'
        });
        await newCampaign.save();
        res.status(201).json(newCampaign);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- PRINCIPAL ROUTES ---

// Get all records (School-wide view)
app.get('/api/all-records', verifyToken, async (req, res) => {
    try {
        const { month } = req.query; // format YYYY-MM
        let query = {};
        if (month) {
            const startDate = new Date(`${month}-01T00:00:00.000Z`);
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
            query.date = { $gte: startDate, $lt: endDate };
        }
        // Returns all students data sorted by newest first
        const records = await Record.find(query).sort({ date: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get limits for a specific month
app.get('/api/limits/:month', verifyToken, async (req, res) => {
    try {
        let limits = await Limit.findOne({ month: req.params.month });
        if (!limits) {
            limits = { electricity: 0, water: 0, waste: 0 };
        }
        res.json(limits);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Set limits for a specific month
app.post('/api/limits', verifyToken, async (req, res) => {
    try {
        const { month, electricity, water, waste } = req.body;
        const updated = await Limit.findOneAndUpdate(
            { month },
            { $set: { electricity, water, waste } },
            { new: true, upsert: true } // Create if it doesn't exist
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Green School Backend running on http://localhost:${PORT}`);
});
