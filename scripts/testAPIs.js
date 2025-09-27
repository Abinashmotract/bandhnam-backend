import fetch from "node-fetch";

const BASE_URL = "http://localhost:5000/api";

// Test user credentials
const testUsers = [
  { email: "priya.sharma@example.com", password: "Password123!" },
  { email: "arjun.patel@example.com", password: "Password123!" },
  { email: "sneha.reddy@example.com", password: "Password123!" }
];

let authToken = null;

// Function to login and get token
const login = async (email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ identifier: email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      authToken = data.data.accessToken;
      console.log(`✅ Login successful for ${email}`);
      return true;
    } else {
      console.log(`❌ Login failed for ${email}:`, data.message);
      return false;
    }
  } catch (error) {
    console.log(`❌ Login error for ${email}:`, error.message);
    return false;
  }
};

// Function to test search API
const testSearch = async () => {
  try {
    const response = await fetch(`${BASE_URL}/search?ageMin=25&ageMax=35&gender=female&religion=hindu&limit=5`, {
      headers: {
        "Authorization": `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Search API working - Found ${data.data.profiles.length} profiles`);
      return data.data.profiles;
    } else {
      console.log(`❌ Search API failed:`, data.message);
      return [];
    }
  } catch (error) {
    console.log(`❌ Search API error:`, error.message);
    return [];
  }
};

// Function to test recommendations API
const testRecommendations = async () => {
  try {
    const response = await fetch(`${BASE_URL}/search/recommendations?limit=5`, {
      headers: {
        "Authorization": `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Recommendations API working - Found ${data.data.length} recommendations`);
      return data.data;
    } else {
      console.log(`❌ Recommendations API failed:`, data.message);
      return [];
    }
  } catch (error) {
    console.log(`❌ Recommendations API error:`, error.message);
    return [];
  }
};

// Function to test like API
const testLike = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/interactions/like/${userId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Like API working - ${data.message}`);
      return true;
    } else {
      console.log(`❌ Like API failed:`, data.message);
      return false;
    }
  } catch (error) {
    console.log(`❌ Like API error:`, error.message);
    return false;
  }
};

// Function to test get profiles API
const testGetProfiles = async () => {
  try {
    const response = await fetch(`${BASE_URL}/profiles/list`, {
      headers: {
        "Authorization": `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Get Profiles API working - Found ${data.data.length} profiles`);
      return data.data;
    } else {
      console.log(`❌ Get Profiles API failed:`, data.message);
      return [];
    }
  } catch (error) {
    console.log(`❌ Get Profiles API error:`, error.message);
    return [];
  }
};

// Function to test notifications API
const testNotifications = async () => {
  try {
    const response = await fetch(`${BASE_URL}/notifications`, {
      headers: {
        "Authorization": `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Notifications API working - Found ${data.data.notifications.length} notifications`);
      return data.data.notifications;
    } else {
      console.log(`❌ Notifications API failed:`, data.message);
      return [];
    }
  } catch (error) {
    console.log(`❌ Notifications API error:`, error.message);
    return [];
  }
};

// Main test function
const runTests = async () => {
  console.log("🚀 Starting API Tests...\n");
  
  // Test login
  const loginSuccess = await login(testUsers[0].email, testUsers[0].password);
  
  if (!loginSuccess) {
    console.log("❌ Cannot proceed without authentication");
    return;
  }
  
  console.log("\n📋 Testing APIs...\n");
  
  // Test get profiles
  console.log("1. Testing Get Profiles API:");
  const profiles = await testGetProfiles();
  
  // Test search
  console.log("\n2. Testing Search API:");
  const searchResults = await testSearch();
  
  // Test recommendations
  console.log("\n3. Testing Recommendations API:");
  const recommendations = await testRecommendations();
  
  // Test like (if we have profiles)
  if (profiles.length > 0) {
    console.log("\n4. Testing Like API:");
    await testLike(profiles[0]._id);
  }
  
  // Test notifications
  console.log("\n5. Testing Notifications API:");
  await testNotifications();
  
  console.log("\n🎉 API Tests completed!");
  console.log("\n📊 Summary:");
  console.log(`- Total profiles found: ${profiles.length}`);
  console.log(`- Search results: ${searchResults.length}`);
  console.log(`- Recommendations: ${recommendations.length}`);
  console.log(`- Authentication: ${loginSuccess ? 'Working' : 'Failed'}`);
};

// Run tests
runTests().catch(console.error);
