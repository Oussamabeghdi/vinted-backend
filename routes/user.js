const express = require("express");
const router = express.Router();

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.body;
    //Si username n'existe pas ou si email n'existe pas ou si ......
    if (!email || !password || !username || typeof newsletter !== "boolean") {
      return res.status(400).json({ message: "missing parameters" });
    }
    //Si l'email est deja utilise par quelqu'un d'autre on renvoie une erreur
    const emailAllReadyUsed = await User.findOne({ email: email });
    console.log(emailAllReadyUsed);
    if (emailAllReadyUsed) {
      return res.status(409).json({ message: "email already used" });
    }
    const token = uid2(64);
    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);

    const newUser = new User({
      email,
      account: {
        username,
      },

      newsletter,
      token,
      hash,
      salt,
    });
    await newUser.save();
    const response = {
      _id: newUser._id,
      account: newUser.account,
      token: newUser.token,
    };
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.post("/user/login", async (req, res) => {
  try {
    //console.log(req.body);
    // res.json("ok");
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    //console.log(user);
    const newHash = SHA256(user.salt + password).toString(encBase64);
    //console.log(newHash);
    if (newHash !== user.hash) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json({
      _id: user._id,
      account: user.account,
      token: user.token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
