import { 
  RoomState, 
  Player, 
  GameMode, 
  ChaosModifier, 
  Challenge, 
  PlayerRoundResult, 
  ScoreBreakdown 
} from '../types.js';
import { 
  getRandomChallenge, 
  getRandomChaosModifier, 
  CHALLENGES 
} from '../challenges/challenges.js';
import { evaluatePerformance } from '../scoring/evaluator.js';

interface RoomInternal {
  roomCode: string;
  hostId: string;
  status: RoomState['status'];
  mode: GameMode;
  currentChaosModifier?: ChaosModifier;
  maxPlayers: number;
  players: Map<string, Player>;
  currentRound: number;
  totalRounds: number;
  usedChallengeIds: string[];
  currentChallenge?: Challenge;
  roundResults: PlayerRoundResult[];
  roundSubmissions: Map<string, { audioData?: string; duration?: number }>;
  winner?: { player: Player; title: string };
  countdown?: number;
}

export class RoomManager {
  private rooms: Map<string, RoomInternal> = new Map();
  private playerRoomMap: Map<string, string> = new Map();

  generateRoomCode(): string {
    let code = '';
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(hostId: string, playerName: string, avatar: string = '🎭'): { room: RoomState; error?: string } {
    // Leave previous room if any
    this.leaveRoom(hostId);

    const roomCode = this.generateRoomCode();
    const hostPlayer: Player = {
      id: hostId,
      name: playerName.trim() || 'Host',
      avatar: avatar || '🎭',
      isHost: true,
      isReady: true,
      totalScore: 0,
      connected: true,
      roundScores: []
    };

    const room: RoomInternal = {
      roomCode,
      hostId,
      status: 'LOBBY',
      mode: 'classic',
      maxPlayers: 8,
      players: new Map([[hostId, hostPlayer]]),
      currentRound: 0,
      totalRounds: 5,
      usedChallengeIds: [],
      roundResults: [],
      roundSubmissions: new Map()
    };

    this.rooms.set(roomCode, room);
    this.playerRoomMap.set(hostId, roomCode);

    return { room: this.toPublicState(room) };
  }

  joinRoom(roomCode: string, playerId: string, playerName: string, avatar: string = '🎤'): { room?: RoomState; error?: string } {
    const cleanCode = roomCode.trim();
    const room = this.rooms.get(cleanCode);

    if (!room) {
      return { error: 'Room not found. Check the 6-digit code and try again.' };
    }

    if (room.status !== 'LOBBY') {
      return { error: 'This party has already started!' };
    }

    if (room.players.size >= room.maxPlayers) {
      return { error: 'Party is full (max 8 players).' };
    }

    this.leaveRoom(playerId);

    const player: Player = {
      id: playerId,
      name: playerName.trim() || `Player ${room.players.size + 1}`,
      avatar: avatar || '🎤',
      isHost: false,
      isReady: false,
      totalScore: 0,
      connected: true,
      roundScores: []
    };

    room.players.set(playerId, player);
    this.playerRoomMap.set(playerId, cleanCode);

    return { room: this.toPublicState(room) };
  }

  leaveRoom(playerId: string): { room?: RoomState; deletedRoomCode?: string } {
    const roomCode = this.playerRoomMap.get(playerId);
    if (!roomCode) return {};

    this.playerRoomMap.delete(playerId);
    const room = this.rooms.get(roomCode);
    if (!room) return {};

    room.players.delete(playerId);

    if (room.players.size === 0) {
      this.rooms.delete(roomCode);
      return { deletedRoomCode: roomCode };
    }

    // Elect new host if host left
    if (room.hostId === playerId) {
      const remainingPlayers = Array.from(room.players.values());
      const newHost = remainingPlayers[0];
      newHost.isHost = true;
      newHost.isReady = true;
      room.hostId = newHost.id;
    }

    return { room: this.toPublicState(room) };
  }

  toggleReady(playerId: string): { room?: RoomState; error?: string } {
    const roomCode = this.playerRoomMap.get(playerId);
    if (!roomCode) return { error: 'Player not in a room.' };
    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'Room not found.' };

    const player = room.players.get(playerId);
    if (!player) return { error: 'Player not found.' };

    if (!player.isHost) {
      player.isReady = !player.isReady;
    }

    return { room: this.toPublicState(room) };
  }

  setGameMode(playerId: string, mode: GameMode): { room?: RoomState; error?: string } {
    const roomCode = this.playerRoomMap.get(playerId);
    if (!roomCode) return { error: 'Player not in a room.' };
    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'Room not found.' };

    if (room.hostId !== playerId) {
      return { error: 'Only the party host can change game mode.' };
    }

    room.mode = mode;
    if (mode === 'battle') room.totalRounds = 3;
    else if (mode === 'tournament') room.totalRounds = 6;
    else room.totalRounds = 5;

    return { room: this.toPublicState(room) };
  }

  startGame(playerId: string): { room?: RoomState; error?: string } {
    const roomCode = this.playerRoomMap.get(playerId);
    if (!roomCode) return { error: 'Player not in a room.' };
    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'Room not found.' };

    if (room.hostId !== playerId) {
      return { error: 'Only the party host can start the game.' };
    }

    // Reset scores
    room.players.forEach(p => {
      p.totalScore = 0;
      p.roundScores = [];
    });
    room.currentRound = 0;
    room.usedChallengeIds = [];
    room.winner = undefined;

    return this.startNextRound(room);
  }

  startNextRound(room: RoomInternal): { room: RoomState } {
    room.currentRound += 1;
    room.roundSubmissions.clear();
    room.roundResults = [];

    // Select challenge
    const challenge = getRandomChallenge('all', room.usedChallengeIds);
    room.usedChallengeIds.push(challenge.id);
    room.currentChallenge = challenge;

    // Apply chaos modifier if mode is chaos
    if (room.mode === 'chaos') {
      room.currentChaosModifier = getRandomChaosModifier();
    } else {
      room.currentChaosModifier = undefined;
    }

    room.status = 'ROUND_PERFORM';

    return { room: this.toPublicState(room) };
  }

  async submitPerformance(
    playerId: string, 
    audioBase64?: string, 
    duration?: number
  ): Promise<{ room?: RoomState; allSubmitted?: boolean; error?: string }> {
    const roomCode = this.playerRoomMap.get(playerId);
    if (!roomCode) return { error: 'Player not in a room.' };
    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'Room not found.' };
    if (!room.currentChallenge) return { error: 'No active challenge.' };

    const player = room.players.get(playerId);
    if (!player) return { error: 'Player not found.' };

    // Record submission
    room.roundSubmissions.set(playerId, { audioData: audioBase64, duration });

    // Evaluate score
    const score = await evaluatePerformance(
      room.currentChallenge,
      player.name,
      audioBase64,
      duration,
      room.currentChaosModifier
    );

    // Update player's session stats
    player.totalScore += score.totalScore;
    player.roundScores.push({
      round: room.currentRound,
      score: score
    });

    const result: PlayerRoundResult = {
      playerId: player.id,
      playerName: player.name,
      avatar: player.avatar,
      score: score,
      audioData: audioBase64
    };

    // Replace if already submitted in this round, else append
    const existingIndex = room.roundResults.findIndex(r => r.playerId === player.id);
    if (existingIndex >= 0) {
      room.roundResults[existingIndex] = result;
    } else {
      room.roundResults.push(result);
    }

    // Check if all connected players submitted
    const connectedPlayers = Array.from(room.players.values()).filter(p => p.connected);
    const allSubmitted = room.roundSubmissions.size >= connectedPlayers.length;

    if (allSubmitted) {
      room.status = 'ROUND_RESULT';
      // Sort round results descending by score
      room.roundResults.sort((a, b) => b.score.totalScore - a.score.totalScore);
    }

    return { 
      room: this.toPublicState(room),
      allSubmitted
    };
  }

  advanceGame(playerId: string): { room?: RoomState; error?: string } {
    const roomCode = this.playerRoomMap.get(playerId);
    if (!roomCode) return { error: 'Player not in a room.' };
    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'Room not found.' };

    if (room.hostId !== playerId) {
      return { error: 'Only the party host can advance.' };
    }

    if (room.status === 'ROUND_RESULT') {
      // Advance to leaderboard or game over
      if (room.currentRound >= room.totalRounds) {
        // Game Over! Determine winner
        room.status = 'GAME_OVER';
        const sortedPlayers = Array.from(room.players.values()).sort((a, b) => b.totalScore - a.totalScore);
        const winner = sortedPlayers[0];
        
        let winnerTitle = "MASTER MIMIC";
        if (winner.totalScore > 420) winnerTitle = "VOICE GOD";
        else if (room.mode === 'chaos') winnerTitle = "CHAOS LEGEND";
        else if (winner.totalScore > 350) winnerTitle = "VOICE CHAMELEON";
        else winnerTitle = "ALMOST ORIGINAL";

        room.winner = {
          player: winner,
          title: winnerTitle
        };
      } else {
        room.status = 'LEADERBOARD';
      }
      return { room: this.toPublicState(room) };
    }

    if (room.status === 'LEADERBOARD') {
      // Start next round
      return this.startNextRound(room);
    }

    return { room: this.toPublicState(room) };
  }

  restartGame(playerId: string): { room?: RoomState; error?: string } {
    const roomCode = this.playerRoomMap.get(playerId);
    if (!roomCode) return { error: 'Player not in a room.' };
    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'Room not found.' };

    if (room.hostId !== playerId) {
      return { error: 'Only the party host can restart.' };
    }

    room.status = 'LOBBY';
    room.currentRound = 0;
    room.winner = undefined;
    room.roundResults = [];
    room.roundSubmissions.clear();
    room.players.forEach(p => {
      p.totalScore = 0;
      p.roundScores = [];
      if (!p.isHost) p.isReady = false;
    });

    return { room: this.toPublicState(room) };
  }

  getRoomByPlayerId(playerId: string): RoomState | null {
    const roomCode = this.playerRoomMap.get(playerId);
    if (!roomCode) return null;
    const room = this.rooms.get(roomCode);
    return room ? this.toPublicState(room) : null;
  }

  getRoom(roomCode: string): RoomState | null {
    const room = this.rooms.get(roomCode);
    return room ? this.toPublicState(room) : null;
  }

  private toPublicState(room: RoomInternal): RoomState {
    return {
      roomCode: room.roomCode,
      hostId: room.hostId,
      status: room.status,
      mode: room.mode,
      currentChaosModifier: room.currentChaosModifier,
      maxPlayers: room.maxPlayers,
      players: Array.from(room.players.values()),
      currentRound: room.currentRound,
      totalRounds: room.totalRounds,
      currentChallenge: room.currentChallenge,
      roundResults: room.roundResults,
      winner: room.winner,
      countdown: room.countdown
    };
  }
}
