const express = require("express");
const protect = require("../middleware/auth");
const { listTests, startTest } = require("../controllers/testController");

const router = express.Router();

// Students must be logged in
router.use(protect);

router.get("/", listTests); // GET  /api/tests?examId=...
router.post("/:id/start", startTest); // POST /api/tests/:id/start

module.exports = router;
