import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { RoomManager } from './rooms/roomManager.js';
import { setupSocketHandlers } from './socket/socketHandlers.js';
import { CHALLENGES } from './challenges/challenges.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || '*';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json({ limit: '20mb' }));

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  maxHttpBufferSize: 1e8 // 100MB for audio chunks
});

const roomManager = new RoomManager();
setupSocketHandlers(io, roomManager);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'MIMIC PARTY Game Server',
    timestamp: new Date().toISOString()
  });
});

// Available challenges
app.get('/api/challenges', (req, res) => {
  res.json({ challenges: CHALLENGES });
});

// Get room status by code
app.get('/api/room/:code', (req, res) => {
  const room = roomManager.getRoom(req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({ room });
});

httpServer.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🎭 MIMIC PARTY Game Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server active and ready`);
  console.log(`=========================================`);
});
