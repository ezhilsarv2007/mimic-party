import { Challenge, ChaosModifier } from '../types.js';

export const CHALLENGES: Challenge[] = [
  // --- MEME VOICES ---
  {
    id: 'meme-bro-him',
    title: 'Bro Thinks He Is Him',
    category: 'meme',
    difficulty: 'medium',
    targetPhrase: "Bro thinks he's the main character... respectfully, sit down!",
    description: 'Deep deadpan TikTok narrator voice with an arrogant snicker at the end.',
    duration: 4,
    audioSynthesisType: 'deep_deadpan',
    targetPitchF0: 110,
    audioParams: { filter: 'lowpass', formant: 'deep', vibrato: 0.1 }
  },
  {
    id: 'meme-emotional-damage',
    title: 'Emotional Damage',
    category: 'meme',
    difficulty: 'easy',
    targetPhrase: "EMOTIONAL DAMAGE?! What da hail, you failed math again?!",
    description: 'Over-the-top accented scolding voice with explosive volume spike on the first two words.',
    duration: 4,
    audioSynthesisType: 'explosive_shout',
    targetPitchF0: 240,
    audioParams: { distortion: 0.3, pitchShift: 4 }
  },
  {
    id: 'meme-why-running',
    title: 'Why Are You Running?!',
    category: 'meme',
    difficulty: 'easy',
    targetPhrase: "Why are you running?! WHY are you running?!",
    description: 'Fast, panicked, escalating breathless interrogation.',
    duration: 3.5,
    audioSynthesisType: 'panicked_echo',
    targetPitchF0: 210,
    audioParams: { echo: 0.25, tempo: 130 }
  },
  {
    id: 'meme-npc-dialogue',
    title: 'Oblivion NPC Glitch',
    category: 'meme',
    difficulty: 'hard',
    targetPhrase: "Have you heard of the high elves? Stop talking! Farewell!",
    description: 'Instant switch between polite greeting, sudden furious shouting, and robotic polite departure.',
    duration: 5,
    audioSynthesisType: 'mood_swing',
    targetPitchF0: 175,
    audioParams: { moodSwitch: true }
  },

  // --- CHARACTER VOICES ---
  {
    id: 'char-goblin-merchant',
    title: 'Greedy Goblin Merchant',
    category: 'character',
    difficulty: 'medium',
    targetPhrase: "Hehehe! Shinies for you, gold for me! No refunds, fleshy human!",
    description: 'High-pitched scratchy goblin cackle with greedy squeaks.',
    duration: 4.5,
    audioSynthesisType: 'goblin_raspy',
    targetPitchF0: 360,
    audioParams: { rasp: 0.8, pitchJumps: [320, 420, 290] }
  },
  {
    id: 'char-ancient-wizard',
    title: 'Ancient Wizard incantation',
    category: 'character',
    difficulty: 'hard',
    targetPhrase: "By the mystic orbs of Zorath... BEHOLD THE ULTIMATE SHADOW!",
    description: 'Deep resonant booming wizard with crackling mystical vibrations.',
    duration: 5,
    audioSynthesisType: 'booming_wizard',
    targetPitchF0: 95,
    audioParams: { reverb: 0.7, bassBoost: 6 }
  },
  {
    id: 'char-sci-fi-robot',
    title: 'Malfunctioning Android',
    category: 'character',
    difficulty: 'medium',
    targetPhrase: "BEEP BOOP. Human error detected. Rebooting humor protocol... Ha. Ha.",
    description: 'Monotone robotic cadence interrupted by static glitch stuttering.',
    duration: 4.5,
    audioSynthesisType: 'robot_glitch',
    targetPitchF0: 150,
    audioParams: { robotModulation: true, bitcrush: 4 }
  },
  {
    id: 'char-action-trailer',
    title: 'Action Movie Trailer Voice',
    category: 'character',
    difficulty: 'easy',
    targetPhrase: "In a world where mimicry is law... only one voice can survive.",
    description: 'Gravelly ultra-low Hollywood blockbuster narrator.',
    duration: 4.5,
    audioSynthesisType: 'gravelly_trailer',
    targetPitchF0: 85,
    audioParams: { subBass: true, slowTremolo: 0.2 }
  },

  // --- FUNNY SOUNDS & CARTOON ---
  {
    id: 'sound-dramatic-chipmunk',
    title: 'Dramatic Chipmunk Stinger',
    category: 'sounds',
    difficulty: 'hard',
    targetPhrase: "*GASPS* DUN DUN DUUUUUNNNN!!",
    description: 'Sharp theatrical inhale gasp followed by 3 heavy orchestral impact vocalizations.',
    duration: 3.5,
    audioSynthesisType: 'dramatic_orchestra',
    targetPitchF0: 180,
    audioParams: { chords: ['C3', 'F#3', 'C4'] }
  },
  {
    id: 'sound-dialup-modem',
    title: '1998 Dial-Up Modem',
    category: 'sounds',
    difficulty: 'extreme',
    targetPhrase: "BEEEEEEP... KSHSHSHSHSHSH... EEE-AWWW-EEE-AWWW-DING!",
    description: 'High pitched test tone into gritty white noise static and dual-tone handshakes.',
    duration: 5,
    audioSynthesisType: 'modem_tones',
    targetPitchF0: 1200,
    audioParams: { noiseMix: 0.6, dualTones: true }
  },
  {
    id: 'cartoon-slipping-banana',
    title: 'Slipping on a Banana Peel',
    category: 'cartoon',
    difficulty: 'medium',
    targetPhrase: "WHOOOOP-WHOOP-WHOOP-BOI-I-I-NG! OOF!",
    description: 'Rising whistle slide whistle, rapid rubber bounce, and comedic thud.',
    duration: 4,
    audioSynthesisType: 'slide_whistle_bounce',
    targetPitchF0: 450,
    audioParams: { slideWhistle: true, springTwang: true }
  },
  {
    id: 'cartoon-evil-villain',
    title: 'B-Movie Villain Monologue',
    category: 'cartoon',
    difficulty: 'easy',
    targetPhrase: "You are too late, hero! MWAHAHAHA! MWA-HA-HA-HA-HA-HA!",
    description: 'Pompous declaration ending in an escalating diabolical operatic laugh.',
    duration: 4.5,
    audioSynthesisType: 'villain_laugh',
    targetPitchF0: 220,
    audioParams: { staccatoLaugh: true }
  },

  // --- GAMING ---
  {
    id: 'gaming-stealth-alarm',
    title: 'Tactical Stealth Alert',
    category: 'gaming',
    difficulty: 'easy',
    targetPhrase: "ALERT! [HIGH PITCH SQUEAL] Whose footprints are these?!",
    description: 'Sudden piercing alert chime vocalization followed by tense whisper.',
    duration: 3.5,
    audioSynthesisType: 'alert_stinger',
    targetPitchF0: 520,
    audioParams: { highAlert: true }
  },
  {
    id: 'gaming-speedrunner-rage',
    title: 'Speedrunner Misses The Jump',
    category: 'gaming',
    difficulty: 'hard',
    targetPhrase: "NOOO! The sub-pixel jump! My run is dead! PAUSE PAUSE PAUSE!",
    description: 'Frantic hyperactive keyboard clacking vocalization with heartbroken screams.',
    duration: 4,
    audioSynthesisType: 'hyperactive_screamer',
    targetPitchF0: 310,
    audioParams: { panicTempo: 180 }
  }
];

export const CHAOS_MODIFIERS: Record<ChaosModifier, { name: string; icon: string; description: string; pitchMultiplier: number; speedMultiplier: number }> = {
  robot: {
    name: 'Robot Mode',
    icon: '🎙️',
    description: 'Speak in a completely stiff, pitch-locked mechanical drone!',
    pitchMultiplier: 1.0,
    speedMultiplier: 1.0
  },
  angry: {
    name: 'Angry Mode',
    icon: '😡',
    description: 'Deliver the phrase with maximum unhinged fury and venom!',
    pitchMultiplier: 1.2,
    speedMultiplier: 1.3
  },
  sad: {
    name: 'Sad Mode',
    icon: '😭',
    description: 'Deliver this with breaking tears and pure heartbreak!',
    pitchMultiplier: 0.85,
    speedMultiplier: 0.75
  },
  ai: {
    name: 'AI Assistant Mode',
    icon: '🤖',
    description: 'Ultra-polite, unsettlingly smooth synthetic corporate assistant voice.',
    pitchMultiplier: 1.05,
    speedMultiplier: 1.0
  },
  chipmunk: {
    name: 'High Pitch Chipmunk',
    icon: '🐿️',
    description: 'Inhale helium! Push your vocal cords into the stratosphere!',
    pitchMultiplier: 2.2,
    speedMultiplier: 1.4
  },
  slow: {
    name: 'Slow Motion',
    icon: '🐌',
    description: 'Everything... slowed... down... to... 50%... speed...',
    pitchMultiplier: 0.6,
    speedMultiplier: 0.5
  },
  fast: {
    name: 'Auctioneer Fast',
    icon: '⚡',
    description: 'Rapid-fire lightning speed! No breathing allowed!',
    pitchMultiplier: 1.15,
    speedMultiplier: 1.8
  },
  dramatic: {
    name: 'Shakespeare Dramatic',
    icon: '🎭',
    description: 'Dramatic theatrical pauses, grand vibrato, and royal weight!',
    pitchMultiplier: 0.95,
    speedMultiplier: 0.8
  }
};

export function getRandomChallenge(category?: string, excludeIds: string[] = []): Challenge {
  let pool = CHALLENGES.filter(c => !excludeIds.includes(c.id));
  if (category && category !== 'all') {
    const catPool = pool.filter(c => c.category === category);
    if (catPool.length > 0) pool = catPool;
  }
  if (pool.length === 0) pool = CHALLENGES;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

export function getRandomChaosModifier(): ChaosModifier {
  const keys = Object.keys(CHAOS_MODIFIERS) as ChaosModifier[];
  return keys[Math.floor(Math.random() * keys.length)];
}
