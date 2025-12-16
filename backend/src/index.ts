import express, { type Request, type Response } from 'express';
import path from 'path';
import appConfig from './config/env';

const __dirname = path.resolve()

const app = express();

app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Get app ready for deployment
if (appConfig.NODE_ENV === 'production') {
    // Serve static files from the React frontend app
    app.use(express.static(path.join(__dirname, '../admin/dist')));

    // Anything that doesn't match the above, send back index.html
    app.get('/{*any}', (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '../admin', 'dist', 'index.html'));
    });
}

app.listen(appConfig.PORT, () => {
    console.log(`Server is running on port ${appConfig.PORT}`);
})