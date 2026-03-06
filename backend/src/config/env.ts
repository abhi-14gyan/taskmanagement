import dotenv from 'dotenv';
dotenv.config();

const getEnv = (key: string, fallback?: string): string => {
    const value = process.env[key] ?? fallback;
    if (value === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};

export const env = {
    PORT: parseInt(getEnv('PORT', '5000'), 10),
    NODE_ENV: getEnv('NODE_ENV', 'development'),
    MONGODB_URI: getEnv('MONGODB_URI'),
    JWT_SECRET: getEnv('JWT_SECRET'),
    JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '7d'),
    COOKIE_SECRET: getEnv('COOKIE_SECRET'),
    CLIENT_URL: getEnv('CLIENT_URL', 'http://localhost:3000'),
} as const;
