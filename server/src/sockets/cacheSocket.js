import fs from 'fs';
import net from 'net';
import os from 'os';
import env from '../config/env.js';
import logger from '../utils/logger.js';

export const startCacheSocket = ({ redisClient }) => {
  const isWindows = os.platform() === 'win32';

  const socketPath = isWindows
    ? null
    : env.unixSocketPath;

  const port = isWindows ? 4001 : null;

  // Remove old socket file (Linux/macOS only)
  if (!isWindows && fs.existsSync(socketPath)) {
    fs.unlinkSync(socketPath);
  }

  const server = net.createServer((connection) => {
    connection.on('data', async (buffer) => {
      const raw = buffer.toString().trim();
      let payload = { type: 'stats' };

      try {
        payload = JSON.parse(raw || '{}');
      } catch {
        payload = { type: 'stats' };
      }

      if (payload.type === 'ping') {
        connection.write(JSON.stringify({
          ok: true,
          type: 'pong',
          ts: Date.now()
        }));
        return connection.end();
      }

      const info = await redisClient.info('memory');

      connection.write(JSON.stringify({
        ok: true,
        type: 'stats',
        mode: isWindows ? 'tcp' : 'unix',
        redisInfo: info
      }));

      connection.end();
    });
  });

  if (isWindows) {
    server.listen(port, () => {
      logger.info(`Cache socket running on TCP port ${port}`);
    });
  } else {
    server.listen(socketPath, () => {
      logger.info(`Unix cache socket listening at ${socketPath}`);
    });
  }

  return server;
};
