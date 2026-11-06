import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const PYTHON_PORT = 5000;

// Spawn Python FastAPI backend process on port 5000
console.log('[PRISMORA] Starting Python FastAPI backend on port 5000...');
const pythonExecutable = process.env.PYTHON_EXECUTABLE || (process.platform === 'win32' ? 'python' : 'python3');
const pyProc = spawn(pythonExecutable, ['-m', 'uvicorn', 'backend.app.main:app', '--host', '127.0.0.1', '--port', `${PYTHON_PORT}`], {
  cwd: __dirname,
  stdio: 'inherit',
});

pyProc.on('error', (err) => {
  console.error('[PRISMORA] Python backend spawn error:', err);
});

process.on('exit', () => pyProc.kill());
process.on('SIGINT', () => pyProc.kill());
process.on('SIGTERM', () => pyProc.kill());

// Proxy helper forwarding requests to FastAPI
function proxyToPython(req: Request, res: Response) {
  const options: http.RequestOptions = {
    hostname: '127.0.0.1',
    port: PYTHON_PORT,
    path: req.originalUrl,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${PYTHON_PORT}`,
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`[PRISMORA] Proxy error forwarding ${req.method} ${req.originalUrl}:`, err.message);
    if (!res.headersSent) {
      res.status(502).json({
        error: 'Python backend temporarily unreachable or initializing. Please retry in a moment.',
        detail: err.message,
      });
    }
  });

  req.pipe(proxyReq);
}

async function startServer() {
  const app = express();

  // Route API and static storage requests to Python backend
  app.use('/api', (req, res) => proxyToPython(req, res));
  app.use('/storage', (req, res) => proxyToPython(req, res));

  // Mount Vite middlewares for React frontend
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PRISMORA AI] Server running at http://0.0.0.0:${PORT}`);
    console.log(`[PRISMORA AI] Backend proxying /api and /storage to Python on port ${PYTHON_PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[PRISMORA AI] Failed to start server:', err);
});
