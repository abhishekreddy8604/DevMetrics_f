// lib/wav_recorder.js
export class WavRecorder {
    constructor() {
      this.stream = null;
      this.mediaRecorder = null;
      this.audioContext = null;
    }
  
    async initialize() {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.audioContext = new AudioContext();
        this.mediaRecorder = new MediaRecorder(this.stream);
      } catch (error) {
        console.error('Failed to initialize WavRecorder:', error);
        throw error;
      }
    }
  
    async record(onDataAvailable) {
      if (!this.mediaRecorder) {
        throw new Error('WavRecorder not initialized');
      }
  
      this.mediaRecorder.ondataavailable = async (event) => {
        const audioData = await event.data.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(audioData);
        const monoData = new Float32Array(audioBuffer.length);
        
        // Convert to mono
        const inputData = audioBuffer.getChannelData(0);
        for (let i = 0; i < audioBuffer.length; i++) {
          monoData[i] = inputData[i];
        }
        
        onDataAvailable({ mono: monoData });
      };
  
      this.mediaRecorder.start(100);
    }
  
    pause() {
      if (this.mediaRecorder?.state === 'recording') {
        this.mediaRecorder.stop();
      }
    }
  
    cleanup() {
      this.pause();
      this.stream?.getTracks().forEach(track => track.stop());
      this.audioContext?.close();
      this.stream = null;
      this.mediaRecorder = null;
      this.audioContext = null;
    }
  }