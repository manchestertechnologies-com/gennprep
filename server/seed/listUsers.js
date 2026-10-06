require("dotenv").config();
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await mongoose.connection.db
    .collection("users")
    .find({}, { projection: { name: 1, email: 1, role: 1 } })
    .toArray();
  console.log("All accounts (" + users.length + "):");
  users.forEach((u) => console.log("  " + (u.role || "student").padEnd(8) + u.email + "   (" + u.name + ")"));
  process.exit(0);
}).catch((err) => { console.log("Error: " + err.message); process.exit(1); });