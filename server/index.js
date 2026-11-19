// Starts the server on your computer (npm run dev / npm start) or on Render.
// On Vercel this file is not used — see api/index.js in the project root.
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

for (const key of ["MONGO_URI", "JWT_SECRET"]) {
    if (!process.env[key]) {
        console.error(`Missing environment variable: ${key}`);
        process.exit(1);
    }
}

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
