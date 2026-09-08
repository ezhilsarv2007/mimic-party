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
  duration: number;
  audioSynthesisType: string;
  audioParams?: Record<string, any>;
  targetPitchF0?: number;
  targetTempoBpm?: number;
}

export interface ScoreBreakdown {
  totalScore: number;
  voiceSimilarity: number;
  pitch: number;
  timing: number;
  speech: number;
  expression: number;
  badge: string;
  aiJudgeReaction: string;
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

export interface SessionStats {
  bestScore: number;
  averageScore: number;
  roundsPlayed: number;
  strongestSkill: string;
  weakestSkill: string;
  bestCategory: string;
}
