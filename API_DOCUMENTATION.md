# Bandhnam Nammatch - Complete API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Authentication & User Management

### POST /auth/signup
Create new user account
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "password": "Password123!",
    "confirmPassword": "Password123!",
    "profileFor": "self",
    "gender": "male",
    "agreeToTerms": true
  }'
```

### POST /auth/login
Login with email/phone + password
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@example.com",
    "password": "Password123!"
  }'
```

### POST /auth/logout
Logout and invalidate token
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### POST /auth/refresh-token
Refresh JWT token
```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh-token>"
  }'
```

### POST /auth/forgot-password
Reset password
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

### POST /auth/verify-otp
Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

### POST /auth/reset-password
Reset password with token
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "newPassword": "NewPassword123!",
    "confirmPassword": "NewPassword123!",
    "resetToken": "<reset-token>"
  }'
```

---

## 2. Profile Management

### GET /profiles/list
Get all profiles
```bash
curl -X GET http://localhost:5000/api/profiles/list \
  -H "Authorization: Bearer <token>"
```

### GET /profiles/matches
Get recommended matches
```bash
curl -X GET http://localhost:5000/api/profiles/matches \
  -H "Authorization: Bearer <token>"
```

### GET /profiles/filter
Filter profiles with query parameters
```bash
curl -X GET "http://localhost:5000/api/profiles/filter?ageMin=25&ageMax=35&gender=female&religion=hindu" \
  -H "Authorization: Bearer <token>"
```

### GET /auth/user
Get current user details
```bash
curl -X GET http://localhost:5000/api/auth/user \
  -H "Authorization: Bearer <token>"
```

### PUT /auth/user/update
Update user profile
```bash
curl -X PUT http://localhost:5000/api/auth/user/update \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "occupation": "Software Engineer",
    "location": "Mumbai",
    "about": "Looking for a life partner"
  }'
```

### PUT /auth/user/profile-picture
Update profile picture
```bash
curl -X PUT http://localhost:5000/api/auth/user/profile-picture \
  -H "Authorization: Bearer <token>" \
  -F "profileImage=@/path/to/image.jpg"
```

---

## 3. Search & Matching

### GET /search
Advanced search with filters
```bash
curl -X GET "http://localhost:5000/api/search?ageMin=25&ageMax=35&gender=female&religion=hindu&caste=brahmin&education=graduate&location=mumbai&latitude=19.0760&longitude=72.8777&radius=50&page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

### GET /search/recommendations
Get recommended matches
```bash
curl -X GET "http://localhost:5000/api/search/recommendations?limit=20" \
  -H "Authorization: Bearer <token>"
```

### POST /search/save
Save search filter
```bash
curl -X POST http://localhost:5000/api/search/save \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Search Filter",
    "filters": {
      "ageRange": {"min": 25, "max": 35},
      "gender": ["female"],
      "religion": ["hindu"],
      "location": ["mumbai"]
    }
  }'
```

### GET /search/saved
Get saved search filters
```bash
curl -X GET http://localhost:5000/api/search/saved \
  -H "Authorization: Bearer <token>"
```

### DELETE /search/saved/:filterId
Delete saved search filter
```bash
curl -X DELETE http://localhost:5000/api/search/saved/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer <token>"
```

---

## 4. Interactions

### POST /interactions/like/:userId
Like a profile
```bash
curl -X POST http://localhost:5000/api/interactions/like/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer <token>"
```

### POST /interactions/superlike/:userId
Super like a profile
```bash
curl -X POST http://localhost:5000/api/interactions/superlike/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer <token>"
```

### POST /interactions/favourite/:userId
Add to favourites
```bash
curl -X POST http://localhost:5000/api/interactions/favourite/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer <token>"
```

### DELETE /interactions/favourite/:userId
Remove from favourites
```bash
curl -X DELETE http://localhost:5000/api/interactions/favourite/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer <token>"
```

### POST /interactions/block/:userId
Block a user
```bash
curl -X POST http://localhost:5000/api/interactions/block/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer <token>"
```

### DELETE /interactions/block/:userId
Unblock a user
```bash
curl -X DELETE http://localhost:5000/api/interactions/block/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer <token>"
```

### POST /interactions/report/:userId
Report a user
```bash
curl -X POST http://localhost:5000/api/interactions/report/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reportReason": "inappropriate_content",
    "reportDescription": "User posted inappropriate content"
  }'
```

### GET /interactions/history
Get interaction history
```bash
curl -X GET "http://localhost:5000/api/interactions/history?type=like&page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

### GET /interactions/views
Get who viewed my profile
```bash
curl -X GET "http://localhost:5000/api/interactions/views?page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

### GET /interactions/favourites
Get favourites list
```bash
curl -X GET "http://localhost:5000/api/interactions/favourites?page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

---

## 5. Messaging

### POST /chat/:userId
Send message to a user
```bash
curl -X POST http://localhost:5000/api/chat/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello! How are you?",
    "messageType": "text"
  }'
```

### GET /chat/:userId
Get chat history with a user
```bash
curl -X GET "http://localhost:5000/api/chat/64f8a1b2c3d4e5f6a7b8c9d0?page=1&limit=50" \
  -H "Authorization: Bearer <token>"
```

### GET /chat
Get all chat rooms
```bash
curl -X GET "http://localhost:5000/api/chat?page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

### POST /chat/:userId/read
Mark messages as read
```bash
curl -X POST http://localhost:5000/api/chat/64f8a1b2c3d4e5f6a7b8c9d0/read \
  -H "Authorization: Bearer <token>"
```

### DELETE /chat/message/:messageId
Delete a message
```bash
curl -X DELETE http://localhost:5000/api/chat/message/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer <token>"
```

### POST /chat/message/:messageId/reaction
Add reaction to message
```bash
curl -X POST http://localhost:5000/api/chat/message/64f8a1b2c3d4e5f6a7b8c9d0/reaction \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "emoji": "❤️"
  }'
```

### GET /chat/:userId/typing
Get typing status
```bash
curl -X GET http://localhost:5000/api/chat/64f8a1b2c3d4e5f6a7b8c9d0/typing \
  -H "Authorization: Bearer <token>"
```

---

## 6. Subscription & Payments

### GET /user/membership/plans
Get available subscription plans
```bash
curl -X GET "http://localhost:5000/api/user/membership/plans?duration=yearly" \
  -H "Authorization: Bearer <token>"
```

### POST /user/membership/subscribe
Subscribe to a plan
```bash
curl -X POST http://localhost:5000/api/user/membership/subscribe \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "64f8a1b2c3d4e5f6a7b8c9d0"
  }'
```

### POST /user/membership/webhook
Stripe webhook for payment events
```bash
curl -X POST http://localhost:5000/api/user/membership/webhook \
  -H "Content-Type: application/json" \
  -d '<stripe-webhook-payload>'
```

### GET /user/membership/status
Check subscription status
```bash
curl -X GET http://localhost:5000/api/user/membership/status \
  -H "Authorization: Bearer <token>"
```

### POST /user/membership/cancel
Cancel subscription
```bash
curl -X POST http://localhost:5000/api/user/membership/cancel \
  -H "Authorization: Bearer <token>"
```

---

## 7. Verification

### POST /verify/email
Send email verification
```bash
curl -X POST http://localhost:5000/api/verify/email \
  -H "Authorization: Bearer <token>"
```

### GET /verify/email/confirm
Confirm email verification
```bash
curl -X GET "http://localhost:5000/api/verify/email/confirm?token=<verification-token>"
```

### POST /verify/phone
Send phone OTP
```bash
curl -X POST http://localhost:5000/api/verify/phone \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543210"
  }'
```

### POST /verify/phone/confirm
Confirm phone verification
```bash
curl -X POST http://localhost:5000/api/verify/phone/confirm \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "123456"
  }'
```

### POST /verify/id
Upload government ID for verification
```bash
curl -X POST http://localhost:5000/api/verify/id \
  -H "Authorization: Bearer <token>" \
  -F "frontImage=@/path/to/id-front.jpg" \
  -F "backImage=@/path/to/id-back.jpg" \
  -F "documentType=aadhar" \
  -F "documentNumber=123456789012"
```

### POST /verify/photo
Upload verification photos
```bash
curl -X POST http://localhost:5000/api/verify/photo \
  -H "Authorization: Bearer <token>" \
  -F "photos=@/path/to/photo1.jpg" \
  -F "photos=@/path/to/photo2.jpg"
```

### GET /verify/status
Get verification status
```bash
curl -X GET http://localhost:5000/api/verify/status \
  -H "Authorization: Bearer <token>"
```

---

## 8. Notifications

### GET /notifications
Get user notifications
```bash
curl -X GET "http://localhost:5000/api/notifications?page=1&limit=20&type=like&isRead=false" \
  -H "Authorization: Bearer <token>"
```

### POST /notifications/read/:notificationId
Mark notification as read
```bash
curl -X POST http://localhost:5000/api/notifications/read/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer <token>"
```

### POST /notifications/read-all
Mark all notifications as read
```bash
curl -X POST http://localhost:5000/api/notifications/read-all \
  -H "Authorization: Bearer <token>"
```

### DELETE /notifications/:notificationId
Delete notification
```bash
curl -X DELETE http://localhost:5000/api/notifications/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer <token>"
```

### DELETE /notifications
Delete all notifications
```bash
curl -X DELETE http://localhost:5000/api/notifications \
  -H "Authorization: Bearer <token>"
```

---

## 9. Admin Panel

### GET /admin/panel/users
List all users with filters
```bash
curl -X GET "http://localhost:5000/api/admin/panel/users?page=1&limit=20&search=john&role=user&isEmailVerified=true" \
  -H "Authorization: Bearer <admin-token>"
```

### GET /admin/panel/users/:userId
Get specific user details
```bash
curl -X GET http://localhost:5000/api/admin/panel/users/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer <admin-token>"
```

### PUT /admin/panel/users/:userId
Update user (ban, suspend, verify, etc.)
```bash
curl -X PUT http://localhost:5000/api/admin/panel/users/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false,
    "banReason": "Inappropriate behavior",
    "notes": "User reported multiple times"
  }'
```

### DELETE /admin/panel/users/:userId
Delete user
```bash
curl -X DELETE http://localhost:5000/api/admin/panel/users/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer <admin-token>"
```

### GET /admin/panel/reports
View reported users/content
```bash
curl -X GET "http://localhost:5000/api/admin/panel/reports?page=1&limit=20&status=pending" \
  -H "Authorization: Bearer <admin-token>"
```

### PUT /admin/panel/reports/:reportId/resolve
Resolve a report
```bash
curl -X PUT http://localhost:5000/api/admin/panel/reports/64f8a1b2c3d4e5f6a7b8c9d0/resolve \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "resolutionNotes": "User warned and content removed"
  }'
```

### GET /admin/panel/analytics
Platform analytics
```bash
curl -X GET "http://localhost:5000/api/admin/panel/analytics?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer <admin-token>"
```

### GET /admin/panel/dashboard
Dashboard statistics
```bash
curl -X GET http://localhost:5000/api/admin/panel/dashboard \
  -H "Authorization: Bearer <admin-token>"
```

### POST /admin/panel/notifications
Send system-wide notification
```bash
curl -X POST http://localhost:5000/api/admin/panel/notifications \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "System Maintenance",
    "message": "The site will be under maintenance from 2-4 AM",
    "type": "system",
    "priority": "medium",
    "targetUsers": "all"
  }'
```

---

## 10. System & Security

### GET /health
Health check endpoint
```bash
curl -X GET http://localhost:5000/health
```

### GET /admin/panel/logs
Get system logs (Admin only)
```bash
curl -X GET "http://localhost:5000/api/admin/panel/logs?date=2024-01-15" \
  -H "Authorization: Bearer <admin-token>"
```

### GET /admin/panel/audit
View audit trails (Admin only)
```bash
curl -X GET "http://localhost:5000/api/admin/panel/audit?userId=64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer <admin-token>"
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Rate Limiting

- General endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- OTP endpoints: 3 requests per 5 minutes
- Search endpoints: 30 requests per minute
- Message endpoints: 20 requests per minute
- Admin endpoints: 50 requests per 5 minutes

## Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "pagination": {
    // Pagination info (for paginated endpoints)
  }
}
```

## Authentication Flow

1. Register with `/auth/signup`
2. Login with `/auth/login` to get access and refresh tokens
3. Use access token in Authorization header for protected endpoints
4. Refresh token when access token expires using `/auth/refresh-token`
5. Logout with `/auth/logout` to invalidate tokens

## File Upload

For file uploads, use `multipart/form-data` content type:

```bash
curl -X POST http://localhost:5000/api/auth/user/profile-picture \
  -H "Authorization: Bearer <token>" \
  -F "profileImage=@/path/to/image.jpg"
```

## WebSocket Connection

For real-time messaging, connect to WebSocket:

```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('receiver message', (msg) => {
  console.log('Received message:', msg);
});
```
