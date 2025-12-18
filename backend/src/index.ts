import express, { type Request, type Response } from 'express';
import path from 'path';
import appConfig from './config/env';
import connectDB from './config/db';

const __dirname = path.resolve()

const app = express();

app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../admin/dist')));

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