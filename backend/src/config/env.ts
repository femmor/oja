import dotenv from 'dotenv';

dotenv.config();

const appConfig = {
    PORT: process.env.PORT || 5005,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_URL: process.env.DB_URL || '',
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY || '',
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY || '',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
};

// Validate required configurations
const requiredConfigs = ['DB_URL'];
requiredConfigs.forEach((config) => {
    if (!appConfig[config as keyof typeof appConfig]) {
        throw new Error(`Missing required configuration: ${config}`);
    }
});

export default appConfig;