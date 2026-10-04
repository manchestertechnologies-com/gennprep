const express = require("express");
const protect = require("../middleware/auth");
const { getDashboard } = require("../controllers/progressController");

const router = express.Router();

router.use(protect);

router.get("/dashboard", getDashboard);

module.exports = router;