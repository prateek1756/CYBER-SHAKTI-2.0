import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PythonBridge {
  private process: ChildProcess | null = null;
  private isReady: boolean = false;

  public async start(): Promise<boolean> {
    console.log('[Python Bridge] Starting Flask AI server...');

    const pythonDir = path.resolve(__dirname, '../../../python');
    
    let pythonCmd = 'python';
    const isWin = process.platform === 'win32';

    const venvPaths = [
      path.join(pythonDir, 'venv', isWin ? 'Scripts/python.exe' : 'bin/python'),
      path.join(pythonDir, '.venv', isWin ? 'Scripts/python.exe' : 'bin/python')
    ];

    for (const venvPath of venvPaths) {
      const fs = await import('fs');
      if (fs.existsSync(venvPath)) {
        pythonCmd = venvPath;
        console.log(`[Python Bridge] Using Python virtual environment: ${pythonCmd}`);
        break;
      }
    }

    if (pythonCmd === 'python') {
      console.log(`[Python Bridge] Virtual environment not found. Falling back to global '${isWin ? 'python' : 'python3'}'`);
      pythonCmd = isWin ? 'python' : 'python3';
    }

    try {
      this.process = spawn(pythonCmd, ['api_server.py'], {
        cwd: pythonDir,
        env: {
          ...process.env,
          FLASK_PORT: config.flask.port,
          FLASK_HOST: config.flask.host
        }
      });

      this.process.on('error', (err) => {
        console.error(`[Python Bridge Error] Child process spawn error: ${err.message}`);
        this.isReady = false;
        this.process = null;
      });

      this.process.stdout?.on('data', (data) => {
        console.log(`[Python] ${data.toString().trim()}`);
      });

      this.process.stderr?.on('data', (data) => {
        console.error(`[Python Log/Err] ${data.toString().trim()}`);
      });

      this.process.on('close', (code) => {
        console.log(`[Python Bridge] Flask service stopped with exit code ${code}`);
        this.isReady = false;
        this.process = null;
      });

      const statsUrl = `http://${config.flask.host}:${config.flask.port}/api/deepfake/stats`;
      this.isReady = await this.pollHealthCheck(statsUrl);

      if (this.isReady) {
        console.log(`[Python Bridge] Flask service online on port ${config.flask.port}`);
      } else {
        console.warn(`[Python Bridge] Flask health check failed or timed out. Deepfake features might be unavailable.`);
      }

      return this.isReady;
    } catch (err) {
      console.error('[Python Bridge] Failed to spawn Python process:', err);
      return false;
    }
  }

  private async pollHealthCheck(url: string): Promise<boolean> {
    const { healthInterval, healthMaxRetries } = config.flask;
    console.log(`[Python Bridge] Polling health check at ${url}...`);

    for (let i = 0; i < healthMaxRetries; i++) {
      if (!this.process) {
        return false;
      }
      try {
        const res = await fetch(url);
        if (res.status === 200) {
          return true;
        }
      } catch (err) {
        // expected failure during startup
      }
      await new Promise((resolve) => setTimeout(resolve, healthInterval));
    }
    return false;
  }

  public stop() {
    if (this.process) {
      console.log('[Python Bridge] Stopping Flask AI server...');
      this.process.kill();
      this.process = null;
      this.isReady = false;
    }
  }
}
