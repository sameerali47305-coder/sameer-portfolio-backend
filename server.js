const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 3001;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Failed to start server:", err.message);
    process.exit(1);
  });