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

// Team routes
const teamRoutes = require("./team.routes");
router.use("/team", teamRoutes);

// Images upload routes
const imagesRoutes = require("./upload.routes");
router.use("/upload", imagesRoutes);

module.exports = router;
