const router = require("express").Router();

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

// Auth routes
const authRoutes = require("./auth.routes");
router.use("/auth", authRoutes);

// User routes
const userRoutes = require("./user.routes");
router.use("/user", userRoutes);

// Player routes
const playerRoutes = require("./player.routes");
router.use("/player", playerRoutes);

module.exports = router;
