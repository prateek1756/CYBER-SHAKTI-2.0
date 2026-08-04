import { Router } from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { config } from '../config.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB cap
  fileFilter: (_req, file, cb) => {
    const isCSV = file.mimetype === 'text/csv' ||
                  file.mimetype === 'application/vnd.ms-excel' ||
                  file.originalname.toLowerCase().endsWith('.csv');
    if (isCSV) {
      cb(null, true);
    } else {
      cb(new Error("INVALID_CSV:Uploaded file is not a CSV. Please upload a valid CSV file."));
    }
  }
});

router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum allowed size is 20 MB.' });
      }
      if (typeof err.message === 'string' && err.message.startsWith('INVALID_CSV:')) {
        return res.status(400).json({ error: err.message.replace('INVALID_CSV:', '') });
      }
      return next(err);
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded. Please upload a valid CSV dataset." });
  }

  const flaskUrl = `http://${config.flask.host}:${config.flask.port}/api/mule/upload`;

  try {
    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const response = await fetch(flaskUrl, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    if (response.ok && response.body) {
      // Proxy SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Pipe the SSE stream to the client
      response.body.pipe(res);
    } else {
      const text = await response.text();
      res.status(response.status).json({ error: `Flask server error: ${text}` });
    }
  } catch (err: any) {
    console.error(`[Mule Upload Proxy Error] ${err.message}`);
    res.status(500).json({ error: `Could not connect to Flask AI server: ${err.message}` });
  }
});

router.post('/generate-demo', async (req, res) => {
  const flaskUrl = `http://${config.flask.host}:${config.flask.port}/api/mule/generate-demo`;

  try {
    const response = await fetch(flaskUrl, {
      method: 'POST'
    });

    if (response.ok && response.body) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      response.body.pipe(res);
    } else {
      const text = await response.text();
      res.status(response.status).json({ error: `Flask server error: ${text}` });
    }
  } catch (err: any) {
    console.error(`[Mule Demo Proxy Error] ${err.message}`);
    res.status(500).json({ error: `Could not connect to Flask AI server: ${err.message}` });
  }
});

router.post('/ai-analyze/:accountId', async (req, res) => {
  const { accountId } = req.params;
  const flaskUrl = `http://${config.flask.host}:${config.flask.port}/api/mule/ai-analyze/${accountId}`;

  try {
    const response = await fetch(flaskUrl, {
      method: 'POST'
    });

    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    } else {
      const text = await response.text();
      res.status(response.status).json({ error: `Flask server error: ${text}` });
    }
  } catch (err: any) {
    console.error(`[Mule AI Analyze Proxy Error] ${err.message}`);
    res.status(500).json({ error: `Could not connect to Flask AI server: ${err.message}` });
  }
});

export default router;
