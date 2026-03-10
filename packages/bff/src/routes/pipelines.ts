import { Router, Request, Response } from 'express';
import { generatePipelineSummary } from '../mock/pipelines';

const router = Router();

router.get('/summary', (_req: Request, res: Response) => {
  const summary = generatePipelineSummary();
  res.json({ success: true, data: summary, timestamp: new Date().toISOString() });
});

router.get('/runs', (req: Request, res: Response) => {
  const summary = generatePipelineSummary();
  const limit = parseInt(req.query.limit as string) || 20;
  res.json({
    success: true,
    data: summary.recentRuns.slice(0, limit),
    timestamp: new Date().toISOString(),
  });
});

router.get('/trends', (_req: Request, res: Response) => {
  const summary = generatePipelineSummary();
  res.json({
    success: true,
    data: {
      buildTimeTrend: summary.buildTimeTrend,
      workflowStats: summary.workflowStats,
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
