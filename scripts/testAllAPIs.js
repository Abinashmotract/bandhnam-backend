import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_BASE_URL = "http://localhost:5055/api";
let authToken = "";
let testUserId = "";

// Test user credentials
const testUser = {
  email: "priya.sharma@example.com",
  password: "password123"
};

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 500 
    };
  }
};

// Test Authentication APIs
const testAuthAPIs = async () => {
  console.log("\n🔐 Testing Authentication APIs...");
  
  // Test login
  const loginResult = await apiCall("POST", "/auth/login", testUser);
  if (loginResult.success) {
    authToken = loginResult.data.data.accessToken;
    console.log("✅ Login successful");
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
  } else {
    console.log("❌ Login failed:", loginResult.error);
    return false;
  }
  
  return true;
};

// Test Profile APIs
const testProfileAPIs = async () => {
  console.log("\n👤 Testing Profile APIs...");
  
  const headers = { Authorization: `Bearer ${authToken}` };
  
  // Test get all profiles
  const profilesResult = await apiCall("GET", "/profiles/list", null, headers);
  if (profilesResult.success) {
    console.log(`✅ Get all profiles: ${profilesResult.data.data.length} profiles found`);
  } else {
    console.log("❌ Get all profiles failed:", profilesResult.error);
  }
  
  // Test get matched profiles
  const matchesResult = await apiCall("GET", "/profiles/matches", null, headers);
  if (matchesResult.success) {
    console.log(`✅ Get matched profiles: ${matchesResult.data.data.length} matches found`);
  } else {
    console.log("❌ Get matched profiles failed:", matchesResult.error);
  }
  
  // Test filter profiles
  const filterResult = await apiCall("GET", "/profiles/filter?gender=female&ageMin=25&ageMax=35", null, headers);
  if (filterResult.success) {
    console.log(`✅ Filter profiles: ${filterResult.data.data.length} profiles found`);
  } else {
    console.log("❌ Filter profiles failed:", filterResult.error);
  }
};

// Test Search APIs
const testSearchAPIs = async () => {
  console.log("\n🔍 Testing Search APIs...");
  
  const headers = { Authorization: `Bearer ${authToken}` };
  
  // Test basic search
  const searchResult = await apiCall("GET", "/search?gender=female&ageMin=25&ageMax=35", null, headers);
  if (searchResult.success) {
    console.log(`✅ Basic search: ${searchResult.data.data.profiles.length} profiles found`);
  } else {
    console.log("❌ Basic search failed:", searchResult.error);
  }
  
  // Test recommendations
  const recommendationsResult = await apiCall("GET", "/search/recommendations", null, headers);
  if (recommendationsResult.success) {
    console.log(`✅ Recommendations: ${recommendationsResult.data.data.length} recommendations found`);
  } else {
    console.log("❌ Recommendations failed:", recommendationsResult.error);
  }
  
  // Test advanced matches
  const advancedMatchesResult = await apiCall("GET", "/search/advanced-matches", null, headers);
  if (advancedMatchesResult.success) {
    console.log(`✅ Advanced matches: ${advancedMatchesResult.data.data.matches.length} matches found`);
  } else {
    console.log("❌ Advanced matches failed:", advancedMatchesResult.error);
  }
};

// Test Interaction APIs
const testInteractionAPIs = async () => {
  console.log("\n💝 Testing Interaction APIs...");
  
  const headers = { Authorization: `Bearer ${authToken}` };
  
  // Get a profile to interact with
  const profilesResult = await apiCall("GET", "/profiles/list", null, headers);
  if (!profilesResult.success || profilesResult.data.data.length === 0) {
    console.log("❌ No profiles available for interaction testing");
    return;
  }
  
  const targetUserId = profilesResult.data.data[0]._id;
  
  // Test like profile
  const likeResult = await apiCall("POST", `/interactions/like/${targetUserId}`, null, headers);
  if (likeResult.success) {
    console.log("✅ Like profile successful");
  } else {
    console.log("❌ Like profile failed:", likeResult.error);
  }
  
  // Test super like profile
  const superLikeResult = await apiCall("POST", `/interactions/superlike/${targetUserId}`, null, headers);
  if (superLikeResult.success) {
    console.log("✅ Super like profile successful");
  } else {
    console.log("❌ Super like profile failed:", superLikeResult.error);
  }
  
  // Test add to favourites
  const favouriteResult = await apiCall("POST", `/interactions/favourite/${targetUserId}`, null, headers);
  if (favouriteResult.success) {
    console.log("✅ Add to favourites successful");
  } else {
    console.log("❌ Add to favourites failed:", favouriteResult.error);
  }
  
  // Test get favourites
  const getFavouritesResult = await apiCall("GET", "/interactions/favourites", null, headers);
  if (getFavouritesResult.success) {
    console.log(`✅ Get favourites: ${getFavouritesResult.data.data.favourites.length} favourites found`);
  } else {
    console.log("❌ Get favourites failed:", getFavouritesResult.error);
  }
};

// Test Horoscope APIs
const testHoroscopeAPIs = async () => {
  console.log("\n🔮 Testing Horoscope APIs...");
  
  const headers = { Authorization: `Bearer ${authToken}` };
  
  // Test add horoscope
  const horoscopeData = {
    dateOfBirth: new Date("1995-03-15"),
    timeOfBirth: "10:30 AM",
    placeOfBirth: "New Delhi",
    coordinates: { latitude: 28.6139, longitude: 77.2090 },
    sunSign: "Pisces",
    moonSign: "Cancer",
    risingSign: "Leo",
    nakshatra: "Uttara Bhadrapada",
    nakshatraLord: "Saturn",
    nakshatraPada: 2,
    planetaryPositions: {
      sun: "Pisces",
      moon: "Cancer",
      mars: "Aries",
      mercury: "Aquarius",
      jupiter: "Sagittarius",
      venus: "Pisces",
      saturn: "Pisces",
      rahu: "Leo",
      ketu: "Aquarius"
    },
    compatibilityFactors: {
      manglik: false,
      mangalDosha: "None",
      nadi: "Adi",
      gana: "Deva",
      yoni: "Ashwa",
      varna: "Brahmin",
      vashya: "Chatushpada",
      tara: "Rohini",
      yoniCompatibility: 75,
      ganaCompatibility: 80,
      nadiCompatibility: 60
    },
    overallScore: 85,
    isVerified: true,
    isPublic: true
  };
  
  const addHoroscopeResult = await apiCall("POST", "/horoscope", horoscopeData, headers);
  if (addHoroscopeResult.success) {
    console.log("✅ Add horoscope successful");
  } else {
    console.log("❌ Add horoscope failed:", addHoroscopeResult.error);
  }
  
  // Test get horoscope
  const getHoroscopeResult = await apiCall("GET", "/horoscope", null, headers);
  if (getHoroscopeResult.success) {
    console.log("✅ Get horoscope successful");
  } else {
    console.log("❌ Get horoscope failed:", getHoroscopeResult.error);
  }
  
  // Test horoscope matches
  const horoscopeMatchesResult = await apiCall("GET", "/horoscope/matches", null, headers);
  if (horoscopeMatchesResult.success) {
    console.log(`✅ Horoscope matches: ${horoscopeMatchesResult.data.data.length} matches found`);
  } else {
    console.log("❌ Horoscope matches failed:", horoscopeMatchesResult.error);
  }
};

// Test Success Stories APIs
const testSuccessStoryAPIs = async () => {
  console.log("\n💕 Testing Success Stories APIs...");
  
  const headers = { Authorization: `Bearer ${authToken}` };
  
  // Test get success stories
  const getStoriesResult = await apiCall("GET", "/success-stories", null, headers);
  if (getStoriesResult.success) {
    console.log(`✅ Get success stories: ${getStoriesResult.data.data.stories.length} stories found`);
  } else {
    console.log("❌ Get success stories failed:", getStoriesResult.error);
  }
  
  // Test get featured stories
  const featuredStoriesResult = await apiCall("GET", "/success-stories/featured", null, headers);
  if (featuredStoriesResult.success) {
    console.log(`✅ Get featured stories: ${featuredStoriesResult.data.data.length} stories found`);
  } else {
    console.log("❌ Get featured stories failed:", featuredStoriesResult.error);
  }
  
  // Test get success story stats
  const statsResult = await apiCall("GET", "/success-stories/stats", null, headers);
  if (statsResult.success) {
    console.log("✅ Get success story stats successful");
  } else {
    console.log("❌ Get success story stats failed:", statsResult.error);
  }
};

// Test Blog APIs
const testBlogAPIs = async () => {
  console.log("\n📝 Testing Blog APIs...");
  
  const headers = { Authorization: `Bearer ${authToken}` };
  
  // Test get blog posts
  const getBlogsResult = await apiCall("GET", "/blog", null, headers);
  if (getBlogsResult.success) {
    console.log(`✅ Get blog posts: ${getBlogsResult.data.data.posts.length} posts found`);
  } else {
    console.log("❌ Get blog posts failed:", getBlogsResult.error);
  }
  
  // Test get featured posts
  const featuredPostsResult = await apiCall("GET", "/blog/featured", null, headers);
  if (featuredPostsResult.success) {
    console.log(`✅ Get featured posts: ${featuredPostsResult.data.data.length} posts found`);
  } else {
    console.log("❌ Get featured posts failed:", featuredPostsResult.error);
  }
  
  // Test get blog categories
  const categoriesResult = await apiCall("GET", "/blog/categories", null, headers);
  if (categoriesResult.success) {
    console.log(`✅ Get blog categories: ${categoriesResult.data.data.length} categories found`);
  } else {
    console.log("❌ Get blog categories failed:", categoriesResult.error);
  }
  
  // Test get popular posts
  const popularPostsResult = await apiCall("GET", "/blog/popular", null, headers);
  if (popularPostsResult.success) {
    console.log(`✅ Get popular posts: ${popularPostsResult.data.data.length} posts found`);
  } else {
    console.log("❌ Get popular posts failed:", popularPostsResult.error);
  }
};

// Test Analytics APIs
const testAnalyticsAPIs = async () => {
  console.log("\n📊 Testing Analytics APIs...");
  
  const headers = { Authorization: `Bearer ${authToken}` };
  
  // Test get profile analytics
  const analyticsResult = await apiCall("GET", "/analytics", null, headers);
  if (analyticsResult.success) {
    console.log("✅ Get profile analytics successful");
  } else {
    console.log("❌ Get profile analytics failed:", analyticsResult.error);
  }
  
  // Test get detailed analytics
  const detailedAnalyticsResult = await apiCall("GET", "/analytics/detailed", null, headers);
  if (detailedAnalyticsResult.success) {
    console.log("✅ Get detailed analytics successful");
  } else {
    console.log("❌ Get detailed analytics failed:", detailedAnalyticsResult.error);
  }
  
  // Test get analytics insights
  const insightsResult = await apiCall("GET", "/analytics/insights", null, headers);
  if (insightsResult.success) {
    console.log("✅ Get analytics insights successful");
  } else {
    console.log("❌ Get analytics insights failed:", insightsResult.error);
  }
};

// Test Membership APIs
const testMembershipAPIs = async () => {
  console.log("\n💳 Testing Membership APIs...");
  
  const headers = { Authorization: `Bearer ${authToken}` };
  
  // Test get membership plans
  const plansResult = await apiCall("GET", "/user/membership/plans", null, headers);
  if (plansResult.success) {
    console.log(`✅ Get membership plans: ${plansResult.data.data.length} plans found`);
  } else {
    console.log("❌ Get membership plans failed:", plansResult.error);
  }
  
  // Test get user membership
  const userMembershipResult = await apiCall("GET", "/user/membership", null, headers);
  if (userMembershipResult.success) {
    console.log("✅ Get user membership successful");
  } else {
    console.log("❌ Get user membership failed:", userMembershipResult.error);
  }
};

// Main test function
const runAllTests = async () => {
  console.log("🚀 Starting API Testing...");
  console.log("=".repeat(50));
  
  try {
    // Test authentication first
    const authSuccess = await testAuthAPIs();
    if (!authSuccess) {
      console.log("❌ Authentication failed, stopping tests");
      return;
    }
    
    // Test all other APIs
    await testProfileAPIs();
    await testSearchAPIs();
    await testInteractionAPIs();
    await testHoroscopeAPIs();
    await testSuccessStoryAPIs();
    await testBlogAPIs();
    await testAnalyticsAPIs();
    await testMembershipAPIs();
    
    console.log("\n" + "=".repeat(50));
    console.log("✅ All API tests completed!");
    
  } catch (error) {
    console.error("❌ Test execution failed:", error);
  }
};

// Run the tests
runAllTests();
