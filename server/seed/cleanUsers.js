require("dotenv").config();
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");

const KEEP = ["pallavids359@gmail.com", "nithyashreeds14@gmail.com"];
const reallyDelete = process.argv[2] === "yes";

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection("users").find({ email: { $nin: KEEP } }, { projection: { email: 1, name: 1 } }).toArray();
  const kept = await db.collection("users").find({ email: { $in: KEEP } }, { projection: { email: 1, role: 1 } }).toArray();

  console.log("KEEPING:");
  kept.forEach((u) => console.log("  " + u.role.padEnd(8) + u.email));
  console.log("DELETING (" + users.length + "):");
  users.forEach((u) => console.log("  " + u.email + "   (" + u.name + ")"));

  if (kept.length !== KEEP.length) { console.log("Stopped: could not find both accounts to keep."); process.exit(1); }
  if (!reallyDelete) { console.log("\nNothing deleted yet. To delete, run:  node seed\\cleanUsers.js yes"); process.exit(0); }

  const ids = users.map((u) => u._id);
  const emails = users.map((u) => u.email);
  const r1 = await db.collection("testattempts").deleteMany({ userId: { $in: ids } });
  const r2 = await db.collection("progresses").deleteMany({ userId: { $in: ids } });
  const r3 = await db.collection("bookmarks").deleteMany({ userId: { $in: ids } });
  const r4 = await db.collection("otps").deleteMany({ email: { $in: emails } });
  const r5 = await db.collection("users").deleteMany({ _id: { $in: ids } });
  console.log("\nDeleted: " + r5.deletedCount + " accounts, " + r1.deletedCount + " test attempts, " +
    r2.deletedCount + " progress records, " + r3.deletedCount + " bookmarks, " + r4.deletedCount + " OTPs.");
  process.exit(0);
}).catch((err) => { console.log("Error: " + err.message); process.exit(1); });