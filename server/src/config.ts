import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from workspace root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || '8080',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configs
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cybershakti'
  },
  
  // Flask Configs
  flask: {
    host: process.env.FLASK_HOST || '127.0.0.1',
    port: process.env.FLASK_PORT || '5001',
    healthTimeout: parseInt(process.env.FLASK_HEALTH_TIMEOUT || '10000', 10),
    healthInterval: parseInt(process.env.FLASK_HEALTH_INTERVAL || '500', 10),
    healthMaxRetries: parseInt(process.env.FLASK_HEALTH_MAX_RETRIES || '20', 10),
    shutdownTimeout: parseInt(process.env.FLASK_SHUTDOWN_TIMEOUT || '5000', 10)
  }
};
