/**
 * Concepto Unified Development Server
 * Runs both FastAPI backend and Vite frontend concurrently with clean unified logging.
 * Usage: `npm run dev` or `node run.js`
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

// Detect Python executable
function getPythonCommand() {
  const isWin = process.platform === 'win32';
  const venvPython = isWin
    ? path.join(backendDir, '.venv', 'Scripts', 'python.exe')
    : path.join(backendDir, '.venv', 'bin', 'python');

  if (fs.existsSync(venvPython)) {
    return venvPython;
  }
  return isWin ? 'python' : 'python3';
}

// Colors
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log(`${CYAN}======================================================${RESET}`);
console.log(`${CYAN}   🚀 Starting Concepto (Backend + Frontend)          ${RESET}`);
console.log(`${CYAN}======================================================${RESET}\n`);

const pythonBin = getPythonCommand();
const isWin = process.platform === 'win32';
const npmBin = isWin ? 'npm.cmd' : 'npm';

// 1. Spawn FastAPI Backend
const backendEnv = {
  ...process.env,
  PYTHONPATH: `${rootDir}${path.delimiter}${backendDir}${path.delimiter}${process.env.PYTHONPATH || ''}`,
};

const backendProcess = spawn(
  pythonBin,
  ['-m', 'uvicorn', 'app.main:app', '--reload', '--port', '8000'],
  {
    cwd: backendDir,
    env: backendEnv,
    shell: isWin,
    stdio: ['inherit', 'pipe', 'pipe'],
  }
);

backendProcess.stdout.on('data', (data) => {
  process.stdout.write(`${CYAN}[Backend]${RESET} ${data.toString()}`);
});

backendProcess.stderr.on('data', (data) => {
  process.stderr.write(`${CYAN}[Backend]${RESET} ${data.toString()}`);
});

backendProcess.on('error', (err) => {
  console.error(`${CYAN}[Backend Error]${RESET}`, err.message);
});

// 2. Spawn Vite Frontend
const frontendProcess = spawn(npmBin, ['run', 'dev'], {
  cwd: frontendDir,
  shell: isWin,
  stdio: ['inherit', 'pipe', 'pipe'],
});

frontendProcess.stdout.on('data', (data) => {
  process.stdout.write(`${GREEN}[Frontend]${RESET} ${data.toString()}`);
});

frontendProcess.stderr.on('data', (data) => {
  process.stderr.write(`${GREEN}[Frontend]${RESET} ${data.toString()}`);
});

frontendProcess.on('error', (err) => {
  console.error(`${GREEN}[Frontend Error]${RESET}`, err.message);
});

// Handle graceful shutdown
let isShuttingDown = false;
function cleanup() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n${YELLOW}[Concepto] Shutting down services...${RESET}`);
  try {
    if (isWin) {
      if (backendProcess && backendProcess.pid) spawn('taskkill', ['/pid', String(backendProcess.pid), '/f', '/t'], { shell: true });
      if (frontendProcess && frontendProcess.pid) spawn('taskkill', ['/pid', String(frontendProcess.pid), '/f', '/t'], { shell: true });
    } else {
      backendProcess.kill('SIGTERM');
      frontendProcess.kill('SIGTERM');
    }
  } catch (_) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
