const express = require("express");
const sgMail = require("@sendgrid/mail");

const router = express.Router();

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.body;
    if (!email || !password || !username || typeof newsletter !== "boolean") {
      return res.status(400).json({ message: "missing parameters" });
    }
    const emailAllReadyUsed = await User.findOne({ email: email });
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
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const htmlContent = `
        <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
     <div style="background: #f4f4f4; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 5px;">
          <h2 style="color: #09b1ba; margin-top: 0;">Inscription réussi</h2>
            <p>Bonjour ${username},</p>
            <p>Nous avons souhaitons la bienvenue sur notre site. Merci pour votre confiance !</p>
            <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #09b1ba;">
             
            </div>
              
              <p style="margin-top: 30px;">Cordialement,<br><strong>L'équipe Vinted Replique</strong></p>
        </div>
              <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
              Cet email a été envoyé automatiquement</p>
      </div>
    </body>
    </html>
        `;

    const msg = {
      to: email,
      from: process.env.SENDGRID_VERIFIED_SENDER,
      subject: "Confirmation de votre inscription",
      html: htmlContent,
    };

    sgMail
      .send(msg)
      .then(() => console.log("✅ Email de confirmation envoyé à", user.email))
      .catch((mailError) => {
        console.error("Erreur lors de l'envoi du mail :", mailError.message);
        if (mailError.response) {
          console.error(mailError.response.body);
        }
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "Unauthorized" });
    }

    const newHash = SHA256(password + user.salt).toString(encBase64);

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
