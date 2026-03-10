import { Router, Request, Response } from 'express';
import {
  generateIncidentPrediction,
  generateAnomalies,
  generateAlertClusters,
  generateLogPatterns,
} from '../mock/ai-data';

const router = Router();

router.get('/predict/:deploymentId', (req: Request, res: Response) => {
  const prediction = generateIncidentPrediction(req.params.deploymentId);
  res.json({ success: true, data: prediction, timestamp: new Date().toISOString() });
});

router.get('/predict', (_req: Request, res: Response) => {
  const prediction = generateIncidentPrediction();
  res.json({ success: true, data: prediction, timestamp: new Date().toISOString() });
});

router.get('/anomalies', (req: Request, res: Response) => {
  const count = parseInt(req.query.count as string) || 8;
  const anomalies = generateAnomalies(count);
  res.json({ success: true, data: anomalies, timestamp: new Date().toISOString() });
});

router.get('/alerts/clusters', (req: Request, res: Response) => {
  const count = parseInt(req.query.count as string) || 4;
  const clusters = generateAlertClusters(count);
  res.json({ success: true, data: clusters, timestamp: new Date().toISOString() });
});

router.get('/logs/patterns', (req: Request, res: Response) => {
  const count = parseInt(req.query.count as string) || 6;
  const patterns = generateLogPatterns(count);
  res.json({ success: true, data: patterns, timestamp: new Date().toISOString() });
});

export default router;
