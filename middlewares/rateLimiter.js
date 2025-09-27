import rateLimit from "express-rate-limit";

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP rate limiter
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 OTP requests per 5 minutes
  message: {
    success: false,
    message: "Too many OTP requests, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Search rate limiter
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 search requests per minute
  message: {
    success: false,
    message: "Too many search requests, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Message rate limiter
export const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 messages per minute
  message: {
    success: false,
    message: "Too many messages sent, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin rate limiter
export const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // limit each IP to 50 admin requests per 5 minutes
  message: {
    success: false,
    message: "Too many admin requests, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
