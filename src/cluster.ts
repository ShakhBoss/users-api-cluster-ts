import cluster from "cluster";
import os from "os";
import { createServer, request } from "http";
import dotenv from "dotenv";
import { handleRequest } from './handlers'; 

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;
const numCPUS = os.availableParallelism?.() || os.cpus().length;
const numWorkers = numCPUS - 1;

if (cluster.isPrimary) {
  const ports: number[] = [];

  for (let i = 1; i <= numWorkers; i++) {
    const port = PORT + i;
    cluster.fork({ WORKER_PORT: port.toString() });
    ports.push(port);
  }

  let current = 0;

  const loadBalancer = createServer((clientReq, clientRes) => {
    const targetPort = ports[current];
    current = (current + 1) % ports.length;

    const options = {
      hostname: "localhost",
      port: targetPort,
      path: clientReq.url,
      method: clientReq.method,
      headers: clientReq.headers,
    };

    const proxy = request(options, (proxyRes) => {
      clientRes.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(clientRes, { end: true });
    });

    proxy.on("error", (err) => {
      clientRes.writeHead(500);
      clientRes.end("Internal server error");
    });

    clientReq.pipe(proxy, { end: true });
  });

  loadBalancer.listen(PORT, () => {
    console.log(`Load balancer is running on http://localhost:${PORT}`);
  });

  
  for (const id in cluster.workers) {
    const worker = cluster.workers[id];
    if (worker) {
      worker.on('message', (msg) => {
        const { reqId, method, path, body } = msg;
        const result = handleRequest(method, path, body);
        worker.send({ reqId, ...result });
      });
    }
  }
} else {
  import("./index");
}
