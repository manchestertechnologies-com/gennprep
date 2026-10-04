const express = require("express");
const protect = require("../middleware/auth");
const {
    startPractice,
    submitAttempt,
    getAttempt,
} = require("../controllers/attemptController");
const {
    startWrongAnswerPractice,
    startBookmarkPractice,
} = require("../controllers/revisionController");

const router = express.Router();

router.use(protect);

router.post("/practice", startPractice);
router.post("/wrong-answers", startWrongAnswerPractice);
router.post("/bookmarks", startBookmarkPractice);
router.post("/:id/submit", submitAttempt);
router.get("/:id", getAttempt);

module.exports = router;