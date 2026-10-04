const express = require("express");
const protect = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const {
    createQuestion,
    listQuestions,
    getQuestion,
    updateQuestion,
    deleteQuestion,
} = require("../controllers/questionController");

const router = express.Router();

// Every route in this file needs: logged in AND admin
router.use(protect, isAdmin);

router.post("/questions", createQuestion);
router.get("/questions", listQuestions);
router.get("/questions/:id", getQuestion);
router.put("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);

module.exports = router;