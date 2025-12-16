import dotenv from 'dotenv';

dotenv.config();

const appConfig = {
    PORT: process.env.PORT || 5005,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_URL: process.env.DB_URL || '',
};

export default appConfig;