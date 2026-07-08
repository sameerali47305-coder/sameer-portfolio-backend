const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.log("❌ MongoDB Connection Failed");
    console.log(error.message);
    throw error;
  }
};

module.exports = connectDB;