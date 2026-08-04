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

    const pythonDir = path.resolve(__dirname, '../../python');
    console.log(`[Python Bridge] Python directory resolved to: ${pythonDir}`);
    
    const fs = await import('fs');
    const { execSync } = await import('child_process');
    let pythonCmd: string | null = null;
    const isWin = process.platform === 'win32';

    // 1. Check for venv inside the python directory (highest priority)
    const venvPaths = [
      path.join(pythonDir, 'venv', isWin ? 'Scripts\\python.exe' : 'bin/python'),
      path.join(pythonDir, '.venv', isWin ? 'Scripts\\python.exe' : 'bin/python')
    ];

    for (const venvPath of venvPaths) {
      if (fs.existsSync(venvPath)) {
        pythonCmd = venvPath;
        console.log(`[Python Bridge] Using venv Python: ${pythonCmd}`);
        break;
      }
    }

    // 2. Check PYTHON_CMD env var (allows manual override)
    if (!pythonCmd && process.env.PYTHON_CMD) {
      pythonCmd = process.env.PYTHON_CMD;
      console.log(`[Python Bridge] Using PYTHON_CMD env override: ${pythonCmd}`);
    }

    // 3. On Windows, resolve candidate names to absolute paths via 'where' command
    // Never pass bare names to spawn — they fail if PATH isn't inherited
    if (!pythonCmd) {
      const candidates = isWin ? ['python', 'python3', 'py'] : ['python3', 'python'];
      for (const candidate of candidates) {
        try {
          const whereCmd = isWin ? `where ${candidate}` : `which ${candidate}`;
          const result = execSync(whereCmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
          // 'where' returns one path per line — take the first
          const firstPath = result.split('\n')[0].trim();
          if (firstPath && fs.existsSync(firstPath)) {
            pythonCmd = firstPath;
            console.log(`[Python Bridge] Resolved Python to absolute path: ${pythonCmd}`);
            break;
          }
        } catch {
          // candidate not found, try next
        }
      }
    }

    if (!pythonCmd) {
      console.error('[Python Bridge] Could not find any Python executable. Set PYTHON_CMD env var to the full path of your python.exe');
      return false;
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

      const statsUrl = `http://${config.flask.host}:${config.flask.port}/health`;
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
