import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

import healthRouter from './routes/health';
import pipelinesRouter from './routes/pipelines';
import doraRouter from './routes/dora';
import aiRouter from './routes/ai';
import { generateLivePipelineEvent } from './mock/pipelines';
import { generateAnomalies } from './mock/ai-data';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.BFF_PORT || 4000;

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// REST Routes
app.use('/api/health', healthRouter);
app.use('/api/pipelines', pipelinesRouter);
app.use('/api/dora', doraRouter);
app.use('/api/ai', aiRouter);

// WebSocket for real-time pipeline feed
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  // Send live pipeline events every 3-8 seconds
  const pipelineInterval = setInterval(() => {
    const event = generateLivePipelineEvent();
    socket.emit('pipeline:event', event);
  }, Math.random() * 5000 + 3000);

  // Send anomaly updates every 10-15 seconds
  const anomalyInterval = setInterval(() => {
    const anomalies = generateAnomalies(2);
    socket.emit('anomaly:detected', anomalies);
  }, Math.random() * 5000 + 10000);

  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
    clearInterval(pipelineInterval);
    clearInterval(anomalyInterval);
  });
});

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║          InferOps — BFF Server                ║
║──────────────────────────────────────────────────║
║  REST API:    http://localhost:${PORT}/api          ║
║  WebSocket:   ws://localhost:${PORT}                ║
║  Health:      http://localhost:${PORT}/api/health   ║
║  Mode:        ${process.env.AI_API_KEY ? 'LIVE' : 'MOCK DATA'}                       ║
╚══════════════════════════════════════════════════╝
  `);
});

export default app;
