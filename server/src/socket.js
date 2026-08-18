import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from './config/env.js';

let io = null;

/** Attaches Socket.IO to the HTTP server with JWT auth per connection. */
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl === '*' ? true : env.clientUrl, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('unauthorized'));
    try {
      const payload = jwt.verify(token, env.jwtSecret);
      socket.userId = payload.id;
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    // Each user gets a private room so we can target notifications
    socket.join(`user:${socket.userId}`);
  });

  return io;
}

/** Emits an event to one user's private room (no-op if socket not initialised). */
export function emitToUser(userId, event, payload) {
  if (io) io.to(`user:${userId}`).emit(event, payload);
}
