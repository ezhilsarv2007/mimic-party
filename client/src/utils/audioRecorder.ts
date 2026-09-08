// Browser Microphone & MediaRecorder Manager

export interface AudioRecordingResult {
  audioBase64: string;
  duration: number;
  blob: Blob;
  mimeType: string;
}

export class AudioRecorder {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private analyserNode: AnalyserNode | null = null;
  private audioCtx: AudioContext | null = null;

  async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      // Release test tracks immediately
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      console.warn('Microphone permission request failed:', err);
      return false;
    }
  }

  async startRecording(): Promise<AnalyserNode> {
    this.audioChunks = [];
    
    // Acquire media stream
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: false, // keep vocal nuances
        autoGainControl: true
      } 
    });

    // Create audio context for visualizer
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioContextClass();
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    const source = this.audioCtx.createMediaStreamSource(this.mediaStream);
    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.8;
    source.connect(this.analyserNode);

    // Pick supported mime type
    let mimeType = 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = ''; // Let browser choose default
        }
      }
    }

    this.mediaRecorder = mimeType 
      ? new MediaRecorder(this.mediaStream, { mimeType }) 
      : new MediaRecorder(this.mediaStream);

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.audioChunks.push(e.data);
      }
    };

    this.startTime = Date.now();
    this.mediaRecorder.start(100); // 100ms slices

    return this.analyserNode;
  }

  stopRecording(): Promise<AudioRecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('MediaRecorder is not initialized'));
      }

      this.mediaRecorder.onstop = async () => {
        const duration = Math.max(0.5, (Date.now() - this.startTime) / 1000);
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });

        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          this.cleanup();
          resolve({
            audioBase64: base64,
            duration,
            blob,
            mimeType
          });
        };
        reader.onerror = () => {
          this.cleanup();
          reject(new Error('Failed to encode audio file'));
        };
        reader.readAsDataURL(blob);
      };

      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
    });
  }

  cancelRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }

  private cleanup() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.analyserNode = null;
    this.mediaRecorder = null;
  }
}
