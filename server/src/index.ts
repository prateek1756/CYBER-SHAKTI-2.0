import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import scamsRouter from './routes/scams.js';
import scannerRouter from './routes/scanner.js';
import deepfakeRouter from './routes/deepfake.js';
import muleRouter from './routes/mule.js';
import { PythonBridge } from './python-bridge.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/scams', scamsRouter);
app.use('/api/scanner', scannerRouter);
app.use('/api/deepfake', deepfakeRouter);
app.use('/api/mule', muleRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: "ok", mode: config.nodeEnv });
});

const bridge = new PythonBridge();

async function startServer() {
  const bridgeStarted = await bridge.start();
  if (!bridgeStarted) {
    console.warn('[Server] Python Flask microservice failed to initialize properly. Running in Express-only mode.');
  }

  const server = app.listen(config.port, () => {
    console.log(`[Server] CyberShakti Express backend running on port ${config.port} in ${config.nodeEnv} mode.`);
  });

  const shutdown = () => {
    console.log('[Server] Shutting down Express server...');
    server.close(() => {
      console.log('[Server] Express server closed.');
      bridge.stop();
      process.exit(0);
    });
    setTimeout(() => {
      console.error('[Server] Forced shutdown.');
      process.exit(1);
    }, config.flask.shutdownTimeout);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch(err => {
  console.error('[Server] Critical failure during startup:', err);
  process.exit(1);
});
