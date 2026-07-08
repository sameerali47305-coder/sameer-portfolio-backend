const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");

dotenv.config();

connectDB();

const app = express();

// Allow the deployed frontend (CLIENT_URL) plus localhost for dev.
// If CLIENT_URL isn't set yet, fall back to allowing all origins so
// the app still works out of the box.
const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"].filter(
  Boolean
);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.get("/", (req, res) => {
  res.send("Backend is Running...");
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
