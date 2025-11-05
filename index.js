const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const stripe = require("stripe")(process.env.REACT_APP_STRIPE_TOKEN);
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: [
      "https://vinted-clone-ob.netlify.app",
      "http://localhost:3001",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
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
app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
