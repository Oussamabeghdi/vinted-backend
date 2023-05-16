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
      console.log(username);
      newOffer.product_image = result;
      await newOffer.save();
      //On populate la clé owner et on affiche seulement la clé account
      const response = await Offer.findById(newOffer._id).populate(
        "owner",
        "account"
      );
      console.log(response);
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

// const results = await Offer.find({
//   product_name: /vert/i,
//   product_price: { $gte: 20, $lte: 200 },
// })
//   .sort({ product_price: -1 || 1 })
//   .select("product_name product_price");

// const regExp = /jeans/i;
// const results = await Offer.find({
//   product_name: /jeans/i,
//   product_price: { $lte: 200 },
// });

// res.json(offers);
// res.json(response);

//Pour chercher un prix compris entre 40 et 200

// const regExp1 = /[A-Za-z0-9_|\s]/g;
// const results1 = await Offer.find({
//   product_name: regExp1,
//   product_price: { $gte: 40, $lte: 200 },
// });

//Pour afficher la deuxieme page

//const result = await Offer.find().skip(5).limit(5);
//console.log
// ("ok");
//res.json
// (result);
//router.get
// ("/offers", async (req, res) => {
// FIND
//   const regExp = /chaussettes/i;
//   const regExp = new RegExp("e", "i");
//   const results = await Offer.find({ product_name: regExp }).select(
//     "product_name product_price"
//   );

//   FIND AVEC FOURCHETTES DE PRIX
//   $gte =  greater than or equal >=
//   $lte = lower than or equal <=
//   $lt = lower than <
//   $gt = greater than >
//   const results = await Offer.find({
//     product_price: {
//       $gte: 55,
//       $lte: 200,
//     },
//   }).select("product_name product_price");

//   SORT
//   "asc" === "ascending" === 1
//   "desc" === "descending" === -1
//   const results = await Offer.find()
//     .sort({ product_price: -1 })
//     .select("product_name product_price");

//   ON PEUT TOUT CHAINER
// const results = await Offer.find({
//   product_name: /vert/i,
//   product_price: { $gte: 20, $lte: 200 },
// })
//   .sort({ product_price: -1 })
//   .select("product_name product_price");

//   SKIP ET LIMIT
//   const results = await Offer.find()
//     .skip(10)
//     .limit(5)
//     .select("product_name product_price");
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

  // TODO
  // Sauvegarder la transaction dans une BDD MongoDB

  res.json(response);
});

module.exports = router;
