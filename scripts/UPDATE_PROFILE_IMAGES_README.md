# Profile Images Update Instructions

## Overview
This document provides instructions for updating profile images for specific user IDs in the Bandhnam database.

## User IDs and Image URLs
The following user IDs need to be updated with their respective profile images:

1. **User ID**: `68d8385868c4ba9ede975941`
   - **Image URL**: `https://imgs.search.brave.com/g4dLcOCvvKbKMmqnuJ1au8GRGfARNC5KepKZ9jmUc44/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cudGVsdWd1b25lLmNvbS9waG90b3MvdXBsb2Fkc0V4dC91cGxvYWRzL0thdnlhJTIwS2FseWFucmFtL0thdnlhJTIwS2FseWFuUmFtJTIwTmV3JTIwR2FsbGVyeS9LYXZ5YSUyMEthbHlhblJh bSUyMEdhbGxlcnkud2VicA`

2. **User ID**: `68d8385868c4ba9ede975942`
   - **Image URL**: `https://imgs.search.brave.com/F599isaQp8REE-T6yabqck42qIFYv2n4TL9WkiB3HM4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cuZGl0dW5pdmVyc2l0eS5lZHUuaW4vdXBsb2Fkcy9mYWN1bHR5X2ltYWdlcy8xNjg3ODU3MTA4XzEyYzBjZWYyMWE4YzM5N2NiODMzLndlYnA`

3. **User ID**: `68d8385868c4ba9ede975935`
   - **Image URL**: `https://imgs.search.brave.com/FW7DkG27fkN2oDlgfKHD8UzOwhuYnBXDn0RFUIWs16I/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0aWMudG9paW1nLmNvbS90aHVtYi9pbWdz/aXplLTIzNDU2LG1zaWQtODgxNDAxMDAsd2lkdGgtNjAwLHJl/c2l6ZW1vZGUtNC84ODE0MDEwMC5qcGc`

## Methods to Update

### Method 1: Using MongoDB Shell
```bash
# Connect to MongoDB
mongo bandhnam

# Update each user
db.users.updateOne(
  { _id: ObjectId('68d8385868c4ba9ede975941') },
  { $set: { profileImage: 'https://imgs.search.brave.com/g4dLcOCvvKbKMmqnuJ1au8GRGfARNC5KepKZ9jmUc44/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cudGVsdWd1b25lLmNvbS9waG90b3MvdXBsb2Fkc0V4dC91cGxvYWRzL0thdnlhJTIwS2FseWFucmFtL0thdnlhJTIwS2FseWFuUmFtJTIwTmV3JTIwR2FsbGVyeS9LYXZ5YSUyMEthbHlhblJh bSUyMEdhbGxlcnkud2VicA' } }
);

db.users.updateOne(
  { _id: ObjectId('68d8385868c4ba9ede975942') },
  { $set: { profileImage: 'https://imgs.search.brave.com/F599isaQp8REE-T6yabqck42qIFYv2n4TL9WkiB3HM4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cuZGl0dW5pdmVyc2l0eS5lZHUuaW4vdXBsb2Fkcy9mYWN1bHR5X2ltYWdlcy8xNjg3ODU3MTA4XzEyYzBjZWYyMWE4YzM5N2NiODMzLndlYnA' } }
);

db.users.updateOne(
  { _id: ObjectId('68d8385868c4ba9ede975935') },
  { $set: { profileImage: 'https://imgs.search.brave.com/FW7DkG27fkN2oDlgfKHD8UzOwhuYnBXDn0RFUIWs16I/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0aWMudG9paW1nLmNvbS90aHVtYi9pbWdz/aXplLTIzNDU2LG1zaWQtODgxNDAxMDAsd2lkdGgtNjAwLHJl/c2l6ZW1vZGUtNC84ODE0MDEwMC5qcGc' } }
);
```

### Method 2: Using Node.js Script
```bash
# Run the update script (when MongoDB compatibility is resolved)
cd /home/motract/Documents/abinash/bandhnam-backend
node scripts/updateProfilesDirect.js
```

### Method 3: Using Admin API
```bash
# Update via API (requires admin authentication)
curl -X PUT "http://localhost:5055/api/admin/users/68d8385868c4ba9ede975941" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"profileImage": "https://imgs.search.brave.com/g4dLcOCvvKbKMmqnuJ1au8GRGfARNC5KepKZ9jmUc44/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cudGVsdWd1b25lLmNvbS9waG90b3MvdXBsb2Fkc0V4dC91cGxvYWRzL0thdnlhJTIwS2FseWFucmFtL0thdnlhJTIwS2FseWFuUmFtJTIwTmV3JTIwR2FsbGVyeS9LYXZ5YSUyMEthbHlhblJh bSUyMEdhbGxlcnkud2VicA"}'
```

## Current Status
✅ **Frontend Updated**: The frontend components (FeaturedProfiles.jsx and ProfileCard.jsx) have been updated to display the correct images for these specific user IDs.

⚠️ **Database Update Pending**: Due to MongoDB version compatibility issues, the database updates need to be performed manually using one of the methods above.

## Verification
After updating the database, verify the changes by:
1. Checking the frontend to ensure images are displayed correctly
2. Querying the database to confirm the profileImage field is updated
3. Testing the profile display in both Featured Profiles and individual profile views

## Notes
- The frontend will work correctly even without database updates due to the hardcoded image URLs for these specific user IDs
- Once the database is updated, the hardcoded URLs in the frontend can be removed as the images will be served from the database
- Make sure to test the image URLs to ensure they are accessible and load properly
