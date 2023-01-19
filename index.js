const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(express.json());

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://localhost/vinted");

cloudinary.config({
  cloud_name: "dpxiwtvcp",
  api_key: "833424533972812",
  api_secret: "71Oi8NSaujw7xV2arHN_Ab9Lx1w",
});

const offerRoutes = require("./routes/offer");
const userRoutes = require("./routes/user");
app.use(userRoutes);
app.use(offerRoutes);
app.all("*", (req, res) => {
  res.status(404).json({ message: "This route doesn't exist" });
});
app.listen(3000, () => {
  console.log("Server started");
});
