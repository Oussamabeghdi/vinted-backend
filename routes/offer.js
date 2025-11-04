const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");

const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = require("../utils/convertToBase64");

const User = require("../models/User");
const Offer = require("../models/Offer");
const stripe = require("stripe")(process.env.REACT_APP_STRIPE_TOKEN);

router.post("/offer/publish", isAuthenticated, fileUpload(), async (req, res) => {
  try {
    const { title, description, price, condition, city, brand, size, color } = req.body;

    const picture = req.files.picture;
    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        {
          MARQUE: brand,
        },
        {
          TAILLE: size,
        },
        {
          ÉTAT: condition,
        },
        {
          COULEUR: color,
        },
        {
          EMPLACEMENT: city,
        },
      ],
      owner: req.user,
      username: req.user.account.username,
    });

    const result = await cloudinary.uploader.upload(convertToBase64(picture));

    newOffer.product_image = result;

    await newOffer.save();

    //J'utilise populate pour ajouter des informations sur le propriétaire dans la réponse,
    // mais seulement la partie 'account' pour éviter d'exposer des données sensibles.
    const response = await Offer.findById(newOffer._id).populate("owner", "account");
    console.log(response);

    // On renvoie l'offre nouvellement créée au client en format JSON
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// res.json(newOffer);
// Route pour récupérer toutes les offres
router.get("/offers", async (req, res) => {
  try {
    const offers = await Offer.find();

    const response = { offers };

    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route pour récupérer une offre spécifique en fonction de l'ID
router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate("owner", "account");
    res.json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Route pour gérer le paiement
// router.post("/payment", async (req, res) => {

//   const { stripeToken, title, amount, email, items } = req.body;

//   const response = await stripe.charges.create({

//     amount,
//     currency: "eur",
//     description: title,
//     source: stripeToken,
//   });

//   res.json(response);
// });
// router.post("/payment", async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

//     const token = authHeader.split(" ")[1];

//     const user = await User.findOne({ token });
//     if (!user) return res.status(401).json({ message: "Unauthorized" });
//     const { stripeToken, title, amount, items } = req.body;

//     const response = await stripe.charges.create({
//       amount,
//       currency: "eur",
//       description: title,
//       source: stripeToken,
//     });

//     if (response.status === "succeeded") {
//       res.json({ success: true, message: "Paiement réussi" });

//       (async () => {
//         try {
//           const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//               user: process.env.SMTP_USER,
//               pass: process.env.SMTP_PASS,
//             },
//           });
//           const htmlContent = `
//         <h2>Paiement confirmé ✅</h2>
//         <p>Merci pour votre achat sur <strong>Vinted-cloné</strong>.</p>
//         <h4>Détails de la commande :</h4>
//         <ul>
//           ${
//             items && items.length > 0
//               ? items
//                   .map((item) => `<li>${item.name || "Produit"} - ${item.price || 0} €</li>`)
//                   .join("")
//               : "<li>Aucun détail de produit</li>"
//           }
//         </ul>
//         <p><strong>Total payé :</strong> ${(amount / 100).toFixed(2)} €</p>
//       `;

//           await transporter.sendMail({
//             from: `"Vinted_clone" <${process.env.SMTP_USER}>`,
//             to: user.email,
//             subject: "Confirmation de votre paiement",
//             html: htmlContent,
//           });
//         } catch (mailError) {
//           console.error("Erreur lors de l'envoi de l'email :", mailError.message);
//         }
//       })().catch((err) => console.error("Erreur interne email async :", err.message));
//     } else {
//       return res.status(400).json({ success: false, message: "Échec du paiement." });
//     }
//   } catch (error) {
//     console.error("Erreur lors du paiement :", error.message);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// });
router.post("/payment", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    const user = await User.findOne({ token });
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { stripeToken, title, amount, items } = req.body;

    const charge = await stripe.charges.create({
      amount,
      currency: "eur",
      description: title,
      source: stripeToken,
    });

    if (charge.status !== "succeeded") {
      return res.status(400).json({ success: false, message: "Échec du paiement." });
    }

    res.status(200).json({ success: true, message: "Paiement réussi" });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlContent = `
      <h2>Paiement confirmé ✅</h2>
      <p>Merci pour votre achat sur <strong>Vinted-cloné</strong>.</p>
      <h4>Détails de la commande :</h4>
      <ul>
        ${
          items?.length
            ? items
                .map((item) => `<li>${item.name || "Produit"} - ${item.price || 0} €</li>`)
                .join("")
            : "<li>Aucun détail de produit</li>"
        }
      </ul>
      <p><strong>Total payé :</strong> ${(amount / 100).toFixed(2)} €</p>
    `;

    transporter
      .sendMail({
        from: `"Vinted_clone" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Confirmation de votre paiement",
        html: htmlContent,
      })
      .then(() => console.log("✅ Email de confirmation envoyé à", user.email))
      .catch((mailError) => console.error("Erreur lors de l'envoi du mail :", mailError.message));
  } catch (error) {
    console.error("Erreur lors du paiement :", error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

module.exports = router;
