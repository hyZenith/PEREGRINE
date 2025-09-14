// require('dotenv').config(); 
const User = require('../models/User.js');
let jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// REGISTER
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        // Generate JWT
        const token = jwt.sign(
            { userId: newUser._id, name: newUser.name },
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        return res.status(201).json({ message: "User registered successfully", token });

    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ message: "Server error during registration" });
    }
};

// LOGIN
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
  


        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, name: user.name },
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        return res.status(200).json({ message: "Login successful", token });

    } catch (error) {
        console.error('Error logging in user:', error);
        return res.status(500).json({ message: 'Server error during login.' });
    }
};

module.exports = { registerUser, loginUser };
