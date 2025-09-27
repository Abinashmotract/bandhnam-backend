import Horoscope from "../models/Horoscope.js";
import User from "../models/User.js";

// Add horoscope details
export const addHoroscope = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      coordinates,
      sunSign,
      moonSign,
      risingSign,
      nakshatra,
      nakshatraLord,
      nakshatraPada,
      planetaryPositions,
      compatibilityFactors,
      horoscopeFile,
      remarks
    } = req.body;

    // Check if horoscope already exists
    const existingHoroscope = await Horoscope.findOne({ user: userId });
    if (existingHoroscope) {
      return res.status(400).json({
        success: false,
        message: "Horoscope already exists for this user"
      });
    }

    const horoscope = await Horoscope.create({
      user: userId,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      coordinates,
      sunSign,
      moonSign,
      risingSign,
      nakshatra,
      nakshatraLord,
      nakshatraPada,
      planetaryPositions,
      compatibilityFactors,
      horoscopeFile,
      remarks
    });

    res.status(201).json({
      success: true,
      message: "Horoscope added successfully",
      data: horoscope
    });

  } catch (error) {
    console.error("Add horoscope error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding horoscope",
      error: error.message
    });
  }
};

// Get horoscope details
export const getHoroscope = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const horoscope = await Horoscope.findOne({ user: userId });
    if (!horoscope) {
      return res.status(404).json({
        success: false,
        message: "Horoscope not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Horoscope fetched successfully",
      data: horoscope
    });

  } catch (error) {
    console.error("Get horoscope error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching horoscope",
      error: error.message
    });
  }
};

// Update horoscope details
export const updateHoroscope = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    const horoscope = await Horoscope.findOneAndUpdate(
      { user: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!horoscope) {
      return res.status(404).json({
        success: false,
        message: "Horoscope not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Horoscope updated successfully",
      data: horoscope
    });

  } catch (error) {
    console.error("Update horoscope error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating horoscope",
      error: error.message
    });
  }
};

// Calculate horoscope compatibility
export const calculateCompatibility = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    const horoscope1 = await Horoscope.findOne({ user: userId1 });
    const horoscope2 = await Horoscope.findOne({ user: userId2 });

    if (!horoscope1 || !horoscope2) {
      return res.status(404).json({
        success: false,
        message: "Horoscope details not found for one or both users"
      });
    }

    // Basic compatibility calculation
    let compatibilityScore = 0;
    let totalFactors = 0;

    // Sun sign compatibility
    if (horoscope1.sunSign && horoscope2.sunSign) {
      totalFactors++;
      const sunCompatibility = calculateSunSignCompatibility(horoscope1.sunSign, horoscope2.sunSign);
      compatibilityScore += sunCompatibility;
    }

    // Nakshatra compatibility
    if (horoscope1.nakshatra && horoscope2.nakshatra) {
      totalFactors++;
      const nakshatraCompatibility = calculateNakshatraCompatibility(horoscope1.nakshatra, horoscope2.nakshatra);
      compatibilityScore += nakshatraCompatibility;
    }

    // Manglik compatibility
    if (horoscope1.compatibilityFactors?.manglik !== undefined && 
        horoscope2.compatibilityFactors?.manglik !== undefined) {
      totalFactors++;
      const manglikCompatibility = calculateManglikCompatibility(
        horoscope1.compatibilityFactors.manglik,
        horoscope2.compatibilityFactors.manglik
      );
      compatibilityScore += manglikCompatibility;
    }

    const overallScore = totalFactors > 0 ? Math.round(compatibilityScore / totalFactors) : 0;

    res.status(200).json({
      success: true,
      message: "Compatibility calculated successfully",
      data: {
        overallScore,
        breakdown: {
          sunSign: horoscope1.sunSign && horoscope2.sunSign ? 
            calculateSunSignCompatibility(horoscope1.sunSign, horoscope2.sunSign) : null,
          nakshatra: horoscope1.nakshatra && horoscope2.nakshatra ? 
            calculateNakshatraCompatibility(horoscope1.nakshatra, horoscope2.nakshatra) : null,
          manglik: horoscope1.compatibilityFactors?.manglik !== undefined && 
            horoscope2.compatibilityFactors?.manglik !== undefined ? 
            calculateManglikCompatibility(
              horoscope1.compatibilityFactors.manglik,
              horoscope2.compatibilityFactors.manglik
            ) : null
        }
      }
    });

  } catch (error) {
    console.error("Calculate compatibility error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while calculating compatibility",
      error: error.message
    });
  }
};

// Helper functions for compatibility calculations
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

  if (sign1 === sign2) return 50; // Same sign
  if (compatibleSigns[sign1]?.includes(sign2)) return 80; // Compatible
  return 30; // Incompatible
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
  if (difference === 0) return 60; // Same nakshatra
  if (difference === 1 || difference === 26) return 80; // Adjacent
  if (difference === 2 || difference === 25) return 70; // Close
  return 40; // Distant
}

function calculateManglikCompatibility(manglik1, manglik2) {
  if (manglik1 === manglik2) return 100; // Both manglik or both non-manglik
  if (manglik1 && manglik2) return 100; // Both manglik
  if (!manglik1 && !manglik2) return 100; // Both non-manglik
  return 20; // One manglik, one non-manglik
}

// Get horoscope matches
export const getHoroscopeMatches = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { minScore = 60 } = req.query;

    const currentUserHoroscope = await Horoscope.findOne({ user: currentUserId });
    if (!currentUserHoroscope) {
      return res.status(400).json({
        success: false,
        message: "Please add your horoscope details first"
      });
    }

    // Get all other users with horoscope details
    const otherHoroscopes = await Horoscope.find({ 
      user: { $ne: currentUserId } 
    }).populate('user', 'name profileImage location occupation');

    const matches = [];

    for (const horoscope of otherHoroscopes) {
      // Calculate compatibility
      let compatibilityScore = 0;
      let totalFactors = 0;

      if (currentUserHoroscope.sunSign && horoscope.sunSign) {
        totalFactors++;
        compatibilityScore += calculateSunSignCompatibility(
          currentUserHoroscope.sunSign, 
          horoscope.sunSign
        );
      }

      if (currentUserHoroscope.nakshatra && horoscope.nakshatra) {
        totalFactors++;
        compatibilityScore += calculateNakshatraCompatibility(
          currentUserHoroscope.nakshatra, 
          horoscope.nakshatra
        );
      }

      if (currentUserHoroscope.compatibilityFactors?.manglik !== undefined && 
          horoscope.compatibilityFactors?.manglik !== undefined) {
        totalFactors++;
        compatibilityScore += calculateManglikCompatibility(
          currentUserHoroscope.compatibilityFactors.manglik,
          horoscope.compatibilityFactors.manglik
        );
      }

      const overallScore = totalFactors > 0 ? Math.round(compatibilityScore / totalFactors) : 0;

      if (overallScore >= minScore) {
        matches.push({
          user: horoscope.user,
          horoscope: {
            sunSign: horoscope.sunSign,
            nakshatra: horoscope.nakshatra,
            manglik: horoscope.compatibilityFactors?.manglik
          },
          compatibilityScore: overallScore
        });
      }
    }

    // Sort by compatibility score
    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.status(200).json({
      success: true,
      message: "Horoscope matches fetched successfully",
      data: matches
    });

  } catch (error) {
    console.error("Get horoscope matches error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching horoscope matches",
      error: error.message
    });
  }
};
