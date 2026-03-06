import { connectDB } from './config/db';
import { env } from './config/env';
import app from './app';

const startServer = async (): Promise<void> => {
    await connectDB();

    app.listen(env.PORT, () => {
        console.log(`🚀 Server running on http://localhost:${env.PORT}`);
        console.log(`📚 API Docs available at http://localhost:${env.PORT}/api-docs`);
        console.log(`🌍 Environment: ${env.NODE_ENV}`);
    });
};

startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
