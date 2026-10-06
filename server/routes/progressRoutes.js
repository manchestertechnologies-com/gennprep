const express = require("express");
const protect = require("../middleware/auth");
const { getDashboard } = require("../controllers/progressController");
const { getAnalytics } = require("../controllers/analyticsController");

const router = express.Router();

router.use(protect);

router.get("/dashboard", getDashboard);
router.get("/analytics", getAnalytics);

module.exports = router;