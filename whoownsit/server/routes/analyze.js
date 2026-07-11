import { Router } from 'express';

const router = Router();

// POST /analyze and GET /calc are added by issue #6.

router.get('/health', (req, res) => {
  res.json({ ok: true, mock: process.env.MOCK_MODE === 'true' });
});

export default router;
