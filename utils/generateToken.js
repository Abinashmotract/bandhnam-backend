import jwt from 'jsonwebtoken';

// export const generateAccessToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
// };

// export const generateRefreshToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
// };

// yahan payload object hoga (id, role, email, etc.)
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};
