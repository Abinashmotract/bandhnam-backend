import User from '../models/User.js';

// Generate Jeevansathi-style custom ID
const generateCustomId = async () => {
  const prefixes = ['TYXX', 'TXXR', 'TXXX', 'TXYX', 'TXZX'];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  
  let customId;
  let isUnique = false;
  
  while (!isUnique) {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    customId = `${randomPrefix}${randomNum}`;
    
    // Check if this ID already exists
    const existingUser = await User.findOne({ customId });
    if (!existingUser) {
      isUnique = true;
    }
  }
  
  return customId;
};

// Middleware to generate custom ID before saving
export const generateUserIdMiddleware = async function(next) {
  if (this.isNew && !this.customId) {
    this.customId = await generateCustomId();
  }
  next();
};

export default generateCustomId;
