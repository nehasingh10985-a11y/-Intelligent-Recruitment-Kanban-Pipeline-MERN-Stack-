module.exports = function (roles) {
  // Roles ko hamesha array mein convert karein (Flexibility ke liye)
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    // 1. Safety Check: Agar req.user undefined hai (auth middleware miss hone par)
    if (!req.user || !req.user.role) {
      return res.status(401).json({ msg: "Unauthorized: User role not found" });
    }

    // 2. Role Verification
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        msg: `Access denied. Your role (${req.user.role}) is not authorized.`,
      });
    }

    next();
  };
};
