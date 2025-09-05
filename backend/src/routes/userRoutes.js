const express = require("express");
const router = express.Router();
const { registerUser, loginUser, updateUserProfile } = require("../controllers/userController");
const authenticateUser = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/profile", authenticateUser, updateUserProfile);

module.exports = router;
