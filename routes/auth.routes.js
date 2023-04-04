const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middlewares/auth.middlewares");
const User = require("../models/User.model");

// POST "/api/auth/login" => validate user credentials
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  // No fields are empty
  if (!email || !password) {
    return res
      .status(400)
      .json({ errorMessage: "Todos los campos deben estar completos" });
  }
  try {
    // user exist in DB
    const foundUser = await User.findOne({ email: email });
    if (!foundUser) {
      return res.status(400).json({ errorMessage: "error de credenciales" });
    }

    // Password is correct
    const isPasswordCorrect = await bcrypt.compare(
      password,
      foundUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ errorMessage: "Error de credenciales" });
    }
    const payload = {
      _id: foundUser._id,
      firstName: foundUser.firstName,
      lastName: foundUser.lastName,
      nickName: foundUser.nickName,
      email: foundUser.email,
      players: foundUser.players,
      password: foundUser.password,
    };

    // Generate token
    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "1h",
    });
    res.status(200).json({ authToken: authToken });
  } catch (error) {
    next(error);
  }
});

// GET "/api/auth/verify" => Verify if user is active
router.get("/verify", isAuthenticated, (req, res, next) => {
  res.status(200).json(req.payload);
});

module.exports = router;
