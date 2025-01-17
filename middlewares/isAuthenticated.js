// Importation du modèle User pour interagir avec
// la collection des utilisateurs dans la base de données
const User = require("../models/User");

// Middleware d'authentification pour vérifier si l'utilisateur est authentifié
const isAuthenticated = async (req, res, next) => {
  try {
    console.log("je rentre dans mon middleware");

    // Vérification de la présence du header Authorization dans la requête
    if (!req.headers.authorization) {
      // Si le header Authorization n'est pas présent,
      // on renvoie une réponse 401 (non autorisé)
      return res.status(401).json({ message: "Unauthorized" });
    }
    // Extraction du token à partir du header Authorization
    // puis (on retire "Bearer " de la chaîne)
    const token = req.headers.authorization.replace("Bearer ", "");

    // Rechercher un utilisateur correspondant au token
    //  fourni dans la base de données
    const user = await User.findOne({ token: token }).select("account");
    console.log(user.account.username);

    // Si aucun utilisateur n'est trouvé avec ce token,
    // on renvoie une réponse 401 (non autorisé)
    if (!user) {
      return res.status(401).json({ message: "Unauthorized Authenticated" });
    }
    // Si l'utilisateur est trouvé, on l'ajoute à la requête
    // pour y avoir accès dans les routes suivantes
    req.user = user;
    console.log(user);

    // Appel de la fonction next() pour passer à la prochaine middleware ou route
    next();
  } catch (error) {
    // Si une erreur survient, on renvoie
    // une réponse 400 (erreur de la requête) avec un message d'erreur
    res.status(400).json({ message: error.message });
    console.log(error);
  }
};
module.exports = isAuthenticated;
