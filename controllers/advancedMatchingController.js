import User from "../models/User.js";
import Interaction from "../models/Interaction.js";
import Horoscope from "../models/Horoscope.js";

// Advanced matching algorithm
export const getAdvancedMatches = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { limit = 20, minScore = 60 } = req.query;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get all other users
    const allUsers = await User.find(
      { _id: { $ne: currentUserId } },
      "-password -otp -otpExpiry -isOtpVerified"
    );

    // Get current user's horoscope
    const currentUserHoroscope = await Horoscope.findOne({ user: currentUserId });

    // Get blocked users
    const blockedUsers = await Interaction.find({
      $or: [
        { fromUser: currentUserId, type: "block" },
        { toUser: currentUserId, type: "block" }
      ]
    }).select("fromUser toUser");

    const blockedUserIds = blockedUsers.map(interaction => 
      interaction.fromUser.toString() === currentUserId.toString() 
        ? interaction.toUser 
        : interaction.fromUser
    );

    const matches = [];

    for (const user of allUsers) {
      // Skip blocked users
      if (blockedUserIds.includes(user._id)) continue;

      const matchScore = await calculateAdvancedMatchScore(currentUser, user, currentUserHoroscope);
      
      if (matchScore.overall >= minScore) {
        matches.push({
          user: {
            _id: user._id,
            name: user.name,
            age: user.dob ? new Date().getFullYear() - new Date(user.dob).getFullYear() : null,
            gender: user.gender,
            location: user.location,
            occupation: user.occupation,
            education: user.education,
            religion: user.religion,
            caste: user.caste,
            profileImage: user.profileImage,
            photos: user.photos,
            about: user.about,
            interests: user.interests,
            profileCompletion: user.profileCompletion
          },
          matchScore: matchScore.overall,
          breakdown: matchScore.breakdown
        });
      }
    }

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    // Limit results
    const limitedMatches = matches.slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Advanced matches fetched successfully",
      data: {
        matches: limitedMatches,
        totalMatches: matches.length
      }
    });

  } catch (error) {
    console.error("Get advanced matches error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching advanced matches",
      error: error.message
    });
  }
};

// Calculate advanced match score
async function calculateAdvancedMatchScore(currentUser, targetUser, currentUserHoroscope) {
  let totalScore = 0;
  let totalWeight = 0;
  const breakdown = {};

  // 1. Basic Compatibility (30% weight)
  const basicScore = calculateBasicCompatibility(currentUser, targetUser);
  totalScore += basicScore * 0.3;
  totalWeight += 0.3;
  breakdown.basic = Math.round(basicScore);

  // 2. Preference Matching (25% weight)
  const preferenceScore = calculatePreferenceMatch(currentUser, targetUser);
  totalScore += preferenceScore * 0.25;
  totalWeight += 0.25;
  breakdown.preferences = Math.round(preferenceScore);

  // 3. Location Compatibility (15% weight)
  const locationScore = calculateLocationCompatibility(currentUser, targetUser);
  totalScore += locationScore * 0.15;
  totalWeight += 0.15;
  breakdown.location = Math.round(locationScore);

  // 4. Education & Career Compatibility (15% weight)
  const careerScore = calculateCareerCompatibility(currentUser, targetUser);
  totalScore += careerScore * 0.15;
  totalWeight += 0.15;
  breakdown.career = Math.round(careerScore);

  // 5. Horoscope Compatibility (10% weight)
  let horoscopeScore = 50; // Default neutral score
  if (currentUserHoroscope) {
    const targetUserHoroscope = await Horoscope.findOne({ user: targetUser._id });
    if (targetUserHoroscope) {
      horoscopeScore = await calculateHoroscopeCompatibility(currentUserHoroscope, targetUserHoroscope);
    }
  }
  totalScore += horoscopeScore * 0.1;
  totalWeight += 0.1;
  breakdown.horoscope = Math.round(horoscopeScore);

  // 6. Interest Compatibility (5% weight)
  const interestScore = calculateInterestCompatibility(currentUser, targetUser);
  totalScore += interestScore * 0.05;
  totalWeight += 0.05;
  breakdown.interests = Math.round(interestScore);

  const overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

  return {
    overall: overallScore,
    breakdown
  };
}

// Basic compatibility calculation
function calculateBasicCompatibility(user1, user2) {
  let score = 0;
  let factors = 0;

  // Age compatibility
  if (user1.dob && user2.dob) {
    factors++;
    const age1 = new Date().getFullYear() - new Date(user1.dob).getFullYear();
    const age2 = new Date().getFullYear() - new Date(user2.dob).getFullYear();
    const ageDiff = Math.abs(age1 - age2);
    
    if (ageDiff <= 2) score += 100;
    else if (ageDiff <= 5) score += 80;
    else if (ageDiff <= 10) score += 60;
    else score += 40;
  }

  // Religion compatibility
  if (user1.religion && user2.religion) {
    factors++;
    if (user1.religion === user2.religion) score += 100;
    else score += 30;
  }

  // Caste compatibility
  if (user1.caste && user2.caste) {
    factors++;
    if (user1.caste === user2.caste) score += 100;
    else score += 50;
  }

  // Marital status compatibility
  if (user1.maritalStatus && user2.maritalStatus) {
    factors++;
    if (user1.maritalStatus === user2.maritalStatus) score += 100;
    else score += 40;
  }

  return factors > 0 ? score / factors : 50;
}

// Preference matching
function calculatePreferenceMatch(currentUser, targetUser) {
  if (!currentUser.preferences) return 50;

  let score = 0;
  let factors = 0;

  // Age preference
  if (currentUser.preferences.ageRange && targetUser.dob) {
    factors++;
    const age = new Date().getFullYear() - new Date(targetUser.dob).getFullYear();
    if (age >= currentUser.preferences.ageRange.min && 
        age <= currentUser.preferences.ageRange.max) {
      score += 100;
    } else {
      score += 30;
    }
  }

  // Religion preference
  if (currentUser.preferences.religion && targetUser.religion) {
    factors++;
    if (currentUser.preferences.religion === targetUser.religion) score += 100;
    else score += 20;
  }

  // Education preference
  if (currentUser.preferences.education && targetUser.education) {
    factors++;
    if (currentUser.preferences.education === targetUser.education) score += 100;
    else score += 40;
  }

  // Location preference
  if (currentUser.preferences.location && targetUser.location) {
    factors++;
    if (currentUser.preferences.location === targetUser.location) score += 100;
    else score += 50;
  }

  return factors > 0 ? score / factors : 50;
}

// Location compatibility
function calculateLocationCompatibility(user1, user2) {
  if (!user1.location || !user2.location) return 50;

  // Same location
  if (user1.location === user2.location) return 100;

  // Same state (simplified check)
  const state1 = user1.location.split(',')[1]?.trim();
  const state2 = user2.location.split(',')[1]?.trim();
  if (state1 && state2 && state1 === state2) return 80;

  // Different locations
  return 40;
}

// Career compatibility
function calculateCareerCompatibility(user1, user2) {
  let score = 0;
  let factors = 0;

  // Education level compatibility
  if (user1.education && user2.education) {
    factors++;
    const educationLevels = {
      'High School': 1,
      'Bachelor': 2,
      'Master': 3,
      'PhD': 4,
      'MBA': 3,
      'MD': 4
    };
    
    const level1 = educationLevels[user1.education] || 2;
    const level2 = educationLevels[user2.education] || 2;
    const diff = Math.abs(level1 - level2);
    
    if (diff === 0) score += 100;
    else if (diff === 1) score += 80;
    else if (diff === 2) score += 60;
    else score += 40;
  }

  // Occupation compatibility
  if (user1.occupation && user2.occupation) {
    factors++;
    // Simple occupation matching
    const occupation1 = user1.occupation.toLowerCase();
    const occupation2 = user2.occupation.toLowerCase();
    
    if (occupation1 === occupation2) score += 100;
    else if (areRelatedOccupations(occupation1, occupation2)) score += 80;
    else score += 50;
  }

  return factors > 0 ? score / factors : 50;
}

// Interest compatibility
function calculateInterestCompatibility(user1, user2) {
  if (!user1.interests || !user2.interests || 
      user1.interests.length === 0 || user2.interests.length === 0) {
    return 50;
  }

  const interests1 = new Set(user1.interests);
  const interests2 = new Set(user2.interests);
  
  const commonInterests = [...interests1].filter(interest => interests2.has(interest));
  const totalInterests = new Set([...interests1, ...interests2]).size;
  
  return Math.round((commonInterests.length / totalInterests) * 100);
}

// Horoscope compatibility
async function calculateHoroscopeCompatibility(horoscope1, horoscope2) {
  let score = 0;
  let factors = 0;

  // Sun sign compatibility
  if (horoscope1.sunSign && horoscope2.sunSign) {
    factors++;
    const sunCompatibility = calculateSunSignCompatibility(horoscope1.sunSign, horoscope2.sunSign);
    score += sunCompatibility;
  }

  // Nakshatra compatibility
  if (horoscope1.nakshatra && horoscope2.nakshatra) {
    factors++;
    const nakshatraCompatibility = calculateNakshatraCompatibility(horoscope1.nakshatra, horoscope2.nakshatra);
    score += nakshatraCompatibility;
  }

  // Manglik compatibility
  if (horoscope1.compatibilityFactors?.manglik !== undefined && 
      horoscope2.compatibilityFactors?.manglik !== undefined) {
    factors++;
    const manglikCompatibility = calculateManglikCompatibility(
      horoscope1.compatibilityFactors.manglik,
      horoscope2.compatibilityFactors.manglik
    );
    score += manglikCompatibility;
  }

  return factors > 0 ? Math.round(score / factors) : 50;
}

// Helper functions for horoscope compatibility
function calculateSunSignCompatibility(sign1, sign2) {
  const compatibleSigns = {
    "Aries": ["Leo", "Sagittarius", "Gemini", "Aquarius"],
    "Taurus": ["Virgo", "Capricorn", "Cancer", "Pisces"],
    "Gemini": ["Libra", "Aquarius", "Aries", "Leo"],
    "Cancer": ["Scorpio", "Pisces", "Taurus", "Virgo"],
    "Leo": ["Aries", "Sagittarius", "Gemini", "Libra"],
    "Virgo": ["Taurus", "Capricorn", "Cancer", "Scorpio"],
    "Libra": ["Gemini", "Aquarius", "Leo", "Sagittarius"],
    "Scorpio": ["Cancer", "Pisces", "Virgo", "Capricorn"],
    "Sagittarius": ["Aries", "Leo", "Libra", "Aquarius"],
    "Capricorn": ["Taurus", "Virgo", "Scorpio", "Pisces"],
    "Aquarius": ["Gemini", "Libra", "Aries", "Sagittarius"],
    "Pisces": ["Cancer", "Scorpio", "Taurus", "Capricorn"]
  };

  if (sign1 === sign2) return 50;
  if (compatibleSigns[sign1]?.includes(sign2)) return 80;
  return 30;
}

function calculateNakshatraCompatibility(nakshatra1, nakshatra2) {
  // Simplified nakshatra compatibility
  const nakshatraGroups = {
    "Ashwini": 1, "Bharani": 2, "Krittika": 3,
    "Rohini": 4, "Mrigashira": 5, "Ardra": 6,
    "Punarvasu": 7, "Pushya": 8, "Ashlesha": 9,
    "Magha": 10, "Purva Phalguni": 11, "Uttara Phalguni": 12,
    "Hasta": 13, "Chitra": 14, "Swati": 15,
    "Vishakha": 16, "Anuradha": 17, "Jyeshtha": 18,
    "Mula": 19, "Purva Ashadha": 20, "Uttara Ashadha": 21,
    "Shravana": 22, "Dhanishtha": 23, "Shatabhisha": 24,
    "Purva Bhadrapada": 25, "Uttara Bhadrapada": 26, "Revati": 27
  };

  const group1 = nakshatraGroups[nakshatra1];
  const group2 = nakshatraGroups[nakshatra2];

  if (!group1 || !group2) return 50;

  const difference = Math.abs(group1 - group2);
  if (difference === 0) return 60;
  if (difference === 1 || difference === 26) return 80;
  if (difference === 2 || difference === 25) return 70;
  return 40;
}

function calculateManglikCompatibility(manglik1, manglik2) {
  if (manglik1 === manglik2) return 100;
  if (manglik1 && manglik2) return 100;
  if (!manglik1 && !manglik2) return 100;
  return 20;
}

// Helper function for related occupations
function areRelatedOccupations(occ1, occ2) {
  const occupationGroups = {
    'medical': ['doctor', 'nurse', 'surgeon', 'physician', 'dentist', 'pharmacist'],
    'engineering': ['engineer', 'software', 'developer', 'programmer', 'architect'],
    'business': ['manager', 'executive', 'director', 'ceo', 'entrepreneur'],
    'education': ['teacher', 'professor', 'lecturer', 'educator', 'trainer'],
    'finance': ['accountant', 'banker', 'financial', 'analyst', 'advisor']
  };

  for (const [group, occupations] of Object.entries(occupationGroups)) {
    if (occupations.some(occ => occ1.includes(occ)) && 
        occupations.some(occ => occ2.includes(occ))) {
      return true;
    }
  }
  return false;
}

