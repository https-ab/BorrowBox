import http from 'http';
import app from './app.js';
import env from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket.js';

async function main() {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.port, '0.0.0.0', () => {
    console.log(`[server] BorrowBox API running on port ${env.port}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
