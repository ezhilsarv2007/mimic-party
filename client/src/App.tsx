import React, { useState, useEffect, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { RoomState, GameMode, SessionStats } from './types.js';
import { Navbar } from './components/Navbar.js';
import { StatsDrawer } from './components/StatsDrawer.js';
import { CreateRoomModal } from './components/CreateRoomModal.js';
import { JoinRoomModal } from './components/JoinRoomModal.js';
import { HowToPlayModal } from './components/HowToPlayModal.js';
import { MicPermissionModal } from './components/MicPermissionModal.js';

import { LandingView } from './views/LandingView.js';
import { LobbyView } from './views/LobbyView.js';
import { GameRoundView } from './views/GameRoundView.js';
import { ResultView } from './views/ResultView.js';
import { LeaderboardView } from './views/LeaderboardView.js';
import { PodiumView } from './views/PodiumView.js';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketId, setSocketId] = useState<string>('');
  const [room, setRoom] = useState<RoomState | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showMicModal, setShowMicModal] = useState(false);
  const [joinCodeParam, setJoinCodeParam] = useState('');

  // Socket initialization
  useEffect(() => {
    const s = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    s.on('connect', () => {
      console.log('[Socket] Connected! ID:', s.id);
      setSocketId(s.id || '');
    });

    s.on('room:update', (updatedRoom: RoomState) => {
      console.log('[Socket] Room updated:', updatedRoom.status, updatedRoom);
      setRoom(updatedRoom);
    });

    s.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
    });

    setSocket(s);

    // Read ?room= param from URL if present
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');
    if (roomFromUrl) {
      setJoinCodeParam(roomFromUrl);
      setShowJoinModal(true);
    }

    return () => {
      s.disconnect();
    };
  }, []);

  // Compute temporary session stats
  const sessionStats = useMemo<SessionStats>(() => {
    if (!room || !socketId) {
      return {
        bestScore: 0,
        averageScore: 0,
        roundsPlayed: 0,
        strongestSkill: 'Voice',
        weakestSkill: 'Timing',
        bestCategory: 'Meme Voices'
      };
    }

    const currentPlayer = room.players.find(p => p.id === socketId);
    if (!currentPlayer || currentPlayer.roundScores.length === 0) {
      return {
        bestScore: 0,
        averageScore: 0,
        roundsPlayed: 0,
        strongestSkill: 'Voice',
        weakestSkill: 'Timing',
        bestCategory: 'Meme Voices'
      };
    }

    const scores = currentPlayer.roundScores.map(r => r.score);
    const bestScore = Math.max(...scores.map(s => s.totalScore));
    const avgScore = Math.round(scores.reduce((acc, s) => acc + s.totalScore, 0) / scores.length);

    // Skill totals
    const voiceAvg = scores.reduce((a, s) => a + s.voiceSimilarity, 0) / scores.length;
    const pitchAvg = scores.reduce((a, s) => a + s.pitch, 0) / scores.length;
    const timingAvg = scores.reduce((a, s) => a + s.timing, 0) / scores.length;
    const speechAvg = scores.reduce((a, s) => a + s.speech, 0) / scores.length;
    const exprAvg = scores.reduce((a, s) => a + s.expression, 0) / scores.length;

    const skills = [
      { name: 'Voice Similarity', score: voiceAvg },
      { name: 'Pitch', score: pitchAvg },
      { name: 'Timing', score: timingAvg },
      { name: 'Speech', score: speechAvg },
      { name: 'Expression', score: exprAvg }
    ];

    skills.sort((a, b) => b.score - a.score);
    const strongestSkill = skills[0].name;
    const weakestSkill = skills[skills.length - 1].name;

    return {
      bestScore,
      averageScore: avgScore,
      roundsPlayed: scores.length,
      strongestSkill,
      weakestSkill,
      bestCategory: room.currentChallenge?.category || 'Meme Voices'
    };
  }, [room, socketId]);

  // Actions
  const handleCreateParty = (playerName: string, avatar: string) => {
    if (!socket) return;
    setIsConnecting(true);
    setErrorMessage(null);

    socket.emit('room:create', { playerName, avatar }, (res: any) => {
      setIsConnecting(false);
      if (res?.success) {
        setRoom(res.room);
        setShowCreateModal(false);
      } else {
        setErrorMessage(res?.error || 'Failed to create party');
      }
    });
  };

  const handleJoinParty = (roomCode: string, playerName: string, avatar: string) => {
    if (!socket) return;
    setIsConnecting(true);
    setErrorMessage(null);

    socket.emit('room:join', { roomCode, playerName, avatar }, (res: any) => {
      setIsConnecting(false);
      if (res?.success) {
        setRoom(res.room);
        setShowJoinModal(false);
      } else {
        setErrorMessage(res?.error || 'Failed to join party');
      }
    });
  };

  const handleToggleReady = () => {
    if (!socket) return;
    socket.emit('room:ready', (res: any) => {
      if (res?.room) setRoom(res.room);
    });
  };

  const handleSetMode = (mode: GameMode) => {
    if (!socket) return;
    socket.emit('room:mode', { mode }, (res: any) => {
      if (res?.room) setRoom(res.room);
    });
  };

  const handleStartGame = () => {
    if (!socket) return;
    socket.emit('game:start', (res: any) => {
      if (res?.room) setRoom(res.room);
    });
  };

  const handleSubmitPerformance = (audioBase64?: string, duration?: number) => {
    if (!socket) return;
    socket.emit('performance:submit', { audioData: audioBase64, duration }, (res: any) => {
      if (res?.room) setRoom(res.room);
    });
  };

  const handleAdvanceGame = () => {
    if (!socket) return;
    socket.emit('game:advance', (res: any) => {
      if (res?.room) setRoom(res.room);
    });
  };

  const handleRestartGame = () => {
    if (!socket) return;
    socket.emit('game:restart', (res: any) => {
      if (res?.room) setRoom(res.room);
    });
  };

  const handleLeaveRoom = () => {
    setRoom(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-pink-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        roomCode={room?.roomCode}
        onOpenStats={() => setShowStatsModal(true)}
        onOpenHelp={() => setShowHelpModal(true)}
        onLeaveRoom={room ? handleLeaveRoom : undefined}
      />

      {/* Global Error Banner if any */}
      {errorMessage && (
        <div className="w-full max-w-md mx-auto px-4 py-2 mt-2">
          <div className="bg-red-950/90 border border-red-500/50 rounded-xl px-4 py-2.5 text-xs text-red-200 font-bold flex items-center justify-between shadow-lg">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-white ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Dynamic View Router */}
      <main className="flex-1 flex flex-col justify-center">
        {!room && (
          <LandingView
            onCreateParty={() => setShowCreateModal(true)}
            onJoinParty={() => setShowJoinModal(true)}
            onHowToPlay={() => setShowHelpModal(true)}
          />
        )}

        {room && room.status === 'LOBBY' && (
          <LobbyView
            room={room}
            currentSocketId={socketId}
            onReady={handleToggleReady}
            onSetMode={handleSetMode}
            onStartGame={handleStartGame}
            onLeaveRoom={handleLeaveRoom}
          />
        )}

        {room && (room.status === 'ROUND_PERFORM' || room.status === 'ROUND_INTRO') && room.currentChallenge && (
          <GameRoundView
            roundNumber={room.currentRound}
            totalRounds={room.totalRounds}
            challenge={room.currentChallenge}
            chaosModifier={room.currentChaosModifier}
            onSubmitPerformance={handleSubmitPerformance}
            onMicError={() => setShowMicModal(true)}
          />
        )}

        {room && room.status === 'ROUND_RESULT' && (
          <ResultView
            room={room}
            currentSocketId={socketId}
            onAdvance={handleAdvanceGame}
          />
        )}

        {room && room.status === 'LEADERBOARD' && (
          <LeaderboardView
            room={room}
            currentSocketId={socketId}
            onNextRound={handleAdvanceGame}
          />
        )}

        {room && room.status === 'GAME_OVER' && (
          <PodiumView
            room={room}
            currentSocketId={socketId}
            onRestart={handleRestartGame}
            onNewParty={() => {
              setRoom(null);
              setShowCreateModal(true);
            }}
            onHome={handleLeaveRoom}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="w-full py-4 text-center text-gray-500 text-xs select-none">
        <p>
          🎭 MIMIC PARTY &bull; Original Multiplayer Voice-Mimicking Party Game &bull; Powered by Audio DSP & AI
        </p>
      </footer>

      {/* Modals */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateParty}
        isLoading={isConnecting}
      />

      <JoinRoomModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoin={handleJoinParty}
        initialCode={joinCodeParam}
        isLoading={isConnecting}
      />

      <HowToPlayModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      <StatsDrawer
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        stats={sessionStats}
      />

      <MicPermissionModal
        isOpen={showMicModal}
        onClose={() => setShowMicModal(false)}
        onRetry={() => {
          setShowMicModal(false);
        }}
      />
    </div>
  );
};

export default App;
