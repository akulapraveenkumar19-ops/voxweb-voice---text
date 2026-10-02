// Web Speech API Wrapper for STT and TTS with Multi-Language & Telugu (te-IN) Support

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition || null
    : null;

export const isSpeechRecognitionSupported = () => !!SpeechRecognition;
export const isSpeechSynthesisSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

export class VoiceManager {
  constructor() {
    this.recognition = null;
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isListening = false;
    this.selectedVoice = null;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 1.0;
    this.lang = 'en-US'; // 'en-US' or 'te-IN' (Telugu)
  }

  setLanguage(lang) {
    this.lang = lang || 'en-US';
    if (this.recognition) {
      try {
        this.recognition.lang = this.lang;
      } catch (e) {}
    }
    // Auto-select language voice for TTS
    if (this.synthesis) {
      const voices = this.getAvailableVoices();
      if (this.lang.startsWith('te')) {
        const teluguVoice = voices.find((v) => v.lang.startsWith('te') || v.name.toLowerCase().includes('telugu'));
        if (teluguVoice) this.selectedVoice = teluguVoice;
      } else {
        const engVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Premium'))
        );
        if (engVoice) this.selectedVoice = engVoice;
      }
    }
  }

  async startListening({ onResult, onInterim, onStart, onEnd, onError }) {
    const RecognitionClass =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!RecognitionClass) {
      onError?.(
        new Error(
          'Speech recognition is not supported in this browser. Please open VoxWeb in Google Chrome or Microsoft Edge.'
        )
      );
      return;
    }

    // Stop any existing session
    this.stopListening();

    // Check & request browser microphone permission
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release stream immediately; SpeechRecognition manages its own stream
        stream.getTracks().forEach((track) => track.stop());
      } catch (permErr) {
        if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
          onError?.(
            new Error(
              'Microphone permission denied. Please click the lock or mic icon in your browser URL bar and set Microphone to "Allow".'
            )
          );
          return;
        }
      }
    }

    try {
      const rec = new RecognitionClass();
      this.recognition = rec;
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = this.lang || 'en-US';

      rec.onstart = () => {
        this.isListening = true;
        onStart?.();
      };

      rec.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (interimTranscript) {
          onInterim?.(interimTranscript);
        }
        if (finalTranscript) {
          onResult?.(finalTranscript.trim());
        }
      };

      rec.onerror = (event) => {
        this.isListening = false;
        let msg = 'Microphone error occurred.';
        if (event.error === 'not-allowed') {
          msg = 'Microphone access denied. Please allow microphone permissions in browser settings.';
        } else if (event.error === 'no-speech') {
          msg = this.lang.startsWith('te')
            ? 'ఏమి వినపడలేదు. దయచేసి మళ్లీ మాట్లాడండి. (No speech detected. Please speak again.)'
            : 'No speech detected. Please speak clearly into your microphone.';
        } else if (event.error === 'network') {
          msg = 'Speech recognition network error. Please check your internet connection.';
        }
        onError?.(new Error(msg));
      };

      rec.onend = () => {
        this.isListening = false;
        onEnd?.();
      };

      rec.start();
    } catch (err) {
      this.isListening = false;
      onError?.(err);
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {}
      this.recognition = null;
    }
    this.isListening = false;
  }

  speak(text, { onStart, onEnd, onError, voice, rate, pitch } = {}) {
    if (!this.synthesis) {
      onError?.(new Error('Speech synthesis is not supported.'));
      return;
    }

    this.stopSpeaking();

    // Clean text of markdown asterisks or links for smooth speech
    const cleanText = text
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[*_#`]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate ?? this.rate;
    utterance.pitch = pitch ?? this.pitch;
    utterance.volume = this.volume;
    utterance.lang = this.lang || 'en-US';

    if (voice) {
      utterance.voice = voice;
    } else if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = (e) => onError?.(e);

    if (this.synthesis.paused) {
      this.synthesis.resume();
    }

    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  getAvailableVoices() {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }
}

export const voiceManager = new VoiceManager();
