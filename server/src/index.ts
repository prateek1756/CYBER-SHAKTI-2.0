import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import scamsRouter from './routes/scams.js';
import scannerRouter from './routes/scanner.js';
import deepfakeRouter from './routes/deepfake.js';
import muleRouter from './routes/mule.js';
import { PythonBridge } from './python-bridge.js';

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (config.allowedOrigins.includes(origin)) return callback(null, true);
    // Silently reject — do not throw, which would crash the server
    console.warn(`[CORS] Blocked request from origin: ${origin}`);
    return callback(null, false);
  },
  methods: ['GET', 'POST']
}));

// Strict 5 req/min limiter for compute-heavy deepfake endpoint
const deepfakeLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Deepfake analysis rate limit reached. Maximum 5 requests per minute.' }
});

const apiLimiter = rateLimit({
  windowMs: 60_000,      // 1 minute window
  max: 30,               // 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again in a minute.' }
});

app.use('/api/deepfake', deepfakeLimiter);
app.use('/api/scanner', apiLimiter);
app.use('/api/mule', apiLimiter);
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
