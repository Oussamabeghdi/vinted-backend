const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");

const Offer = require("../models/Offer");
const convertToBase64 = require("../utils/convertToBase64");
const isAuthenticated = require("../middlewares/isAuthenticated");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      // console.log("Je rentre dans ma route");
      console.log(req.user);
      //   console.log(req.body);
      console.log(req.files);
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      //   console.log(result);
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
        // product_image: result,
        owner: req.user,
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
      console.log(newOffer);
      res.json(response);
      res.json(newOffer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    //Pour chercher un pantalon prix max 200
    const { title, priceMin, priceMax, sort, page } = req.query;
    const a = Number(req.query);
    console.log(a);
    const filters = {};
    if (title) {
      filters.product_name = new regExp(title, "i");
    }
    if (priceMin) {
      filters.product_price = { $gte: Number(priceMin) };
    }
    if (priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(priceMax);
      } else {
        filters.product_price = { $lte: Number(priceMax) };
      }
    }

    const sortFilter = {};
    if (sort === "price-asc") {
      sortFilter.product_price = "asc"; // ou 1 ou "ascending"
    } else if (sort === "price-desc") {
      sortFilter.product_price = "desc"; // ou -1 ou "descending"
    }
    const limit = 5;

    let pageRequired = 1;
    if (page) pageRequired = Number(page);

    //                        0*5   =0  1*5   =5  2*5   =10  3*5   =15
    // 5 résultats par page : 1 skip=0, 2 skip=5, 3 skip=10, 4 skip=15
    // 3 résultats par page : 1 skip=0, 2 skip=3, 3 skip=6, 4 skip=9

    const skip = (pageRequired - 1) * limit;

    const offers = await Offer.find(filters)
      .sort(sortFilter)
      .skip(skip)
      .limit(limit)
      .populate("owner", "account");
    // .select("product_price product_name");

    const count = await Offer.countDocuments(filters);

    const response = {
      count: count,
      offers: offers,
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
//console.log("ok");
//res.json(result);
//router.get("/offers", async (req, res) => {
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
