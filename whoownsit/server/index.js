import 'dotenv/config';
import express from 'express';
import analyzeRouter from './routes/analyze.js';

const app = express();
app.use(express.json());
app.use('/api', analyzeRouter);

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`WhoOwnsIt server on http://localhost:${port}`);
});
