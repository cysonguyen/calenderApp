const express = require("express");

const { User } = require("../models");
const SSEService = require("../lib/sseService");

const router = express.Router();

router.get("/register", async (req, res) => {
  try {
    const userID = req.query.userID;

    if (!userID) {
      return res.status(400).json({ message: "Missing userID" });
    }

    const user = await User.findByPk(userID);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    SSEService.addClient(userID, res);

    res.write("data: Connected successfully\n\n");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;