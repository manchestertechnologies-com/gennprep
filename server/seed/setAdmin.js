require("dotenv").config();
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");

const email = (process.argv[2] || "").trim().toLowerCase();
if (!email.includes("@")) { console.log("Please give an email."); process.exit(1); }

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const result = await mongoose.connection.db
    .collection("users")
    .updateOne({ email }, { $set: { role: "admin" } });
  if (result.matchedCount === 0) console.log("No account with " + email + ". Sign up on the website first.");
  else console.log("Done! " + email + " is now an admin.");
  process.exit(0);
}).catch((err) => { console.log("Error: " + err.message); process.exit(1); });