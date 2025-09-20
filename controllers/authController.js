const User = require('../models/User.js');
let jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;


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
        const newUser = new User({ name, email, password: hashedPassword , isAdmin: false});
        await newUser.save();

        // Generate JWT
        const token = jwt.sign(
            { userId: newUser._id, name: newUser.name , isAdmin:false},
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
        
        // admin login
        let user;
        // if admin login , match with .env credentials
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            user = { _id:'admin', isAdmin: true, name: 'Admin'}
            console.log("admin is logged in")
        } else{
            user = await User.findOne({email});
            if (!user) return res.status(401).json({message: "invalid credentials"});


            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({message: "match did not match"})
        }

        const token = jwt.sign(
            { userId: user._id, name: user.name , isAdmin: user.isAdmin},
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.cookie("token", token);
        return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error('Error logging in user:', error);
        return res.status(500).json({ message: 'Server error during login.' });
    }
};

module.exports = { registerUser, loginUser };
