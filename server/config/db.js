const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;

        if (!uri) {
            throw new Error("MONGO_URI environment variable is missing");
        }

        console.log("Connecting to MongoDB Atlas...");

        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 15000
        });

        console.log("MongoDB connected successfully!");
        console.log("MongoDB Host:", conn.connection.host);
        console.log("Database Name:", conn.connection.name);

        return conn;

    } catch (error) {
        console.error("MongoDB connection failed!");
        console.error("Error Name:", error.name);
        console.error("Error Code:", error.code || "Not provided");
        console.error("Error Message:", error.message);

        if (error.cause) {
            console.error(
                "Underlying Error:",
                error.cause.message || error.cause
            );
        }

        throw error;
    }
};

module.exports = connectDB;