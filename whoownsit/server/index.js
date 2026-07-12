import 'dotenv/config';
import express from 'express';
import analyzeRouter from './routes/analyze.js';

const app = express();
// Render/Cloudflare sit in front of us; trust their X-Forwarded-For so
// req.ip is the real client (rate limiting is per-user, not per-proxy).
app.set('trust proxy', true);
app.disable('x-powered-by');
app.use(express.json());
app.use('/api', analyzeRouter);

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`WhoOwnsIt server on http://localhost:${port}`);
});
