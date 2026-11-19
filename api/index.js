// Vercel serverless function: every /api/... request is sent here
// (see the rewrite in vercel.json) and handled by the Express app.
module.exports = require("../server/app");
