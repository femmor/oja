import mongoose from 'mongoose';
import appConfig from './env';

const connectDB = async () => {
    try {
        await mongoose.connect(appConfig.DB_URL);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export default connectDB;