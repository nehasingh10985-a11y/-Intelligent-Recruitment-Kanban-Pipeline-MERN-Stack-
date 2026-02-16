const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const auth = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    console.log("Header Received:", authHeader); // 👈 Terminal check karein

    if (!authHeader) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    // "Bearer <token>" se sirf token nikalne ka sabse sahi tarika
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({ msg: "Token missing after Bearer" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};
console.log("Current Secret in Middleware:", JWT_SECRET);

module.exports = auth;
