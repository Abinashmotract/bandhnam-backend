import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import SuccessStory from '../models/SuccessStory.js';

dotenv.config();

async function run() {
  try {
    await connectDB();

    const stories = [
      {
        bride: { name: 'Priya Sharma' },
        groom: { name: 'Rahul Verma' },
        title: 'Rahul & Priya',
        story: 'We met on Bandhnam Nammatch in 2023, connected instantly, and tied the knot last year. Thank you for bringing us together!',
        weddingDate: new Date('2024-02-14'),
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        tags: ['Love Marriage','Travel Lovers'],
        photos: ['/public/receiver.jpg'],
        isFeatured: true,
        isPublic: true,
        status: 'approved',
        views: 120,
        likes: 32,
        shares: 11
      },
      {
        bride: { name: 'Neha Gupta' },
        groom: { name: 'Vikram Singh' },
        title: 'Vikram & Neha',
        story: 'Career-focused and in different cities, we never thought we would find such compatibility. Bandhnam made it possible.',
        weddingDate: new Date('2023-06-18'),
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        tags: ['Career-oriented','Compatibility Match'],
        photos: ['/public/receiver.jpg'],
        isFeatured: true,
        isPublic: true,
        status: 'approved',
        views: 210,
        likes: 58,
        shares: 22
      }
    ];

    for (const s of stories) {
      await SuccessStory.findOneAndUpdate(
        { title: s.title },
        s,
        { upsert: true, new: true }
      );
    }

    console.log('Seeded success stories.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

run();


