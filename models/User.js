const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: String,
  account: {
    username: String,
  },
  newsletter: Boolean,
  token: String,
  hash: String,
  salt: String,
});
module.exports = User;

// avatar: Object, // nous verrons plus tard comment uploader une image
