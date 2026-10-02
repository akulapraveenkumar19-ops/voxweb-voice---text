import React, { useState } from 'react';
import { Sliders, Volume2, Globe, Moon, Shield, VolumeX, CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import VoiceStatus from '../components/VoiceStatus';
import { useVoice } from '../context/VoiceContext';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    speechRate,
    setSpeechRate,
    speechPitch,
    setSpeechPitch,
    autoSpeak,
    setAutoSpeak,
    isMuted,
    setIsMuted,
    availableVoices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    language,
    setLanguage,
    speak,
  } = useVoice();

  const { logout } = useAuth();
  const [saveToast, setSaveToast] = useState(false);

  const triggerTestVoice = () => {
    speak('VoxWeb voice settings updated. Hello! How can I help you today?');
  };

  const handleSaveNotification = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-main">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

        <header className="dashboard-header">
          <div>
            <h1 className="header-greeting-title">Preferences & Settings</h1>
            <p className="header-greeting-sub">Configure voice output, speech synthesis, language, and interface.</p>
          </div>
          <VoiceStatus />
        </header>

        {saveToast && (
          <div className="alert-box alert-success" style={{ maxWidth: '800px', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={16} />
            <span>Preferences saved successfully.</span>
          </div>
        )}

        {/* Voice & Audio Settings Card */}
        <div className="settings-section-card">
          <h3>
            <Volume2 size={20} color="var(--accent-blue)" />
            <span>Voice & Audio Synthesis</span>
          </h3>

          <div className="setting-row">
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>Auto-Speak AI Answers</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Automatically read responses aloud using Text-to-Speech
              </div>
            </div>
            <input
              type="checkbox"
              className="remember-checkbox"
              checked={autoSpeak}
              onChange={(e) => {
                setAutoSpeak(e.target.checked);
                handleSaveNotification();
              }}
            />
          </div>

          <div className="setting-row">
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>Mute Voice Audio</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Silent mode: text responses will show on screen without audio
              </div>
            </div>
            <input
              type="checkbox"
              className="remember-checkbox"
              checked={isMuted}
              onChange={(e) => {
                setIsMuted(e.target.checked);
                handleSaveNotification();
              }}
            />
          </div>

          <div className="setting-row">
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>Speech Voice Persona</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Select preferred synthesis voice engine
              </div>
            </div>
            <select
              className="form-input"
              style={{ width: '220px', padding: '8px 12px' }}
              value={selectedVoiceURI}
              onChange={(e) => {
                setSelectedVoiceURI(e.target.value);
                handleSaveNotification();
              }}
            >
              {availableVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="setting-row">
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                Speech Speed ({speechRate}x)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Adjust speaking pace
              </div>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.8"
              step="0.1"
              value={speechRate}
              className="range-slider"
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            />
          </div>

          <div className="setting-row">
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                Voice Pitch ({speechPitch})
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Adjust voice frequency tone
              </div>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.5"
              step="0.1"
              value={speechPitch}
              className="range-slider"
              onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
            />
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={triggerTestVoice}
              className="google-auth-btn"
              style={{ width: 'auto', padding: '8px 16px' }}
            >
              <Volume2 size={16} />
              <span>Test Voice Sound</span>
            </button>
          </div>
        </div>

        {/* Language & Microphone */}
        <div className="settings-section-card">
          <h3>
            <Globe size={20} color="var(--accent-purple)" />
            <span>Speech Recognition & Language</span>
          </h3>

          <div className="setting-row">
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>Assistant Language</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Voice command dialect for Speech-to-Text
              </div>
            </div>
            <select
              className="form-input"
              style={{ width: '220px', padding: '8px 12px' }}
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                handleSaveNotification();
              }}
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="en-IN">English (India)</option>
              <option value="en-AU">English (Australia)</option>
              <option value="es-ES">Spanish (Spain)</option>
              <option value="fr-FR">French (France)</option>
              <option value="de-DE">German (Germany)</option>
            </select>
          </div>
        </div>

        {/* Appearance */}
        <div className="settings-section-card">
          <h3>
            <Moon size={20} color="var(--accent-emerald)" />
            <span>Theme & Visual Styling</span>
          </h3>

          <div className="setting-row">
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>Visual Theme</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Dark navy / purple gradient glassmorphism branding
              </div>
            </div>
            <select
              className="form-input"
              style={{ width: '220px', padding: '8px 12px' }}
              defaultValue="dark-navy"
            >
              <option value="dark-navy">Dark Navy & Purple (Default)</option>
              <option value="cyberpunk">Cyberpunk Neon</option>
              <option value="midnight">Midnight OLED</option>
            </select>
          </div>
        </div>

        {/* Security & Session */}
        <div className="settings-section-card">
          <h3>
            <Shield size={20} color="var(--accent-rose)" />
            <span>Security & Session</span>
          </h3>

          <div className="setting-row">
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>Active Session</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Signed in with JWT authenticated cookie & token
              </div>
            </div>
            <button onClick={logout} className="btn-danger-outline">
              Terminate Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
