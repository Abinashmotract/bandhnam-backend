import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true 
  },
  value: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  description: String,
  category: { 
    type: String, 
    default: 'general' 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

export default mongoose.model('SystemSetting', systemSettingsSchema);
