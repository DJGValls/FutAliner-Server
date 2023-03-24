const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { isAuthenticated } = require("../middlewares/auth.middlewares");
const User = require("../models/User.model");

// POST "/api/user/create-user" => create new user
router.post("/create-user", async (req, res, next) => {
  const { firstName, lastName, nickName, email, password1, password2 } =
    req.body;

  // No fields are empty
  if (!firstName || !lastName || !email || !password1 || !password2) {
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
      return res.status(400).json({ errorMessage: "El usuario ya existe" });
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
    return res.status(201).json(createdUser);
  } catch (error) {
    next(error);
  }
});

// GET "/user/user"
router.get("/user", isAuthenticated, async (req, res, next) => {
  try {
    const foundUser = await User.findById(req.payload._id);
    console.log(req.payload);
    res.status(200).json(foundUser);
  } catch (error) {
    next(error);
  }
});

// PATCH "/user/edit-names"
router.patch("/edit-names", isAuthenticated, async (req, res, next) => {
  const { firstName, lastName, nickName } = req.body;

  try {
    const updatesNames = await User.findByIdAndUpdate(
      req.payload._id,
      {
        firstName,
        lastName,
        nickName,
      },
      { new: true }
    );
    res.status(200).json(updatesNames);
  } catch (error) {
    next(error);
  }
});

// PATCH "/user/edit-email"
router.patch("/edit-email", isAuthenticated, async (req, res, next) => {
  const { email } = req.body;

  try {
    const foundEmail = await User.findOne({ email: email });
    if (foundEmail) {
      return res.status(400).json({ errorMessage: "El Email ya está en uso" });
    }
    const updateEmail = await User.findByIdAndUpdate(
      req.payload._id,
      {
        email,
      },
      {
        new: true,
      }
    );
    res.status(200).json(updateEmail);
  } catch (error) {
    next(error);
  }
});

// PATCH "/user/edit-password"
router.patch("/edit-password", isAuthenticated, async (req, res, next) => {
  const { password1, password2 } = req.body;

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
    // Encrypt password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password1, salt);

    await User.findByIdAndUpdate(req.payload._id, {
      password: hashedPassword,
    });

    res.status(200).json();
  } catch (error) {
    next(error);
  }
});

// PATCH "/user/edit-image"
router.patch("/:userId/edit-image", isAuthenticated, async (req, res, next) => {
  const { image } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.payload._id,
      {
        image,
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// DELETE "/user/delete"
router.delete("/delete", isAuthenticated, async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.payload._id);
    res.status(200).json();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
