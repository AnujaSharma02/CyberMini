const express = require("express");
const bcrypt = require("bcryptjs");
const jwt= require("jsonwebtoken");
const User = require("../models/User");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

//Signup
router.post("/signup",async(req, res) => {
    try{
        const{ name, email, password } = req.body;

        //Check if user exists
        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(400).json({message: "User already exists"});

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Save user
        const user = await User.create({name, email, password: hashedPassword });

        res.status(201).json({message: "User created successfully"});

    }catch(error){
        res.status(500).json({message: " Server error", error:error.message});
    }
});

//Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //Check user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    //Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    //Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get user profile
router.get("/profile", authenticateUser, async (req, res) => {
  res.json(req.user); // user is attached by middleware
});

// Update user profile
router.put("/profile", authenticateUser, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports =router;