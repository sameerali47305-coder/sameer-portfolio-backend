const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

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

module.exports = app;