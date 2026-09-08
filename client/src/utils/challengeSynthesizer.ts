import { Challenge, ChaosModifier } from '../types.js';
import { getAudioContext } from './soundEffects.js';

let currentSpeechUtterance: SpeechSynthesisUtterance | null = null;
let isPlayingSample = false;

export function stopChallengeAudio() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  isPlayingSample = false;
}

export async function playChallengeSample(
  challenge: Challenge, 
  chaosModifier?: ChaosModifier,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  stopChallengeAudio();
  isPlayingSample = true;
  onStart?.();

  const ctx = getAudioContext();

  // Play introductory stinger chime
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {}

  // Determine speech rate and pitch from challenge & chaos modifier
  let pitch = 1.0;
  let rate = 1.0;

  switch (challenge.audioSynthesisType) {
    case 'deep_deadpan':
      pitch = 0.55;
      rate = 0.9;
      break;
    case 'explosive_shout':
      pitch = 1.35;
      rate = 1.15;
      break;
    case 'panicked_echo':
      pitch = 1.4;
      rate = 1.35;
      break;
    case 'goblin_raspy':
      pitch = 1.8;
      rate = 1.25;
      break;
    case 'booming_wizard':
      pitch = 0.45;
      rate = 0.8;
      break;
    case 'robot_glitch':
      pitch = 0.9;
      rate = 0.95;
      break;
    case 'gravelly_trailer':
      pitch = 0.4;
      rate = 0.75;
      break;
    case 'dramatic_orchestra':
      pitch = 0.8;
      rate = 0.85;
      break;
    case 'villain_laugh':
      pitch = 0.7;
      rate = 1.1;
      break;
    case 'hyperactive_screamer':
      pitch = 1.6;
      rate = 1.4;
      break;
    default:
      pitch = 1.0;
      rate = 1.0;
  }

  // Adjust for active Chaos Modifier
  if (chaosModifier === 'chipmunk') {
    pitch = Math.min(2.0, pitch * 1.8);
    rate = Math.min(2.0, rate * 1.3);
  } else if (chaosModifier === 'slow') {
    pitch = Math.max(0.3, pitch * 0.7);
    rate = Math.max(0.4, rate * 0.55);
  } else if (chaosModifier === 'fast') {
    rate = Math.min(2.0, rate * 1.6);
  } else if (chaosModifier === 'robot') {
    pitch = 1.0;
  } else if (chaosModifier === 'angry') {
    pitch = Math.min(1.7, pitch * 1.25);
    rate = Math.min(1.8, rate * 1.2);
  } else if (chaosModifier === 'sad') {
    pitch = Math.max(0.5, pitch * 0.8);
    rate = Math.max(0.6, rate * 0.75);
  }

  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(challenge.targetPhrase);
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = 1.0;

    // Pick suitable voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      if (challenge.audioSynthesisType === 'goblin_raspy' || chaosModifier === 'chipmunk') {
        const highVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Junior') || v.name.includes('Zira')));
        if (highVoice) utterance.voice = highVoice;
      } else if (challenge.audioSynthesisType === 'booming_wizard' || challenge.audioSynthesisType === 'gravelly_trailer') {
        const deepVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('David') || v.name.includes('Guy') || v.name.includes('Male')));
        if (deepVoice) utterance.voice = deepVoice;
      } else {
        const enVoice = voices.find(v => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      }
    }

    utterance.onend = () => {
      isPlayingSample = false;
      onEnd?.();
    };

    utterance.onerror = () => {
      isPlayingSample = false;
      onEnd?.();
    };

    currentSpeechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } else {
    // Fallback: procedural synth tones
    setTimeout(() => {
      isPlayingSample = false;
      onEnd?.();
    }, (challenge.duration || 3) * 1000);
  }
}
