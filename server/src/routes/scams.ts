import { Router } from 'express';
import mysql from 'mysql2/promise';
import { config } from '../config.js';

const router = Router();
let pool: mysql.Pool | null = null;

async function getDbPool() {
  if (pool) return pool;

  try {
    const tempConn = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password
    });
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\``);
    await tempConn.end();
  } catch (err: any) {
    console.warn(`[Database Pre-check Warning] Could not check or create database: ${err.message}`);
  }

  try {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      multipleStatements: true
    });
    const conn = await pool.getConnection();
    console.log('[Database] MySQL connection pool established successfully.');

    try {
      const [rows]: any = await conn.query("SHOW TABLES LIKE 'scam_reports'");
      if (rows.length === 0) {
        console.log('[Database] Table scam_reports not found. Running auto-initialization from database/schema.sql...');
        const fs = await import('fs');
        const path = await import('path');
        const { fileURLToPath } = await import('url');
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        
        const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
        if (fs.existsSync(schemaPath)) {
          const schema = fs.readFileSync(schemaPath, 'utf8');
          const cleanSchema = schema
            .replace(/DELIMITER\s+\$\$/g, '')
            .replace(/DELIMITER\s+;/g, '')
            .replace(/\$\$/g, ';');
          
          const statements = cleanSchema
            .split(/;\s*$/m)
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('USE') && !s.startsWith('CREATE DATABASE'));
            
          for (const stmt of statements) {
            await conn.query(stmt);
          }
          console.log('[Database] Database tables, triggers, and stored procedures initialized successfully.');
        } else {
          console.warn(`[Database Warning] Schema file not found at ${schemaPath}`);
        }
      }
    } catch (migError: any) {
      console.error(`[Database Error] Auto-migration failed: ${migError.message}`);
    } finally {
      conn.release();
    }

    return pool;
  } catch (err: any) {
    console.warn(`[Database Warning] MySQL connection failed: ${err.message}. Using in-memory mock database.`);
    pool = null;
    return null;
  }
}

interface ScamReport {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

const mockScams: ScamReport[] = [
  {
    id: 1,
    title: "Fake Bank KYC SMS Scam",
    description: "Fraudsters sending SMS asking to update SBI KYC immediately via a suspicious link to avoid account suspension.",
    latitude: 28.6139,
    longitude: 77.2090,
    status: 'verified',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "Electricity Bill Fraud Call",
    description: "Received call from an unknown number threatening to disconnect electricity within 2 hours if payment is not made via APK link.",
    latitude: 19.0760,
    longitude: 72.8777,
    status: 'verified',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: "Part-time Job Offer Telegram Scam",
    description: "Scammers offering Rs 5000/day for liking YouTube videos. They eventually ask to deposit money in a crypto wallet.",
    latitude: 12.9716,
    longitude: 77.5946,
    status: 'verified',
    created_at: new Date().toISOString()
  }
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

router.get('/', async (req, res) => {
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : null;
  const lng = req.query.lng ? parseFloat(req.query.lng as string) : null;
  const radius = req.query.radius ? parseFloat(req.query.radius as string) : 10;

  const db = await getDbPool();
  if (db) {
    try {
      if (lat !== null && lng !== null) {
        const [rows]: any = await db.query('CALL GetNearbyScams(?, ?, ?)', [lat, lng, radius]);
        return res.json(rows[0] || []);
      } else {
        const [rows] = await db.query('SELECT id, title, description, latitude, longitude, status, created_at FROM scam_reports WHERE status = "verified" ORDER BY created_at DESC');
        return res.json(rows);
      }
    } catch (err: any) {
      console.error('[Database Error] Query failed:', err.message);
    }
  }

  if (lat !== null && lng !== null) {
    const nearby = mockScams
      .filter(s => s.status === 'verified')
      .map(s => ({
        ...s,
        distance: calculateDistance(lat, lng, s.latitude, s.longitude)
      }))
      .filter(s => s.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
    return res.json(nearby);
  }
  
  return res.json(mockScams.filter(s => s.status === 'verified'));
});

router.post('/', async (req, res) => {
  const { title, description, latitude, longitude } = req.body;

  if (!title || !description || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: "Missing required fields: title, description, latitude, longitude" });
  }

  const db = await getDbPool();
  if (db) {
    try {
      const [result]: any = await db.query(
        'INSERT INTO scam_reports (title, description, latitude, longitude, status) VALUES (?, ?, ?, ?, ?)',
        [title, description, latitude, longitude, 'verified']
      );
      return res.status(201).json({
        message: "Scam report submitted successfully",
        id: result.insertId
      });
    } catch (err: any) {
      console.error('[Database Error] Insert failed:', err.message);
    }
  }

  const newScam: ScamReport = {
    id: mockScams.length + 1,
    title,
    description,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    status: 'verified',
    created_at: new Date().toISOString()
  };
  mockScams.unshift(newScam);
  
  return res.status(201).json({
    message: "Scam report submitted successfully (Saved in-memory mock)",
    id: newScam.id
  });
});

export default router;
