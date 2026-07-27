import { Router } from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { config } from '../config.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded. Please upload a CSV dataset." });
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
