import dotenv from 'dotenv';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { sendIPCRequest } from './ipc';

dotenv.config();

const PORT = Number(process.env.WORKER_PORT || process.env.PORT || 3000);

// HTTP server — har bir worker uchun alohida portda ishlaydi
const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const chunks: Buffer[] = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', async () => {
      const body = Buffer.concat(chunks).toString();
      let parsedBody = null;

      try {
        if (body) {
          parsedBody = JSON.parse(body);
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Invalid JSON' }));
      }

      // IPC orqali masterga CRUD so‘rovni yuboramiz
      const result = await sendIPCRequest({
        method: req.method || 'GET',
        path: req.url || '/',
        body: parsedBody,
      });

      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      if (result.status !== 204) {
        res.end(JSON.stringify(result.data));
      } else {
        res.end();
      }
    });
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Internal server error' }));
  }
});

server.listen(PORT, () => {
  console.log(`Worker server is running on port ${PORT}`);
});
