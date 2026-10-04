require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

// Usage: node seed/makeAdmin.js someone@email.com
const makeAdmin = async () => {
    const email = process.argv[2];

    if (!email) {
        console.log("Please give an email. Example: node seed/makeAdmin.js manjula@test.com");
        process.exit(1);
    }

    await connectDB();

    const user = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { role: "admin" },
        { returnDocument: "after" }
    );

    if (!user) {
        console.log(`No user found with email ${email}`);
    } else {
        console.log(`${user.name} (${user.email}) is now an admin`);
    }

    await mongoose.disconnect();
};

makeAdmin().catch((error) => {
    console.error("Failed:", error.message);
    process.exit(1);
});