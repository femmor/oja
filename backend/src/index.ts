import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import appConfig from './config/env';
import connectDB from './config/db';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express"
import { functions, inngest } from "./config/inngest";

// Route imports
import userRoutes from './routes/user.route';
import adminRoutes from './routes/admin.route';
import { errorMiddleware } from './middleware/error.middleware';

const __dirname = path.resolve()

const app = express();

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../admin/dist')));
app.use(express.json());

// Initialize Clerk middleware
app.use(clerkMiddleware()); // Adds auth object to requests

// Inngest webhook endpoint
app.use('/api/inngest', serve({
    client: inngest,
    functions
}));

app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// API routes 
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
// Error handling middleware - must come after all routes
app.use(errorMiddleware);

// 404 handler - must come after error middleware
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Anything that doesn't match the above, send back index.html
app.get('/{*any}', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../admin', 'dist', 'index.html'));
});

const startServer = async () => {
    await connectDB();

    app.listen(appConfig.PORT, () => {
        console.log(`Server is running on port ${appConfig.PORT}`);
    });
}

startServer();