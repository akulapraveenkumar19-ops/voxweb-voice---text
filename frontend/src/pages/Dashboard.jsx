import React, { useState } from 'react';
import { PhoneCall, Globe } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import VoiceStatus from '../components/VoiceStatus';
import QuickActions from '../components/QuickActions';
import AudioVisualizerHUD from '../components/AudioVisualizerHUD';
import Chat from '../components/Chat';
import AICallModal from '../components/AICallModal';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { language, setLanguage } = useVoice();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  const userName = user?.name ? user.name.split(' ')[0] : 'Praveen';
  const isTelugu = language && language.startsWith('te');

  const toggleLanguage = () => {
    const nextLang = isTelugu ? 'en-US' : 'te-IN';
    setLanguage(nextLang);
  };

  return (
    <div className="app-container">
      {/* Sidebar for Desktop & Collapsible Drawer for Mobile */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="app-main">
        {/* Mobile Navigation Header */}
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Dashboard Top Greeting Header */}
        <header className="dashboard-header">
          <div>
            <h1 className="header-greeting-title">
              {isTelugu ? `నమస్కారం, ${userName}! 👋` : `Hello, ${userName}! 👋`}
            </h1>
            <p className="header-greeting-sub">
              {isTelugu
                ? 'మీ వోక్స్ వెబ్ AI అసిస్టెంట్ సిద్ధంగా ఉంది. ఏదైనా అడగండి లేదా మాట్లాడండి!'
                : 'Your intelligent AI voice assistant is online. Talk, search, or automate your web workflows!'}
            </p>
          </div>

          {/* Action buttons on desktop header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Language Switcher Button */}
            <button
              type="button"
              onClick={toggleLanguage}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                background: isTelugu ? 'rgba(124, 58, 237, 0.25)' : 'rgba(56, 189, 248, 0.12)',
                border: isTelugu ? '1px solid #8b5cf6' : '1px solid rgba(56, 189, 248, 0.35)',
                color: isTelugu ? '#c084fc' : '#38bdf8',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title={isTelugu ? 'Switch to English' : 'తెలుగు భాషలోకి మార్చండి'}
            >
              <Globe size={16} />
              <span>{isTelugu ? 'తెలుగు (Telugu)' : 'English (US)'}</span>
            </button>

            {/* AI Call Launcher Button */}
            <button
              type="button"
              onClick={() => setShowCallModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(124, 58, 237, 0.3) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.45)',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
              }}
            >
              <PhoneCall size={16} color="var(--accent-blue)" />
              <span>{isTelugu ? 'AI కాల్' : 'AI Call'}</span>
            </button>

            <div className="desktop-status-wrapper">
              <VoiceStatus />
            </div>
          </div>
        </header>

        {/* Audio Visualizer & Multi-Workspace HUD */}
        <AudioVisualizerHUD />

        {/* Quick Action Cards */}
        <QuickActions />

        {/* Voice Assistant Chat Conversation Hub */}
        <div className="dashboard-main-grid">
          <Chat />
        </div>
      </div>

      {/* AI Call Modal */}
      <AICallModal isOpen={showCallModal} onClose={() => setShowCallModal(false)} />
    </div>
  );
};

export default Dashboard;
