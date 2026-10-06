require("dotenv").config();
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const admins = await mongoose.connection.db
    .collection("users")
    .find({ role: "admin" }, { projection: { name: 1, email: 1 } })
    .toArray();
  console.log("Admin accounts:");
  admins.forEach((a) => console.log("  " + a.name + "  ->  " + a.email));
  if (admins.length === 0) console.log("  (none found)");
  process.exit(0);
}).catch((err) => { console.log("Error: " + err.message); process.exit(1); });