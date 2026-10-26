const express = require("express");
const protect = require("../middleware/auth");
const { getDashboard } = require("../controllers/progressController");
const { getAnalytics } = require("../controllers/analyticsController");
const { getHistory } = require("../controllers/historyController");

const router = express.Router();

router.use(protect);

router.get("/dashboard", getDashboard);
router.get("/analytics", getAnalytics);
router.get("/history", getHistory); // practice / mock test results with subject and chapter marks

module.exports = router;