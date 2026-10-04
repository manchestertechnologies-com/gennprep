const express = require("express");
const protect = require("../middleware/auth");
const {
    addBookmark,
    removeBookmark,
    listBookmarks,
} = require("../controllers/bookmarkController");

const router = express.Router();

router.use(protect);

router.post("/", addBookmark);
router.get("/", listBookmarks);
router.delete("/:questionId", removeBookmark);

module.exports = router;