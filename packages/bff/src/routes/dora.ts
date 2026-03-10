import { Router, Request, Response } from 'express';
import { generateDORAMetrics } from '../mock/dora-metrics';

const router = Router();

router.get('/metrics', (_req: Request, res: Response) => {
  const metrics = generateDORAMetrics();
  res.json({ success: true, data: metrics, timestamp: new Date().toISOString() });
});

export default router;
