import React, { useState, useEffect } from 'react';
import { Activity, Mic, Volume2, Cpu, Zap, ExternalLink, Sparkles, Layers } from 'lucide-react';
import { useVoice } from '../context/VoiceContext';

const WORKSPACES = [
  {
    id: 'work',
    name: 'Work Suite',
    icon: '💼',
    desc: 'GitHub, Gmail, Notion',
    urls: ['https://github.com', 'https://mail.google.com', 'https://www.notion.so'],
  },
  {
    id: 'media',
    name: 'Entertainment',
    icon: '🎬',
    desc: 'YouTube, Spotify, Netflix',
    urls: ['https://www.youtube.com', 'https://open.spotify.com', 'https://www.netflix.com'],
  },
  {
    id: 'dev',
    name: 'Dev Hub',
    icon: '💻',
    desc: 'LeetCode, StackOverflow, ChatGPT',
    urls: ['https://leetcode.com', 'https://stackoverflow.com', 'https://chatgpt.com'],
  },
  {
    id: 'social',
    name: 'Social Network',
    icon: '🌐',
    desc: 'X / Twitter, LinkedIn, Reddit',
    urls: ['https://x.com', 'https://www.linkedin.com', 'https://www.reddit.com'],
  },
];

const AudioVisualizerHUD = () => {
  const { isListening, isSpeaking, isThinking, status, statusMessage } = useVoice();
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    let interval;
    if (isListening || isSpeaking || isThinking) {
      interval = setInterval(() => {
        setPulseScale(1 + Math.random() * 0.15);
      }, 120);
    } else {
      setPulseScale(1);
    }
    return () => clearInterval(interval);
  }, [isListening, isSpeaking, isThinking]);

  const handleLaunchWorkspace = (ws) => {
    ws.urls.forEach((url) => {
      try {
        window.open(url, '_blank');
      } catch (e) {
        console.warn('Could not launch workspace tab:', e);
      }
    });
  };

  const getStatusColor = () => {
    if (isListening) return '#ef4444'; // Red listening
    if (isThinking) return '#f59e0b'; // Amber thinking
    if (isSpeaking) return '#38bdf8'; // Cyan speaking
    return '#10b981'; // Green ready
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(11, 18, 34, 0.85) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: getStatusColor(),
          opacity: 0.08,
          filter: 'blur(50px)',
          transition: 'all 0.5s ease',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Left: AI & Audio Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Animated Glowing Voice Orb */}
          <div
            style={{
              position: 'relative',
              width: 52,
              height: 52,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `radial-gradient(circle, ${getStatusColor()}33 0%, rgba(15, 23, 42, 0.8) 70%)`,
              border: `2px solid ${getStatusColor()}`,
              boxShadow: `0 0 20px ${getStatusColor()}55`,
              transform: `scale(${pulseScale})`,
              transition: 'transform 0.12s ease, border-color 0.3s ease',
            }}
          >
            {isListening ? (
              <Mic size={24} color="#fff" />
            ) : isSpeaking ? (
              <Volume2 size={24} color="#fff" />
            ) : isThinking ? (
              <Cpu size={24} color="#fff" className="spin" />
            ) : (
              <Activity size={24} color="#38bdf8" />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                {isListening ? 'Listening to voice...' : isSpeaking ? 'VoxWeb Speaking' : isThinking ? 'Processing Intelligence...' : 'VoxWeb AI Assistant'}
              </span>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: getStatusColor(),
                  boxShadow: `0 0 8px ${getStatusColor()}`,
                }}
              />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🧠 Engine: <strong style={{ color: '#38bdf8' }}>GPT-4o-mini</strong></span>
              <span>•</span>
              <span>⚡ Latency: <strong style={{ color: '#10b981' }}>&lt; 200ms</strong></span>
              <span>•</span>
              <span>Status: <strong style={{ color: '#f1f5f9' }}>{statusMessage}</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Multi-Tab Quick Workspace Launchers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px' }}>
            Workspaces:
          </div>
          {WORKSPACES.map((ws) => (
            <button
              key={ws.id}
              type="button"
              onClick={() => handleLaunchWorkspace(ws)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title={`1-Click Launch: ${ws.desc}`}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              <span>{ws.icon}</span>
              <span>{ws.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AudioVisualizerHUD;
