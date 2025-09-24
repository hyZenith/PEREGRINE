const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(mongoURI);
        console.log('MongoDB Connected ');
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;