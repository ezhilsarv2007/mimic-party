import { Server, Socket } from 'socket.io';
import { RoomManager } from '../rooms/roomManager.js';
import { GameMode } from '../types.js';

export function setupSocketHandlers(io: Server, roomManager: RoomManager) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Create Room
    socket.on('room:create', (payload: { playerName: string; avatar?: string }, callback) => {
      try {
        const { room, error } = roomManager.createRoom(socket.id, payload?.playerName, payload?.avatar);
        if (error || !room) {
          return callback?.({ success: false, error: error || 'Failed to create room' });
        }

        socket.join(room.roomCode);
        callback?.({ success: true, room });
        io.to(room.roomCode).emit('room:update', room);
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    // Join Room
    socket.on('room:join', (payload: { roomCode: string; playerName: string; avatar?: string }, callback) => {
      try {
        const { room, error } = roomManager.joinRoom(payload?.roomCode, socket.id, payload?.playerName, payload?.avatar);
        if (error || !room) {
          return callback?.({ success: false, error: error || 'Failed to join room' });
        }

        socket.join(room.roomCode);
        callback?.({ success: true, room });
        io.to(room.roomCode).emit('room:update', room);
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    // Ready Toggle
    socket.on('room:ready', (callback) => {
      try {
        const { room, error } = roomManager.toggleReady(socket.id);
        if (error || !room) {
          return callback?.({ success: false, error });
        }

        callback?.({ success: true, room });
        io.to(room.roomCode).emit('room:update', room);
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    // Set Game Mode (Host only)
    socket.on('room:mode', (payload: { mode: GameMode }, callback) => {
      try {
        const { room, error } = roomManager.setGameMode(socket.id, payload.mode);
        if (error || !room) {
          return callback?.({ success: false, error });
        }

        callback?.({ success: true, room });
        io.to(room.roomCode).emit('room:update', room);
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    // Start Game (Host only)
    socket.on('game:start', (callback) => {
      try {
        const { room, error } = roomManager.startGame(socket.id);
        if (error || !room) {
          return callback?.({ success: false, error });
        }

        callback?.({ success: true, room });
        io.to(room.roomCode).emit('room:update', room);
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    // Submit Audio Performance
    socket.on('performance:submit', async (payload: { audioData?: string; duration?: number }, callback) => {
      try {
        socket.emit('analysis:started');
        const { room, allSubmitted, error } = await roomManager.submitPerformance(
          socket.id, 
          payload?.audioData, 
          payload?.duration
        );

        if (error || !room) {
          return callback?.({ success: false, error });
        }

        callback?.({ success: true, room });
        io.to(room.roomCode).emit('room:update', room);

        if (allSubmitted) {
          io.to(room.roomCode).emit('round:complete', room);
        }
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    // Advance Game (Host advances from results -> leaderboard or next round)
    socket.on('game:advance', (callback) => {
      try {
        const { room, error } = roomManager.advanceGame(socket.id);
        if (error || !room) {
          return callback?.({ success: false, error });
        }

        callback?.({ success: true, room });
        io.to(room.roomCode).emit('room:update', room);
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    // Restart Game (Host only)
    socket.on('game:restart', (callback) => {
      try {
        const { room, error } = roomManager.restartGame(socket.id);
        if (error || !room) {
          return callback?.({ success: false, error });
        }

        callback?.({ success: true, room });
        io.to(room.roomCode).emit('room:update', room);
      } catch (err: any) {
        callback?.({ success: false, error: err.message });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
      const { room } = roomManager.leaveRoom(socket.id);
      if (room) {
        io.to(room.roomCode).emit('room:update', room);
      }
    });
  });
}
