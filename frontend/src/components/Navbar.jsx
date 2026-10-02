import React, { useState } from 'react';
import { Menu, Activity, PhoneCall, Globe } from 'lucide-react';
import VoiceStatus from './VoiceStatus';
import AICallModal from './AICallModal';
import { useVoice } from '../context/VoiceContext';

const Navbar = ({ onOpenSidebar }) => {
  const { language, setLanguage } = useVoice();
  const [showCallModal, setShowCallModal] = useState(false);

  const isTelugu = language && language.startsWith('te');

  const toggleLanguage = () => {
    const nextLang = isTelugu ? 'en-US' : 'te-IN';
    setLanguage(nextLang);
  };

  return (
    <>
      <header className="mobile-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onOpenSidebar}
            className="mobile-menu-btn"
            aria-label="Toggle navigation menu"
          >
            <Menu size={24} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="brand-logo-icon" style={{ width: '32px', height: '32px' }}>
              <Activity size={18} color="#ffffff" />
            </div>
            <span className="brand-name" style={{ fontSize: '1.25rem' }}>VoxWeb</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Language Switcher: EN <-> తెలుగు */}
          <button
            type="button"
            onClick={toggleLanguage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '8px',
              background: isTelugu ? 'rgba(124, 58, 237, 0.25)' : 'rgba(56, 189, 248, 0.15)',
              border: isTelugu ? '1px solid #8b5cf6' : '1px solid rgba(56, 189, 248, 0.4)',
              color: isTelugu ? '#c084fc' : '#38bdf8',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title={isTelugu ? 'Switch to English' : 'తెలుగు భాషలోకి మార్చండి (Switch to Telugu)'}
          >
            <Globe size={14} />
            <span>{isTelugu ? 'తెలుగు (TE)' : 'English (EN)'}</span>
          </button>

          {/* Quick AI Call Button */}
          <button
            type="button"
            onClick={() => setShowCallModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(124, 58, 237, 0.25) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.45)',
              color: '#38bdf8',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Open AI Phone Dialer"
          >
            <PhoneCall size={14} />
            <span style={{ display: 'none', md: 'inline' }}>AI Call</span>
          </button>

          <VoiceStatus />
        </div>
      </header>

      <AICallModal isOpen={showCallModal} onClose={() => setShowCallModal(false)} />
    </>
  );
};

export default Navbar;
