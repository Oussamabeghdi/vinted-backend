const User = require("../models/User");

// Middleware d'authentification pour vérifier si l'utilisateur est authentifié
const isAuthenticated = async (req, res, next) => {
  try {
    console.log("je rentre dans mon middleware");

    // Vérification de la présence du header Authorization dans la requête
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = req.headers.authorization.replace("Bearer ", "");

    const user = await User.findOne({ token: token }).select("account");
    console.log(user.account.username);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized Authenticated" });
    }

    req.user = user;
    console.log(user);

    // Appel de la fonction next() pour passer à la prochaine middleware ou route
    next();
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error);
  }
};
module.exports = isAuthenticated;
