import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Verification from '../models/Verification.js';

dotenv.config();

async function run() {
  try {
    const emailArgIndex = process.argv.findIndex(a => a === '--email');
    const email = emailArgIndex !== -1 ? process.argv[emailArgIndex + 1] : null;

    if (!email) {
      console.error('Usage: node scripts/markUserVerification.js --email user@example.com');
      process.exit(1);
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User not found for email: ${email}`);
      process.exit(1);
    }

    const now = new Date();

    // Upsert ID verification as verified
    const idVerification = await Verification.findOneAndUpdate(
      { user: user._id, type: 'id' },
      { $set: { status: 'verified', reviewedAt: now } },
      { new: true, upsert: true }
    );

    // Upsert Photo verification as verified (keep normal flow elsewhere)
    const photoVerification = await Verification.findOneAndUpdate(
      { user: user._id, type: 'photo' },
      { $set: { status: 'verified', reviewedAt: now } },
      { new: true, upsert: true }
    );

    // Update user flags
    user.isIdVerified = true;
    user.isPhotoVerified = true;
    await user.save();

    console.log('Updated verification for user:', email);
    console.log({
      idVerificationStatus: idVerification.status,
      photoVerificationStatus: photoVerification.status,
      userFlags: {
        isIdVerified: user.isIdVerified,
        isPhotoVerified: user.isPhotoVerified,
      }
    });
    process.exit(0);
  } catch (err) {
    console.error('Error updating verification:', err);
    process.exit(1);
  }
}

run();


