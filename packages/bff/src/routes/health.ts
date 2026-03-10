import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'inferops-bff',
    version: '0.1.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    datasources: {
      githubActions: { status: 'mock', connected: true },
      azureMonitor: { status: 'mock', connected: true },
      customWebhook: { status: 'mock', connected: true },
      aiEngine: { status: 'mock', connected: true },
    },
  });
});

export default router;
