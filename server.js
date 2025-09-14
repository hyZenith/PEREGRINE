require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const connectDB = require('./db/db');
const {registerUser, loginUser} = require('../src/controllers/authController.js')
let jwt = require('jsonwebtoken');

// middleware to parse JSON
app.use(express.json());

//connect to database
connectDB();

console.log("JWT_SECRET:", process.env.JWT_SECRET);

app.post('/register', registerUser);
app.post('/login', loginUser)

app.get('/', (req, res) => {
  res.send("server is running")
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});