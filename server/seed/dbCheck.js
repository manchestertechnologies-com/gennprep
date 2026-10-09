require("dns").setServers(["8.8.8.8", "1.1.1.1"]); // fixes Jio Wi-Fi database lookup
// Finds out WHY the database won't connect (never prints your password)
require("dotenv").config();
const mongoose = require("mongoose");
const name = Object.keys(process.env).find((k) => String(process.env[k]).startsWith("mongodb"));
if (!name) { console.log("No mongodb link found in .env"); process.exit(); }
const uri = process.env[name];
console.log("Using", name, "-> host:", uri.split("@")[1]?.split("/")[0]);
mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 })
  .then(() => { console.log("CONNECTED OK"); process.exit(); })
  .catch((e) => {
    console.log("FAILED:", e.name);
    const servers = e.reason?.servers;
    if (servers) for (const [host, s] of servers) console.log(" -", host, "=>", s.error ? String(s.error.message).slice(0, 200) : s.type);
    else console.log(String(e.message).slice(0, 300));
    process.exit();
  });