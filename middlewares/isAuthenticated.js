const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    console.log("je rentre dans mon middleware");

    //   console.log(req.headers.authorization);
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = req.headers.authorization.replace("Bearer ", "");

    // console.log(token);
    const user = await User.findOne({ token: token }).select("account");
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized Authenticated" });
    }
    req.user = user;

    next();
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error);
  }
};
module.exports = isAuthenticated;
