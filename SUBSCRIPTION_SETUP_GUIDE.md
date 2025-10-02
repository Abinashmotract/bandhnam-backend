# Bandhnam Subscription Plans Setup Guide

## Overview
This guide provides complete setup instructions for the Bandhnam matrimonial website with the new subscription plans based on the provided pricing sheet.

## Subscription Plans Structure

### 1. Basic Plan (Free)
- **Price**: ₹0
- **Duration**: Forever
- **Features**:
  - View 5 profiles per day
  - Basic profile information
  - Create your profile
  - Basic search filters

### 2. Entry Plan
- **Price**: ₹999
- **Duration**: 3 months
- **Features**:
  - View 20 profiles
  - Send 5 interests
  - Profile shortlisting (5 profiles)
  - Messaging (5 profiles)
  - Contact views (5 profiles)

### 3. Advanced Plan
- **Price**: ₹4500 (3 months), ₹6500 (6 months)
- **Duration**: 3 months / 6 months
- **Features**:
  - View 50/70 profiles
  - Send 50/70 interests
  - Daily recommendations
  - Advanced search filters
  - Horoscope matching
  - See who viewed your profile
  - Access to compatibility score summary
  - Personality test results
  - Advanced AI-based match suggestions

### 4. Premium Plan
- **Price**: ₹7999 (3 months), ₹9999 (6 months)
- **Duration**: 3 months / 6 months
- **Features**:
  - Unlimited profile views
  - Unlimited interests
  - Unlimited messaging
  - Video/voice calling features
  - All Advanced features
  - Profile boost
  - Priority customer support

### 5. Elite Plan
- **Price**: ₹19999 (3 months), ₹29999 (6 months), ₹49999 (12 months)
- **Duration**: 3 months / 6 months / 12 months
- **Features**:
  - All Premium features
  - Elite member badge
  - Dedicated relationship manager
  - Exclusive elite features
  - Advanced AI matching

## Backend Setup

### 1. Database Setup
```bash
# Connect to MongoDB and run the population script
cd /home/motract/Documents/abinash/bandhnam-backend
MONGO_URI=your_mongodb_connection_string node scripts/populateSubscriptionPlans.js
```

### 2. Environment Variables
Ensure your `.env` file contains:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 3. API Endpoints

#### Admin Subscription Management
- `GET /api/membership/plans` - Get all subscription plans
- `POST /api/membership/plans` - Create new subscription plan
- `PUT /api/membership/plans/:planId` - Update subscription plan
- `DELETE /api/membership/plans/:planId` - Delete subscription plan
- `PATCH /api/membership/plans/:planId` - Toggle plan status
- `GET /api/membership/analytics` - Get subscription analytics

#### User Subscription
- `GET /api/user/membership/plans` - Get available plans for users
- `POST /api/user/membership/subscribe` - Subscribe to a plan
- `GET /api/user/membership/status` - Get user's subscription status

### 4. Admin Login Credentials
- **Email**: bandhnam@example.com
- **Password**: Bandhnam@123

## Frontend Setup

### 1. Signup Flow
The signup process now includes a subscription plan selection step:
1. Account Details
2. Personal Info
3. Family & Lifestyle
4. Preferences
5. **Subscription Plan Selection** (NEW)
6. Complete

### 2. Membership Page
Updated to display all subscription plans with:
- Plan comparison
- Feature lists
- Pricing information
- Subscription management

## Admin Panel Setup

### 1. Access Admin Panel
1. Navigate to the admin panel URL
2. Login with admin credentials
3. Access "Subscription Management" from the sidebar

### 2. Admin Features
- **View All Plans**: See all subscription plans with filtering
- **Create Plans**: Add new subscription plans
- **Edit Plans**: Modify existing plans
- **Toggle Status**: Activate/deactivate plans
- **Analytics**: View subscription analytics
- **User Management**: View all users and their subscription status

### 3. Admin Panel Navigation
- Dashboard
- Labour/Contractors
- Skills
- **Subscription Management** (NEW)
- Other existing features

## Database Schema Updates

### MembershipPlan Model
```javascript
{
  name: String, // Basic, Entry, Advanced, Premium, Elite
  price: Number,
  duration: String, // monthly, quarterly, yearly
  planType: String, // free, paid
  profileViews: Number, // -1 for unlimited
  interests: Number, // -1 for unlimited
  shortlists: Number, // -1 for unlimited
  contactViews: Number, // -1 for unlimited
  features: [String],
  description: String,
  isPopular: Boolean,
  isActive: Boolean
}
```

## Testing the Setup

### 1. Backend Testing
```bash
# Start the backend server
cd /home/motract/Documents/abinash/bandhnam-backend
npm start

# Test API endpoints
curl http://localhost:5000/api/membership/plans
```

### 2. Frontend Testing
```bash
# Start the frontend server
cd /home/motract/Documents/abinash/bandhnam-frontend
npm run dev

# Test the signup flow with subscription selection
```

### 3. Admin Panel Testing
```bash
# Start the admin panel server
cd /home/motract/Documents/abinash/bandhnam-panel
npm run dev

# Login and test subscription management
```

## Key Features Implemented

### 1. Frontend
- ✅ Updated signup flow with subscription plan selection
- ✅ Enhanced membership page with new plans
- ✅ Plan comparison and selection interface
- ✅ Responsive design for all devices

### 2. Backend
- ✅ Updated MembershipPlan model with new fields
- ✅ Created subscription management API endpoints
- ✅ Admin authentication and authorization
- ✅ Plan creation, update, and deletion functionality

### 3. Admin Panel
- ✅ Subscription management interface
- ✅ Plan creation and editing forms
- ✅ Analytics and reporting
- ✅ User subscription tracking
- ✅ Plan status management

## Troubleshooting

### 1. MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string format
- Verify database permissions

### 2. API Endpoint Issues
- Check authentication middleware
- Verify route configurations
- Check CORS settings

### 3. Frontend Issues
- Clear browser cache
- Check API base URL configuration
- Verify component imports

## Security Considerations

1. **Admin Authentication**: All admin routes are protected with JWT authentication
2. **Rate Limiting**: Applied to prevent abuse
3. **Input Validation**: All inputs are validated and sanitized
4. **CORS Configuration**: Properly configured for security

## Next Steps

1. **Payment Integration**: Integrate with payment gateways (Razorpay, Stripe)
2. **Email Notifications**: Send subscription confirmation emails
3. **Analytics Dashboard**: Enhanced analytics and reporting
4. **Mobile App**: Extend to mobile applications
5. **Advanced Features**: Implement remaining premium features

## Support

For any issues or questions regarding the subscription setup:
1. Check the logs for error messages
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check database connectivity

## Conclusion

The Bandhnam matrimonial website now has a complete subscription management system with:
- 5 different subscription tiers
- Admin panel for plan management
- User-friendly signup flow
- Comprehensive API endpoints
- Analytics and reporting features

All features are fully integrated and ready for production use.
