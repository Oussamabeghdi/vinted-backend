const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const stripe = require("stripe")(
  "sk_test_51MbOiLFHbYk9rQIzdQKFT2eAtGMX2BV1Jzw28CcDc3FCfApVWp5HOcrvL6xNYEgFQbwMy0hQGvbmXyElVfqlLe5s00uKHjfgHf"
);
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URI);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const offerRoutes = require("./routes/offer");
const userRoutes = require("./routes/user");
app.use(userRoutes);
app.use(offerRoutes);

app.get("/", (req, res) => {
  res.json("Test de mon serveur");
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "This route doesn't exist" });
});
app.listen(process.env.PORT, () => {
  console.log("Server started");
});
