import dotenv from 'dotenv';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { handleRequest } from './handlers';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const chunks: Buffer[] = [];

  req.on('data', chunk => chunks.push(chunk));

  req.on('end', async () => {
    const body = Buffer.concat(chunks).toString();
    let parsedBody = null;

    try {
      if (body) parsedBody = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Invalid JSON' }));
    }

    const result = handleRequest(req.method || 'GET', req.url || '/', parsedBody);
    res.writeHead(result.status, { 'Content-Type': 'application/json' });

    if (result.status !== 204) {
      res.end(JSON.stringify(result.data));
    } else {
      res.end();
    }
  });
});

server.listen(PORT, () => {
  console.log(`Single-process server running on port ${PORT}`);
});
