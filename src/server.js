require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const sequelize = require("./config/database");

// Import models for database sync
require("./models/User");
require("./models/Otp");

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "your-production-domain"
        : "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something broke!" });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    if (process.env.NODE_ENV === "development") {
      // Suppress sync logging
      await sequelize.sync({ alter: true, logging: false });
    }
    app.listen(PORT, () => {
      console.clear(); // Clear previous console output
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start");
    process.exit(1);
  }
}

startServer();
