import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { voiceManager, isSpeechRecognitionSupported, isSpeechSynthesisSupported } from '../services/voice';
import { soundManager } from '../services/soundEffects';
import api from '../services/api';

const VoiceContext = createContext(null);

export const VoiceProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [status, setStatus] = useState('ready'); // ready, listening, thinking, speaking, error
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [errorMessage, setErrorMessage] = useState(null);

  // Settings
  const [isMuted, setIsMuted] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [language, setLanguage] = useState('en-US');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');

  // Callbacks ref for command execution listener
  const onCommandExecutedRef = useRef(null);

  // Load browser voices
  useEffect(() => {
    const updateVoices = () => {
      const voices = voiceManager.getAvailableVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        // Default to high quality English voice if available
        if (!selectedVoiceURI) {
          const naturalVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Premium')) && v.lang.startsWith('en'));
          if (naturalVoice) {
            setSelectedVoiceURI(naturalVoice.voiceURI);
            voiceManager.selectedVoice = naturalVoice;
          }
        }
      }
    };

    updateVoices();
    if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoiceURI]);

  // Handle selected voice change
  useEffect(() => {
    if (selectedVoiceURI && availableVoices.length > 0) {
      const found = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
      if (found) {
        voiceManager.selectedVoice = found;
      }
    }
  }, [selectedVoiceURI, availableVoices]);

  // Handle language change
  useEffect(() => {
    voiceManager.setLanguage(language);
  }, [language]);

  const speak = useCallback((text) => {
    if (isMuted || !autoSpeak || !text) return;
    
    setIsSpeaking(true);
    setStatus('speaking');
    setStatusMessage('VoxWeb is speaking...');

    voiceManager.speak(text, {
      rate: speechRate,
      pitch: speechPitch,
      onStart: () => {
        setIsSpeaking(true);
        setStatus('speaking');
        setStatusMessage('VoxWeb is speaking...');
      },
      onEnd: () => {
        setIsSpeaking(false);
        setStatus('ready');
        setStatusMessage('Ready');
      },
      onError: (err) => {
        console.warn('Speech synthesis error:', err);
        setIsSpeaking(false);
        setStatus('ready');
        setStatusMessage('Ready');
      },
    });
  }, [isMuted, autoSpeak, speechRate, speechPitch]);

  const stopSpeaking = useCallback(() => {
    voiceManager.stopSpeaking();
    setIsSpeaking(false);
    setStatus('ready');
    setStatusMessage('Ready');
  }, []);

  const executeCommand = useCallback(async (spokenText) => {
    if (!spokenText || !spokenText.trim()) return null;

    stopSpeaking();
    setIsThinking(true);
    setStatus('thinking');
    setStatusMessage('VoxWeb is thinking...');
    setErrorMessage(null);

    // Client-side instant evaluation for fast commands
    const { detectFastCommand } = await import('../services/commandRouter');
    const fastAction = detectFastCommand(spokenText, language);

    if (fastAction) {
      setIsThinking(false);
      if (fastAction.url) {
        try {
          if (fastAction.action === 'call_phone') {
            window.location.href = fastAction.url;
          } else {
            window.open(fastAction.url, '_blank');
          }
        } catch (e) {
          console.warn('Auto-open blocked:', e);
        }
      }

      if (onCommandExecutedRef.current) {
        onCommandExecutedRef.current({
          userText: spokenText,
          assistantData: fastAction,
        });
      }

      soundManager.playCommandSuccess();
      if (fastAction.response) {
        speak(fastAction.response);
      }

      // Background sync to backend for database logging
      api.post('/command', { command: spokenText.trim(), language }).catch((e) => {
        console.warn('Backend sync warning:', e);
      });

      return fastAction;
    }

    try {
      // Send command to backend
      const res = await api.post('/command', {
        command: spokenText.trim(),
        language,
      });

      const data = res.data;
      setIsThinking(false);

      if (data.type === 'action' && data.url) {
        try {
          if (data.action === 'call_phone') {
            window.location.href = data.url;
          } else {
            window.open(data.url, '_blank');
          }
        } catch (e) {
          console.warn('Could not auto-open URL:', e);
        }
      }

      if (onCommandExecutedRef.current) {
        onCommandExecutedRef.current({
          userText: spokenText,
          assistantData: data,
        });
      }

      soundManager.playCommandSuccess();
      if (data.response) {
        speak(data.response);
      } else {
        setStatus('ready');
        setStatusMessage('Ready');
      }

      return data;
    } catch (err) {
      console.error('Command execution error:', err);
      setIsThinking(false);
      setStatus('error');
      const errTxt = err.response?.data?.detail || "VoxWeb couldn't connect to the server. Please ensure backend is running at http://127.0.0.1:8000";
      setErrorMessage(errTxt);
      setStatusMessage('Error');

      // Auto-clear error after 4 seconds
      setTimeout(() => {
        setErrorMessage(null);
        setStatus('ready');
        setStatusMessage('Ready');
      }, 4500);

      return null;
    }
  }, [speak, stopSpeaking]);

  const startListening = useCallback(() => {
    if (isListening) {
      stopListening();
      return;
    }

    stopSpeaking();
    setInterimText('');
    setErrorMessage(null);

    voiceManager.startListening({
      onStart: () => {
        setIsListening(true);
        setStatus('listening');
        setStatusMessage('Listening...');
        soundManager.playListenStart();
      },
      onInterim: (text) => {
        setInterimText(text);
      },
      onResult: (finalText) => {
        setIsListening(false);
        setInterimText('');
        if (finalText) {
          executeCommand(finalText);
        }
      },
      onError: (err) => {
        setIsListening(false);
        setStatus('ready');
        setStatusMessage('Ready');
        setErrorMessage(err.message || 'Microphone error');
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  }, [isListening, executeCommand, stopSpeaking]);

  const stopListening = useCallback(() => {
    voiceManager.stopListening();
    setIsListening(false);
    setStatus('ready');
    setStatusMessage('Ready');
  }, []);

  const registerCommandListener = (callback) => {
    onCommandExecutedRef.current = callback;
  };

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        isSpeaking,
        isThinking,
        interimText,
        status,
        statusMessage,
        errorMessage,
        setErrorMessage,
        isMuted,
        setIsMuted,
        autoSpeak,
        setAutoSpeak,
        speechRate,
        setSpeechRate,
        speechPitch,
        setSpeechPitch,
        language,
        setLanguage,
        availableVoices,
        selectedVoiceURI,
        setSelectedVoiceURI,
        startListening,
        stopListening,
        speak,
        stopSpeaking,
        executeCommand,
        registerCommandListener,
        isSupported: isSpeechRecognitionSupported(),
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
