
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // mongodb connection 
    const connection = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process if connection fails
  }
};

module.exports = connectDB;
