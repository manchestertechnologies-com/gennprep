require("dns").setServers(["8.8.8.8", "1.1.1.1"]); // fixes Jio Wi-Fi database lookup
require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const examRoutes = require("./routes/examRoutes");
const adminRoutes = require("./routes/adminRoutes");
const attemptRoutes = require("./routes/attemptRoutes");
const progressRoutes = require("./routes/progressRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const testRoutes = require("./routes/testRoutes"); // NEW

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "5mb" }));

app.get("/", (req, res) => {
    res.send("ExamPrep AI API is running. Try /api/health");
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "ExamPrep AI server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api", examRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/tests", testRoutes); // NEW

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});