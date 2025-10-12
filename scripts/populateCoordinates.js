import mongoose from 'mongoose';
import User from '../models/User.js';
import { getCoordinatesFromLocation } from '../utils/geocoding.js';
import dotenv from 'dotenv';

dotenv.config();

const populateCoordinates = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all users without coordinates
    const users = await User.find({ 
      coordinates: { $exists: false },
      city: { $exists: true, $ne: null },
      state: { $exists: true, $ne: null }
    });

    console.log(`Found ${users.length} users without coordinates`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        console.log(`Processing user: ${user.name} from ${user.city}, ${user.state}`);
        
        const coordinates = await getCoordinatesFromLocation(user.city, user.state);
        
        if (coordinates) {
          await User.findByIdAndUpdate(user._id, { coordinates });
          console.log(`✅ Updated coordinates for ${user.name}: ${coordinates.lat}, ${coordinates.lng}`);
          updatedCount++;
        } else {
          console.log(`❌ Could not get coordinates for ${user.name} from ${user.city}, ${user.state}`);
          errorCount++;
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error processing user ${user.name}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n✅ Coordinates population completed:`);
    console.log(`- Updated: ${updatedCount} users`);
    console.log(`- Errors: ${errorCount} users`);
    console.log(`- Total processed: ${users.length} users`);

  } catch (error) {
    console.error('Error populating coordinates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
populateCoordinates();
