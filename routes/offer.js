const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");

const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = require("../utils/convertToBase64");

const Offer = require("../models/Offer");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

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
      const picture = req.files.picture;
      const result = await cloudinary.uploader.upload(convertToBase64(picture));

      newOffer.product_image = result;
      await newOffer.save();
      //On populate la clé owner et on affiche seulement la clé account
      const response = await Offer.findById(newOffer._id).populate(
        "owner",
        "account"
      );

      res.json(response);
      res.json(newOffer);
    } catch (error) {
      //console.log
      error;
      res.status(400).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    const offers = await Offer.find();

    const response = {
      offers,
    };

    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    console.log(req.params);
    const offer = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/payment", async (req, res) => {
  // Réception du token créer via l'API Stripe depuis le Frontend
  const stripeToken = req.body.stripeToken;
  // Créer la transaction
  const response = await stripe.charges.create({
    amount: product_price,

    title: product_name,
    // On envoie ici le token
    source: stripeToken,
  });
  console.log(response.status);

  res.json(response);
});

module.exports = router;
