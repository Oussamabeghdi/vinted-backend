const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");

const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = require("../utils/convertToBase64");

const Offer = require("../models/Offer");
const stripe = require("stripe")(process.env.REACT_APP_STRIPE_TOKEN);

router.post("/offer/publish", isAuthenticated, fileUpload(), async (req, res) => {
  try {
    const { title, description, price, condition, city, brand, size, color } = req.body;

    const picture = req.files.picture;
    // Création d'une nouvelle instance de l'offre avec les détails fournis
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

    // On récupère l'image envoyée dans les fichiers de la requête

    // On envoie l'image à Cloudinary pour l'héberger, après l'avoir convertie en base64
    const result = await cloudinary.uploader.upload(convertToBase64(picture));

    // Ajout de l'image au nouvel objet de l'offre
    newOffer.product_image = result;

    // Sauvegarde de la nouvelle offre dans la base de données
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
    // Recherche toutes les offres dans la base de données
    const offers = await Offer.find();

    const response = {
      offers,
    };
    // Envoi de la réponse au client en format JSON
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route pour récupérer une offre spécifique en fonction de l'ID
router.get("/offer/:id", async (req, res) => {
  try {
    console.log(req.params);
    // Recherche de l'offre par son ID et récupération des détails du propriétaire

    const offer = await Offer.findById(req.params.id).populate("owner", "account");
    res.json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Route pour gérer le paiement
router.post("/payment", async (req, res) => {
  // Récupération des informations du corps de la requête

  const { stripeToken, title, amount } = req.body;

  // Création de la transaction via Stripe
  const response = await stripe.charges.create({
    //Montant à prélever
    amount,
    // Devise utilisée pour le paiement
    currency: "eur",
    // Description du paiement (généralement le titre de l'offre)
    description: title,
    // Token Stripe permettant d'authentifier la transaction
    source: stripeToken,
  });

  res.json(response);
});

module.exports = router;
