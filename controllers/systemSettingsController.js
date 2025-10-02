import mongoose from "mongoose";

// Create a simple settings schema for system configuration
const systemSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  description: String,
  category: { type: String, default: 'general' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const SystemSetting = mongoose.model('SystemSetting', systemSettingsSchema);

// Get all system settings
export const getAllSystemSettings = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = {};
    if (category) {
      query.category = category;
    }
    
    const settings = await SystemSetting.find(query).sort({ category: 1, key: 1 });
    
    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});
    
    res.status(200).json({
      success: true,
      message: "System settings retrieved successfully",
      data: {
        settings: groupedSettings,
        categories: Object.keys(groupedSettings)
      }
    });
  } catch (error) {
    console.error("Get system settings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching system settings",
      error: error.message
    });
  }
};

// Update system setting
export const updateSystemSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;
    
    const setting = await SystemSetting.findOneAndUpdate(
      { key },
      { 
        value, 
        description,
        updatedBy: req.user.id
      },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: "System setting updated successfully",
      data: setting
    });
  } catch (error) {
    console.error("Update system setting error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating system setting",
      error: error.message
    });
  }
};

// Create system setting
export const createSystemSetting = async (req, res) => {
  try {
    const { key, value, description, category } = req.body;
    
    const setting = new SystemSetting({
      key,
      value,
      description,
      category: category || 'general',
      updatedBy: req.user.id
    });
    
    await setting.save();
    
    res.status(201).json({
      success: true,
      message: "System setting created successfully",
      data: setting
    });
  } catch (error) {
    console.error("Create system setting error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating system setting",
      error: error.message
    });
  }
};

// Delete system setting
export const deleteSystemSetting = async (req, res) => {
  try {
    const { key } = req.params;
    
    const setting = await SystemSetting.findOneAndDelete({ key });
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "System setting not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "System setting deleted successfully"
    });
  } catch (error) {
    console.error("Delete system setting error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting system setting",
      error: error.message
    });
  }
};

// Get system health
export const getSystemHealth = async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Get basic system metrics
    const totalUsers = await mongoose.connection.db.collection('users').countDocuments();
    const totalInteractions = await mongoose.connection.db.collection('interactions').countDocuments();
    
    const systemHealth = {
      database: {
        status: dbStatus,
        connection: mongoose.connection.readyState
      },
      metrics: {
        totalUsers,
        totalInteractions,
        uptime: process.uptime()
      },
      timestamp: new Date()
    };
    
    res.status(200).json({
      success: true,
      message: "System health retrieved successfully",
      data: systemHealth
    });
  } catch (error) {
    console.error("Get system health error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching system health",
      error: error.message
    });
  }
};

// Initialize default system settings
export const initializeDefaultSettings = async (req, res) => {
  try {
    const defaultSettings = [
      {
        key: 'site_name',
        value: 'BandhanM',
        description: 'Website name',
        category: 'general'
      },
      {
        key: 'site_description',
        value: 'Find your perfect life partner',
        description: 'Website description',
        category: 'general'
      },
      {
        key: 'max_profile_photos',
        value: 5,
        description: 'Maximum number of photos per profile',
        category: 'profile'
      },
      {
        key: 'profile_completion_required',
        value: 80,
        description: 'Minimum profile completion percentage required',
        category: 'profile'
      },
      {
        key: 'email_verification_required',
        value: true,
        description: 'Whether email verification is required',
        category: 'verification'
      },
      {
        key: 'phone_verification_required',
        value: true,
        description: 'Whether phone verification is required',
        category: 'verification'
      },
      {
        key: 'max_daily_likes',
        value: 50,
        description: 'Maximum likes per day for free users',
        category: 'limits'
      },
      {
        key: 'max_daily_interests',
        value: 10,
        description: 'Maximum interests per day for free users',
        category: 'limits'
      },
      {
        key: 'maintenance_mode',
        value: false,
        description: 'Whether the site is in maintenance mode',
        category: 'system'
      },
      {
        key: 'registration_enabled',
        value: true,
        description: 'Whether new user registration is enabled',
        category: 'system'
      }
    ];
    
    for (const setting of defaultSettings) {
      await SystemSetting.findOneAndUpdate(
        { key: setting.key },
        { ...setting, updatedBy: req.user.id },
        { upsert: true }
      );
    }
    
    res.status(200).json({
      success: true,
      message: "Default system settings initialized successfully"
    });
  } catch (error) {
    console.error("Initialize default settings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while initializing default settings",
      error: error.message
    });
  }
};
