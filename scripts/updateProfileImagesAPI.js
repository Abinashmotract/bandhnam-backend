import axios from 'axios';

const API_BASE_URL = 'http://localhost:5055/api';

// Profile images to update
const profileImageUpdates = [
  {
    userId: "68d8385868c4ba9ede975941",
    profileImageUrl: "https://imgs.search.brave.com/g4dLcOCvvKbKMmqnuJ1au8GRGfARNC5KepKZ9jmUc44/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cudGVsdWd1b25lLmNvbS9waG90b3MvdXBsb2Fkc0V4dC91cGxvYWRzL0thdnlhJTIwS2FseWFucmFtL0thdnlhJTIwS2FseWFuUmFtJTIwTmV3JTIwR2FsbGVyeS9LYXZ5YSUyMEthbHlhblJh bSUyMEdhbGxlcnkud2VicA"
  },
  {
    userId: "68d8385868c4ba9ede975942",
    profileImageUrl: "https://imgs.search.brave.com/F599isaQp8REE-T6yabqck42qIFYv2n4TL9WkiB3HM4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cuZGl0dW5pdmVyc2l0eS5lZHUuaW4vdXBsb2Fkcy9mYWN1bHR5X2ltYWdlcy8xNjg3ODU3MTA4XzEyYzBjZWYyMWE4YzM5N2NiODMzLndlYnA"
  },
  {
    userId: "68d8385868c4ba9ede975935",
    profileImageUrl: "https://imgs.search.brave.com/FW7DkG27fkN2oDlgfKHD8UzOwhuYnBXDn0RFUIWs16I/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0aWMudG9paW1nLmNvbS90aHVtYi9pbWdz/aXplLTIzNDU2LG1zaWQtODgxNDAxMDAsd2lkdGgtNjAwLHJl/c2l6ZW1vZGUtNC84ODE0MDEwMC5qcGc"
  }
];

// Function to update profile images
const updateProfileImages = async () => {
  try {
    console.log("Starting to update profile images via API...");
    
    let updatedCount = 0;
    
    for (const update of profileImageUpdates) {
      try {
        // First, let's get the user details to see if they exist
        const getUserResponse = await axios.get(`${API_BASE_URL}/admin/users/${update.userId}`, {
          headers: {
            'Authorization': 'Bearer admin-token', // This might need to be adjusted
            'Content-Type': 'application/json'
          }
        });
        
        if (getUserResponse.data.success) {
          console.log(`Found user: ${getUserResponse.data.data.name}`);
          
          // Update the user with profile image
          const updateResponse = await axios.put(`${API_BASE_URL}/admin/users/${update.userId}`, {
            profileImage: update.profileImageUrl
          }, {
            headers: {
              'Authorization': 'Bearer admin-token', // This might need to be adjusted
              'Content-Type': 'application/json'
            }
          });
          
          if (updateResponse.data.success) {
            updatedCount++;
            console.log(`✅ Updated profile image for: ${getUserResponse.data.data.name}`);
            console.log(`   New image URL: ${update.profileImageUrl}`);
          } else {
            console.log(`❌ Failed to update profile for user ${update.userId}: ${updateResponse.data.message}`);
          }
        } else {
          console.log(`❌ User with ID ${update.userId} not found`);
        }
      } catch (error) {
        console.error(`❌ Error updating profile ${update.userId}:`, error.response?.data?.message || error.message);
      }
    }
    
    console.log(`\n🎉 Profile image updates completed! Updated ${updatedCount} profiles.`);
    
  } catch (error) {
    console.error("❌ Update error:", error.message);
  }
};

// Run the update function
updateProfileImages();
