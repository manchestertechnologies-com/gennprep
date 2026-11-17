
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

const {
    securityHeaders,
    rateLimit,
    apiNotFound,
    errorHandler
} = require("./middleware/security");

// Check required environment variables
for (const key of ["MONGO_URI", "JWT_SECRET"]) {
    if (!process.env[key]) {
        console.error(`Missing environment variable: ${key}`);
        process.exit(1);
    }
}

const app = express();
const PORT = process.env.PORT || 5000;

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(securityHeaders);
app.use(express.json({ limit: "5mb" }));

// Health check
app.get("/", (req, res) => {
    res.send("GenPrep API is running. Try /api/health");
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "GenPrep server is running"
    });
});

// Authentication rate limits
const authLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: "Too many attempts. Please wait 15 minutes and try again."
});

app.use("/api/auth/login", authLimit);
app.use("/api/auth/register", authLimit);
app.use("/api/auth/forgot-password", authLimit);
app.use("/api/auth/reset-password", authLimit);

// General API rate limit
app.use("/api", rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    message: "Too many requests. Please slow down for a minute."
}));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api", examRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/tests", testRoutes);

// Error handling
app.use("/api", apiNotFound);
app.use(errorHandler);

// Connect database before starting server
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`GenPrep server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start GenPrep server:", error.message);
        process.exit(1);
    }
};

startServer();
