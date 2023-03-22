const { expressjwt } = require("express-jwt");

const isAuthenticated = expressjwt({
  secret: process.env.TOKEN_SECRET,
  algorithms: ["HS256"],
  requestProperty: "payload",
  getToken: (req) => {
    if (!req.headers || !req.headers.authorization) {
      return null;
    }
    const tokenArr = req.headers.authorization.split(" ");
    const tokenType = tokenArr[0];
    const token = tokenArr[1];

    if (tokenType !== "Bearer") {
      return null;
    }

    return token;
  },
});

const isCapitan = (req, res, next) => {
  req.payload.role === "capitan"
    ? next()
    : res.status(401).json({ message: "no es user" });
};

module.exports = {
  isAuthenticated,
  isCapitan,
};
