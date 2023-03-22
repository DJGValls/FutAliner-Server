const { isAuthenticated } = require("../middlewares/auth.middlewares");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");

// POST "/api/auth/create-user" => create new user
router.post("/create-user", async (req, res, next) => {
  const { firstName, lastName, nickName, email, password1, password2 } =
    req.body;

  // No fields are empty
  if (
    !firstName ||
    !lastName ||
    !email ||
    !nickName ||
    !password1 ||
    !password2
  ) {
    return res
      .status(400)
      .json({ errorMessage: "Todos los campos deben estar completos" });
  }

  // Passwords match
  if (password1 !== password2) {
    return res
      .status(400)
      .json({ errorMessage: "El password ha de ser igual" });
  }

  // Password is secure
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;
  if (passwordRegex.test(password1) === false) {
    return res.status(400).json({
      errorMessage:
        "El password debe tener al menos 6 caracteres, incluir una mayuscula y un caracter especial",
    });
  }
  try {
    // Email does not exist in DB
    const foundEmail = await User.findOne({ email: email });
    if (foundEmail) {
      return res.status(400).json({ errorMessage: "El mail está en uso" });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password1, salt);

    // Create User
    const createdUser = await User.create({
      firstName,
      lastName,
      nickName,
      email,
      password: hashedPassword,
    });
  } catch (error) {
    next(error);
  }
});

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
