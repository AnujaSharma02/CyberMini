
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const userRoutes = require('./routes/userRoutes');
const authMiddleware = require("./middleware/authMiddleware");

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Enable CORS for your frontend
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

// Middleware
app.use(express.json());

app.use('/api/users', require("./routes/userRoutes"));

// Test route
app.get("/", (req, res) => {
    res.send("CyberMini Backend Running");
});

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 */
app.post("/api/auth/signup", async (req, res) => {
    try {
        console.log("📩 Signup request body:", req.body); // log the form data

        const { name, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save new user
        const newUser = await User.create({ name, email, password: hashedPassword });

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 */
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * Protected route: Get modules
 */
app.get("/api/modules", authMiddleware, (req, res) => {
    const modules = [
        { _id: "1", name: "Beginner" },
        { _id: "2", name: "Intermediate" },
        { _id: "3", name: "Expert" }
    ];
    res.json(modules);
});

/**
 * @route   GET /api/protected
 * @desc    Example of a protected route
 */
app.get("/api/protected", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json({ message: `Welcome ${user.name}, here’s your secret data!`, user });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
