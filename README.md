# Backend API Documentation

## Auth Routes (`routes/authRoutes.js`)

**Base Path:** `/api/auth`

| Method | Full Route                        | Description                       | Middleware                |
|--------|------------------------------------|-----------------------------------|---------------------------|
| POST   | /api/auth/signup                   | User signup                       | -                         |
| POST   | /api/auth/login                    | User login                        | -                         |
| POST   | /api/auth/refresh-token            | Refresh access token              | -                         |
| POST   | /api/auth/forgot-password          | Forgot password                   | -                         |
| POST   | /api/auth/resend-otp               | Resend OTP                        | -                         |
| POST   | /api/auth/verify-otp               | Verify OTP                        | -                         |
| POST   | /api/auth/reset-password           | Reset password                    | -                         |
| PUT    | /api/auth/user/update/:id          | Update user (with profile image)  | upload.single('profileImage') |
| GET    | /api/auth/user                     | Get user details by ID            | protect                   |

## Admin Routes (`admin/routes/adminRoutes.js`)

> **Note:** These routes are not currently mounted in the codebase. If mounted at `/api/admin`, the full routes would be as follows:

**Assumed Base Path:** `/api/admin`

### Admin Only
| Method | Full Route                        | Description                       | Middleware                |
|--------|------------------------------------|-----------------------------------|---------------------------|
| GET    | /api/admin/users                   | Get all users                     | authMiddleware, checkRole(['admin']) |
| GET    | /api/admin/vendors                 | Get all vendors                   | authMiddleware, checkRole(['admin']) |
| POST   | /api/admin/users/:id/role          | Update user role                  | authMiddleware, checkRole(['admin']) |

### Vendor Only
| Method | Full Route                        | Description                       | Middleware                |
|--------|------------------------------------|-----------------------------------|---------------------------|
| GET    | /api/admin/vendor/users            | Get vendor's users                | authMiddleware, checkRole(['vendor']) |
| GET    | /api/admin/vendor/profile          | Get vendor profile                | authMiddleware, checkRole(['vendor']) |

---

> **Note:** Some routes require authentication and/or specific roles. See the `middlewares/authMiddleware.js` for details. 