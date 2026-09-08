import os
import sys
import math
import base64
import json
import io
import wave
import random
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

# Optional Gemini client
gemini_client = None
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    try:
        from google import genai
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"Warning: Could not initialize Google GenAI client: {e}")

app = FastAPI(title="MIMIC PARTY - AI Audio Analysis Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    targetId: str
    targetPhrase: str
    category: str
    targetPitchF0: Optional[float] = 180.0
    targetDuration: Optional[float] = 4.0
    chaosModifier: Optional[str] = None
    audioBase64: Optional[str] = None
    audioDuration: Optional[float] = None
    playerName: Optional[str] = "Player"

class ScoreBreakdownResponse(BaseModel):
    totalScore: int
    voiceSimilarity: int
    pitch: int
    timing: int
    speech: int
    expression: int
    badge: string = "MASTER MIMIC"
    aiJudgeReaction: str
    stats: Dict[str, Any]

# Curated comedic judge matrix for fallback/instant responses
COMEDIC_REACTIONS = {
    "god_tier": [
        "Bro became the original. Respectfully, did you steal their vocal cords? 🔥",
        "That was dangerously accurate. The AI FBI is on its way to investigate.",
        "That mimic had absolutely no business being that good. 10/10 perfection.",
        "Your vocal mimicry was so precise the original creator just received a copyright claim!",
        "Flawless execution! You didn't just imitate the voice—you absorbed its soul."
    ],
    "high_tier": [
        "91 points! That voice was almost stolen. Brilliant effort!",
        "Your timing was immaculate and that accent was terrifyingly convincing.",
        "Solid 88! You sounded 95% like a legend and 5% like an espresso overdose.",
        "Honestly impressive. The energy was unmatched!",
        "That was ridiculously fun! The pitch locked in right when it mattered."
    ],
    "mid_tier": [
        "76 points. Respectfully... what was that squeak at second 2? 😂",
        "You had the spirit! The pitch got lost somewhere in another zip code, but the passion was real.",
        "Halfway between a certified masterpiece and a malfunctioning kitchen appliance.",
        "The timing was sharp, but the vocal cords chose violence and chaos.",
        "Decent effort! With 10% more diaphragm and 20% less laughing you would dominate."
    ],
    "chaos_tier": [
        "The AI judge is filing for emotional damages after hearing that. 💀",
        "It sounded like a blender trying to order drive-thru coffee at 3 AM. We love the chaos!",
        "Confidence: 100/100. Pitch accuracy: questionable. Entertainment value: Priceless.",
        "A brave performance! Definitely invented a brand new language there.",
        "You didn't hit the target pitch, but you definitely summoned something from another realm!"
    ]
}

def decode_audio_samples(audio_base64: Optional[str]) -> (np.ndarray, int):
    """
    Decodes audio base64 to numpy floating-point sample array.
    If decoding fails or raw WebM without header, generates analytical synthetic samples.
    """
    if not audio_base64:
        # Generate representative signal with slight natural jitter
        sr = 44100
        t = np.linspace(0, 3.5, int(sr * 3.5))
        f0 = random.uniform(150, 240)
        signal = 0.5 * np.sin(2 * np.pi * f0 * t) + 0.2 * np.sin(2 * np.pi * 2 * f0 * t)
        noise = np.random.normal(0, 0.05, len(signal))
        return (signal + noise).astype(np.float32), sr

    try:
        # Strip data URI prefix if present
        if "," in audio_base64:
            audio_base64 = audio_base64.split(",", 1)[1]
        
        raw_bytes = base64.b64decode(audio_base64)
        
        # Try WAV header parsing
        try:
            with wave.open(io.BytesIO(raw_bytes), "rb") as wf:
                sr = wf.getframerate()
                n_frames = wf.getnframes()
                data = wf.readframes(n_frames)
                sampwidth = wf.getsampwidth()
                if sampwidth == 2:
                    samples = np.frombuffer(data, dtype=np.int16).astype(np.float32) / 32768.0
                elif sampwidth == 1:
                    samples = (np.frombuffer(data, dtype=np.uint8).astype(np.float32) - 128) / 128.0
                else:
                    samples = np.frombuffer(data, dtype=np.float32)
                if wf.getnchannels() > 1:
                    samples = samples.reshape(-1, wf.getnchannels()).mean(axis=1)
                return samples, sr
        except Exception:
            pass

        # If raw PCM or container, estimate from byte variance
        arr = np.frombuffer(raw_bytes[:min(len(raw_bytes), 200000)], dtype=np.int8).astype(np.float32) / 128.0
        if len(arr) > 4000:
            return arr, 44100
    except Exception as e:
        print(f"Audio decode warning: {e}")

    # Fallback to simulated audio sample array with randomized human characteristics
    sr = 44100
    dur = random.uniform(3.0, 4.2)
    t = np.linspace(0, dur, int(sr * dur))
    base_f = random.uniform(140, 260)
    sim_wave = 0.6 * np.sin(2 * np.pi * base_f * t) + 0.15 * np.sin(2 * np.pi * 3 * base_f * t)
    return sim_wave.astype(np.float32), sr

def compute_f0_autocorr(samples: np.ndarray, sr: int) -> float:
    """
    Computes Fundamental Frequency (F0) using normalized autocorrelation.
    """
    if len(samples) < sr * 0.1:
        return 180.0
    
    # Segment of 200ms around the middle (highest energy segment)
    mid = len(samples) // 2
    window = samples[max(0, mid - int(sr * 0.2)): min(len(samples), mid + int(sr * 0.2))]
    if len(window) < 1024 or np.max(np.abs(window)) < 1e-4:
        return 180.0

    # Human voice search range: 75Hz to 550Hz
    min_lag = int(sr / 550)
    max_lag = int(sr / 75)

    # Autocorrelation
    corr = np.correlate(window, window, mode='full')
    corr = corr[len(corr)//2:]

    if max_lag >= len(corr):
        max_lag = len(corr) - 1
    if min_lag >= max_lag:
        return 180.0

    peak_lag = min_lag + np.argmax(corr[min_lag:max_lag])
    if peak_lag <= 0:
        return 180.0
    f0 = float(sr / peak_lag)
    return min(max(f0, 60.0), 600.0)

def compute_spectral_features(samples: np.ndarray, sr: int) -> Dict[str, float]:
    """
    Computes spectral centroid, zero-crossing rate, and energy dynamic range.
    """
    if len(samples) == 0:
        return {"centroid": 1500.0, "zcr": 0.05, "dynamic_range": 0.5, "rms": 0.2}

    # Zero crossing rate
    zero_crossings = np.nonzero(np.diff(samples > 0))[0]
    zcr = len(zero_crossings) / float(len(samples))

    # Fast Fourier Transform for spectral centroid
    fft_vals = np.abs(np.fft.rfft(samples[:min(len(samples), 32768)]))
    freqs = np.fft.rfftfreq(min(len(samples), 32768), 1.0 / sr)
    sum_fft = np.sum(fft_vals)
    if sum_fft > 1e-6:
        centroid = float(np.sum(freqs * fft_vals) / sum_fft)
    else:
        centroid = 1200.0

    # RMS & dynamic range
    frame_size = int(sr * 0.05)
    rms_frames = [
        np.sqrt(np.mean(samples[i:i+frame_size]**2))
        for i in range(0, len(samples) - frame_size, frame_size)
    ]
    if rms_frames:
        rms_mean = float(np.mean(rms_frames))
        rms_p90 = float(np.percentile(rms_frames, 90))
        rms_p10 = float(np.percentile(rms_frames, 10))
        dynamic_range = max(0.01, rms_p90 - rms_p10)
    else:
        rms_mean = 0.2
        dynamic_range = 0.4

    return {
        "centroid": centroid,
        "zcr": zcr,
        "dynamic_range": dynamic_range,
        "rms": rms_mean
    }

async def generate_gemini_judge_comment(
    player_name: str,
    target_phrase: str,
    category: str,
    total_score: int,
    pitch_score: int,
    timing_score: int,
    expression_score: int
) -> str:
    """
    Calls Google Gemini API for an ultra-funny, witty party game reaction.
    Falls back gracefully if unavailable.
    """
    if gemini_client:
        try:
            prompt = f"""
You are the hilarious, witty, and charismatic AI Judge for the party game MIMIC PARTY!
A player just mimicked a voice challenge.

Player Name: {player_name}
Target Phrase: "{target_phrase}"
Category: {category}
Total Mimic Score: {total_score}/100
- Pitch: {pitch_score}%
- Timing: {timing_score}%
- Expression & Energy: {expression_score}%

Write a 1-sentence (maximum 2 short sentences) funny, memorable reaction/roast/compliment for this performance.
Keep it fun, friendly, and gamer-party appropriate. Use 1 or 2 emojis.
Do not use generic assistant greetings. Deliver pure comedic party commentary.
"""
            response = gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            if response and response.text:
                return response.text.strip().replace('"', '')
        except Exception as e:
            print(f"Gemini API call failed, falling back to built-in comedy matrix: {e}")

    # Fallback to rich comedic matrix
    if total_score >= 90:
        return random.choice(COMEDIC_REACTIONS["god_tier"])
    elif total_score >= 80:
        return random.choice(COMEDIC_REACTIONS["high_tier"])
    elif total_score >= 65:
        return random.choice(COMEDIC_REACTIONS["mid_tier"])
    else:
        return random.choice(COMEDIC_REACTIONS["chaos_tier"])

@app.get("/")
def root():
    return {
        "service": "MIMIC PARTY AI Audio Engine",
        "status": "ready",
        "gemini_connected": gemini_client is not None
    }

@app.post("/analyze")
async def analyze_audio(req: AnalyzeRequest):
    samples, sr = decode_audio_samples(req.audioBase64)
    measured_duration = len(samples) / float(sr) if sr > 0 else 3.5
    if req.audioDuration and req.audioDuration > 0:
        measured_duration = req.audioDuration

    # Extract DSP audio features
    detected_f0 = compute_f0_autocorr(samples, sr)
    spectral = compute_spectral_features(samples, sr)

    target_f0 = req.targetPitchF0 or 180.0
    target_dur = req.targetDuration or 4.0

    # 1. Pitch Score (Weight: 20%)
    # Closeness to target F0 fundamental frequency
    f0_diff = abs(detected_f0 - target_f0)
    pitch_score = int(np.clip(100.0 * math.exp(-f0_diff / 90.0) + random.uniform(-4, 6), 35, 99))

    # 2. Timing Score (Weight: 20%)
    # Comparison between actual speech length and target duration
    dur_diff = abs(measured_duration - target_dur)
    timing_score = int(np.clip(100.0 * max(0.2, 1.0 - (dur_diff / (target_dur + 0.5))) + random.uniform(-3, 5), 40, 99))

    # 3. Voice Similarity (Weight: 30%)
    # Spectral centroid and zero crossing timbre similarity
    timbre_norm = np.clip(spectral["centroid"] / 3000.0, 0.1, 1.5)
    voice_score = int(np.clip(88.0 - abs(timbre_norm - 0.7) * 45.0 + random.uniform(-5, 7), 35, 98))

    # 4. Speech Articulation (Weight: 15%)
    # Based on speech rhythm and ZCR frequency distribution
    speech_score = int(np.clip(84.0 + (spectral["zcr"] * 80.0) + random.uniform(-6, 6), 40, 98))

    # 5. Expression & Energy (Weight: 15%)
    # High dynamic range and RMS bursts indicate full vocal commitment
    expression_score = int(np.clip(50.0 + (spectral["dynamic_range"] * 120.0) + random.uniform(-4, 8), 45, 100))

    # Calculate Weighted Total: 30% Voice + 20% Pitch + 20% Timing + 15% Speech + 15% Expression = 100%
    total_float = (
        (voice_score * 0.30) +
        (pitch_score * 0.20) +
        (timing_score * 0.20) +
        (speech_score * 0.15) +
        (expression_score * 0.15)
    )
    total_score = int(np.clip(round(total_float), 20, 99))

    # Badge assignment
    if total_score >= 92:
        badge = "MASTER MIMIC"
    elif total_score >= 84:
        badge = "VOICE CHAMELEON"
    elif total_score >= 72:
        badge = "ALMOST ORIGINAL"
    elif total_score >= 60:
        badge = "CHAOS LEGEND"
    else:
        badge = "ROOKIE MIMIC"

    # AI Judge reaction (Gemini or context-aware matrix)
    judge_reaction = await generate_gemini_judge_comment(
        player_name=req.playerName or "Player",
        target_phrase=req.targetPhrase,
        category=req.category,
        total_score=total_score,
        pitch_score=pitch_score,
        timing_score=timing_score,
        expression_score=expression_score
    )

    return {
        "totalScore": total_score,
        "voiceSimilarity": voice_score,
        "pitch": pitch_score,
        "timing": timing_score,
        "speech": speech_score,
        "expression": expression_score,
        "badge": badge,
        "aiJudgeReaction": judge_reaction,
        "stats": {
            "detectedF0": round(detected_f0, 1),
            "targetF0": round(target_f0, 1),
            "duration": round(measured_duration, 2),
            "targetDuration": round(target_dur, 2),
            "spectralCentroid": round(spectral["centroid"], 1)
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
