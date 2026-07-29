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
  
  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || ''
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
