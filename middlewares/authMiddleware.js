// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const VerifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token, access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Agar admin hai to DB check skip
    if (decoded.role === "admin") {
      req.user = decoded; 
      return next();
    }

    // Agar user hai to DB se nikaalo
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

export const VerifyAdmin = (req, res, next) => {
  VerifyToken(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied, Admins only" });
    }
    next();
  });
};
