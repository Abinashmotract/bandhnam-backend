import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB at:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
    } catch (err) {
        console.error('DB connection failed', err);
        process.exit(1);
    }
};

export default connectDB;
