# Testing Scripts for Bandhnam Nammatch Backend

This directory contains scripts to seed the database with test profiles and test the APIs.

## Scripts Available

### 1. `seedProfiles.js`
Seeds the database with 10 diverse test profiles representing different:
- Religions (Hindu, Sikh, Jain, Muslim)
- Castes and communities
- Marital statuses (never married, divorced, widower)
- Age groups (25-40)
- Income levels
- Geographic locations across India
- Professions and education levels

**Usage:**
```bash
npm run seed
```

### 2. `addMoreProfiles.js`
Adds 5 additional diverse profiles with different characteristics:
- Different marital statuses
- Various religious backgrounds
- Different age groups
- Various professions

**Usage:**
```bash
node scripts/addMoreProfiles.js
```

### 3. `testAPIs.js`
Tests the main APIs to ensure they're working correctly:
- Authentication (login)
- Get profiles
- Search functionality
- Recommendations
- Like interactions
- Notifications

**Usage:**
```bash
node scripts/testAPIs.js
```

## Test Profiles Created

### Initial 10 Profiles:
1. **Priya Sharma** - Female, 29, Software Engineer, Mumbai, Hindu Brahmin
2. **Arjun Patel** - Male, 32, Business Owner, Ahmedabad, Hindu Patel
3. **Sneha Reddy** - Female, 30, Doctor, Hyderabad, Hindu Reddy
4. **Rahul Singh** - Male, 34, Software Engineer, Chandigarh, Sikh Jat
5. **Ananya Iyer** - Female, 28, Graphic Designer, Chennai, Hindu Iyer
6. **Vikram Kumar** - Male, 36, Investment Banker, Delhi, Hindu Rajput (Divorced)
7. **Kavya Nair** - Female, 31, Content Writer, Kochi, Hindu Nair
8. **Amit Jain** - Male, 33, Chartered Accountant, Jaipur, Jain
9. **Pooja Gupta** - Female, 29, Teacher, Lucknow, Hindu Gupta
10. **Rajesh Kumar** - Male, 39, Government Officer, Patna, Hindu Kurmi (Widower)

### Additional 5 Profiles:
11. **Sunita Devi** - Female, 37, HR Manager, Gurgaon, Hindu Jat (Divorced)
12. **Mohammed Ali** - Male, 31, Data Scientist, Bangalore, Muslim
13. **Priyanka Mehta** - Female, 30, Chartered Accountant, Surat, Hindu Baniya
14. **Suresh Reddy** - Male, 35, Agricultural Engineer, Vijayawada, Hindu Reddy

## Testing the APIs

After seeding the database, you can test the APIs using the provided curl commands in `API_DOCUMENTATION.md` or use the test script.

### Sample API Calls:

1. **Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "priya.sharma@example.com", "password": "Password123!"}'
```

2. **Get Profiles:**
```bash
curl -X GET http://localhost:5000/api/profiles/list \
  -H "Authorization: Bearer <your-token>"
```

3. **Search Profiles:**
```bash
curl -X GET "http://localhost:5000/api/search?ageMin=25&ageMax=35&gender=female&religion=hindu" \
  -H "Authorization: Bearer <your-token>"
```

4. **Like a Profile:**
```bash
curl -X POST http://localhost:5000/api/interactions/like/<user-id> \
  -H "Authorization: Bearer <your-token>"
```

## Database Schema

The profiles include comprehensive information:
- Basic details (name, email, phone, DOB)
- Physical attributes (height, weight, complexion)
- Professional information (occupation, education, income)
- Religious and cultural background
- Family information
- Preferences for partner
- Hobbies and interests

## Notes

- All test profiles use the password: `Password123!`
- Profiles are created with realistic Indian names and characteristics
- The data represents diverse communities and backgrounds
- All profiles have complete information for testing search and matching algorithms
- Some profiles have different marital statuses to test various scenarios

## Troubleshooting

If you encounter issues:

1. **Database Connection:** Ensure MongoDB is running and the connection string is correct
2. **Duplicate Users:** The scripts check for existing users and skip duplicates
3. **API Testing:** Make sure the server is running on port 5000
4. **Authentication:** Use the correct email/password combinations from the test profiles

## Next Steps

After seeding the database:
1. Test the search and matching algorithms
2. Test the interaction features (like, super-like, block, report)
3. Test the messaging system
4. Test the admin panel features
5. Verify the notification system
