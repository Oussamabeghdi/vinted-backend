const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");

const Offer = require("../models/Offer");

const isAuthenticated = require("../middlewares/isAuthenticated");

//convertToBase64(req.files.pictures[0]);
router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      // console.log("Je rentre dans ma route");
      console.log(req.user);
      //   console.log(req.body);
      //   console.log(req.files);
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
      //   const picture = req.files.picture;
      //   const result = await cloudinary.uploader.upload(convertToBase64(picture));
      //   newOffer.product_image = result;
      await newOffer.save();
      //   const response = await Offer.findById(newOffer._id).populate(
      //     "owner",
      //     "account"
      //   );
      //   console.log(newOffer);
      //   res.json(response);
      res.json(newOffer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;
