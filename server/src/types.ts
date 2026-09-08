export type GameMode = 'classic' | 'battle' | 'tournament' | 'chaos';

export type ChaosModifier = 
  | 'robot' 
  | 'angry' 
  | 'sad' 
  | 'ai' 
  | 'chipmunk' 
  | 'slow' 
  | 'fast' 
  | 'dramatic';

export type ChallengeCategory = 
  | 'meme' 
  | 'sounds' 
  | 'character' 
  | 'gaming' 
  | 'cartoon' 
  | 'chaos';

export interface Challenge {
  id: string;
  title: string;
  category: ChallengeCategory;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  targetPhrase: string;
  description: string;
  duration: number; // in seconds
  audioSynthesisType: string;
  audioParams?: Record<string, any>;
  targetPitchF0?: number; // target fundamental frequency in Hz
  targetTempoBpm?: number;
}

export interface ScoreBreakdown {
  totalScore: number;      // 0 - 100
  voiceSimilarity: number; // 0 - 100 (weight: 30%)
  pitch: number;           // 0 - 100 (weight: 20%)
  timing: number;          // 0 - 100 (weight: 20%)
  speech: number;          // 0 - 100 (weight: 15%)
  expression: number;      // 0 - 100 (weight: 15%)
  badge: string;           // e.g. "MASTER MIMIC", "VOICE CHAMELEON"
  aiJudgeReaction: string; // Funny AI comment
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  totalScore: number;
  connected: boolean;
  roundScores: Array<{
    round: number;
    score: ScoreBreakdown;
  }>;
}

export interface PlayerPerformance {
  playerId: string;
  playerName: string;
  audioData?: string; // base64 / audio data
  audioMimeType?: string;
  duration?: number;
  submittedAt: number;
}

export interface PlayerRoundResult {
  playerId: string;
  playerName: string;
  avatar: string;
  score: ScoreBreakdown;
  audioData?: string;
}

export type RoomStatus = 
  | 'LOBBY' 
  | 'STARTING' 
  | 'ROUND_INTRO' 
  | 'ROUND_PERFORM' 
  | 'ROUND_EVALUATING' 
  | 'ROUND_RESULT' 
  | 'LEADERBOARD' 
  | 'GAME_OVER';

export interface RoomState {
  roomCode: string;
  hostId: string;
  status: RoomStatus;
  mode: GameMode;
  currentChaosModifier?: ChaosModifier;
  maxPlayers: number;
  players: Player[];
  currentRound: number;
  totalRounds: number;
  currentChallenge?: Challenge;
  roundResults?: PlayerRoundResult[];
  winner?: {
    player: Player;
    title: string;
  };
  countdown?: number;
}
