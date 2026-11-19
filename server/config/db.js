const dns = require("dns");
const mongoose = require("mongoose");

// Some home/ISP DNS servers can't resolve MongoDB Atlas "mongodb+srv" addresses,
// so locally we use Google/Cloudflare DNS. On Vercel the built-in DNS works fine.
if (!process.env.VERCEL) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

// Reuse one connection. On Vercel the same function instance handles many
// requests, so we must not open a new connection every time.
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

const connectDB = async () => {
    if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;

    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI environment variable is missing");

    if (!cached.promise) {
        console.log("Connecting to MongoDB Atlas...");
        cached.promise = mongoose
            .connect(uri, { serverSelectionTimeoutMS: 15000 })
            .then((conn) => {
                console.log("MongoDB connected:", conn.connection.host, "/", conn.connection.name);
                return conn;
            })
            .catch((error) => {
                cached.promise = null; // allow a retry on the next request
                console.error("MongoDB connection failed!");
                console.error("Error Name:", error.name);
                console.error("Error Code:", error.code || "Not provided");
                console.error("Error Message:", error.message);
                if (error.cause) console.error("Underlying Error:", error.cause.message || error.cause);
                throw error;
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

module.exports = connectDB;
