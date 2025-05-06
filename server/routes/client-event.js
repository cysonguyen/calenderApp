const express = require("express");

const { User } = require("../models");
const SSEService = require("../lib/sseService");

const router = express.Router();

router.get("/register", async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    SSEService.addClient(userId, res);

    res.write("data: Connected successfully\n\n");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;