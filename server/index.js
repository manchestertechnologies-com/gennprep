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
const testRoutes = require("./routes/testRoutes");
const { securityHeaders, rateLimit, apiNotFound, errorHandler } = require("./middleware/security");

// Stop early with a clear message if a required setting is missing
for (const key of ["MONGO_URI", "JWT_SECRET"]) {
    if (!process.env[key]) {
        console.error(`Missing setting ${key}. Add it to .env (or the Render Environment page).`);
        process.exit(1);
    }
}

const app = express();
const PORT = process.env.PORT || 5000;

app.disable("x-powered-by");
app.set("trust proxy", 1); // Render and Vercel sit in front of the server
app.use(securityHeaders);
app.use(express.json({ limit: "5mb" }));

app.get("/", (req, res) => {
    res.send("GenPrep API is running. Try /api/health");
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "GenPrep server is running" });
});

// Limits: password guessing on login / sign-up / reset, and a general ceiling per address
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: "Too many attempts. Please wait 15 minutes and try again." });
app.use("/api/auth/login", authLimit);
app.use("/api/auth/register", authLimit);
app.use("/api/auth/forgot-password", authLimit);
app.use("/api/auth/reset-password", authLimit);
app.use("/api", rateLimit({ windowMs: 60 * 1000, max: 300, message: "Too many requests. Please slow down for a minute." }));

app.use("/api/auth", authRoutes);
app.use("/api", examRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/tests", testRoutes);

app.use("/api", apiNotFound);
app.use(errorHandler);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
