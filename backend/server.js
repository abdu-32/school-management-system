const express = require("express");
const newLocal = require("mongoose");
const mongoose = newLocal;
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const subjectRoutes = require("./routes/subjects");
const gradeRoutes = require("./routes/grades");
const markRoutes = require("./routes/marks");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(
  process.env.MONGODB_URI ||
    "mongodb+srv://abdulhalimaliyi54:61mOPox30UEZYyxK@cluster0.xtqspa5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.log("MongoDB connection error:", err);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/marks", markRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is healthy" });
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
