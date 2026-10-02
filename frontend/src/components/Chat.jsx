import React, { useState, useEffect, useRef } from 'react';
import { Send, Volume2, VolumeX, ExternalLink, Bot, User, Trash2, Copy, Check, Sparkles, Music, CloudSun, Calculator, StickyNote, PhoneCall } from 'lucide-react';
import { useVoice } from '../context/VoiceContext';
import Microphone from './Microphone';

const SUGGESTIONS_EN = [
  { label: 'Play Lo-Fi on YouTube', command: 'play lo-fi beats on youtube', icon: <Music size={13} /> },
  { label: 'Weather in New York', command: 'weather in New York', icon: <CloudSun size={13} /> },
  { label: 'Call +91 9876543210', command: 'call +91 9876543210', icon: <PhoneCall size={13} /> },
  { label: 'Calculate 25 × 38', command: 'calculate 25 * 38', icon: <Calculator size={13} /> },
  { label: 'Take a note', command: 'take a note: Meeting with team tomorrow at 3pm', icon: <StickyNote size={13} /> },
  { label: 'Open GitHub', command: 'open github', icon: <ExternalLink size={13} /> },
  { label: 'What is Quantum Computing?', command: 'What is quantum computing?', icon: <Sparkles size={13} /> },
];

const SUGGESTIONS_TE = [
  { label: 'యూట్యూబ్‌లో పాటలు', command: 'play telugu songs on youtube', icon: <Music size={13} /> },
  { label: 'హైదరాబాద్ వాతావరణం', command: 'weather in Hyderabad', icon: <CloudSun size={13} /> },
  { label: 'కాల్ చేయి: 9876543210', command: 'call 9876543210', icon: <PhoneCall size={13} /> },
  { label: 'గణితం: 50 * 25', command: 'calculate 50 * 25', icon: <Calculator size={13} /> },
  { label: 'నోట్ రాసుకో', command: 'take a note: రేపు ఉదయం 10 గంటలకు మీటింగ్', icon: <StickyNote size={13} /> },
  { label: 'గూగుల్ ఓపెన్ చేయి', command: 'open google', icon: <ExternalLink size={13} /> },
  { label: 'కృత్రిమ మేధస్సు (AI) అంటే ఏమిటి?', command: 'కృత్రిమ మేధస్సు అంటే ఏమిటి?', icon: <Sparkles size={13} /> },
];

const Chat = () => {
  const { executeCommand, speak, stopSpeaking, isSpeaking, registerCommandListener, language } = useVoice();
  const isTelugu = Boolean(language && language.startsWith('te'));
  const suggestions = isTelugu ? SUGGESTIONS_TE : SUGGESTIONS_EN;

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: isTelugu
        ? 'నమస్కారం! నేను వోక్స్ వెబ్, మీ తెలివైన వాయిస్ అసిస్టెంట్. "యూట్యూబ్‌లో పాటలు ప్లే చేయి", "వాతావరణం", "కాల్ చేయి <నంబర్>" లాంటి కమాండ్లు మాట్లాడండి లేదా ఏదైనా ప్రశ్న అడగండి!'
        : 'Hello! I am VoxWeb, your intelligent voice website assistant. Try speaking commands like "Play music on YouTube", "Weather in London", "Call <number>", "Calculate 50 * 12", "Take a note", or asking any question!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'ai',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Register command listener from VoiceContext
  useEffect(() => {
    registerCommandListener(({ userText, assistantData }) => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          sender: 'user',
          text: userText,
          timestamp: timeStr,
        },
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: assistantData.response,
          type: assistantData.type,
          action: assistantData.action,
          url: assistantData.url,
          timestamp: timeStr,
        },
      ]);
    });
  }, [registerCommandListener]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const query = inputText.trim();
    setInputText('');

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: query,
        timestamp: timeStr,
      },
    ]);

    const result = await executeCommand(query);
    if (result) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: result.response,
          type: result.type,
          action: result.action,
          url: result.url,
          timestamp: timeStr,
        },
      ]);
    }
  };

  const handleSuggestionClick = (cmd) => {
    setInputText(cmd);
    executeCommand(cmd);
  };

  const handleCopyText = (id, text) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleClearChat = () => {
    stopSpeaking();
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: isTelugu
          ? 'సంభాషణ క్లియర్ చేయబడింది. ఇప్పుడు నేను మీకు ఎలా సహాయపడగలను?'
          : 'Conversation cleared. How can I assist you now?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'ai',
      },
    ]);
  };

  return (
    <div className="chat-conversation-panel">
      {/* Header bar */}
      <div className="chat-panel-header">
        <div className="chat-panel-title">
          <Bot size={20} color="var(--accent-blue)" />
          <span>VoxWeb Voice Assistant</span>
        </div>

        <div className="chat-panel-actions">
          {/* Floating Stop Speaking Button when audio is active */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="btn-replay-audio"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '4px 10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                animation: 'pulse 1.5s infinite',
              }}
              title="Stop audio playback"
            >
              <VolumeX size={14} />
              <span>{isTelugu ? 'ఆపండి' : 'Stop Speaking'}</span>
            </button>
          )}

          <button
            onClick={handleClearChat}
            className="btn-icon-control"
            title={isTelugu ? 'చాట్ క్లియర్ చేయండి' : 'Clear Chat'}
            aria-label="Clear Chat"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="chat-messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message-row ${msg.sender}`}>
            <div className={`message-avatar ${msg.sender === 'assistant' ? 'avatar-voxweb' : 'avatar-user'}`}>
              {msg.sender === 'assistant' ? <Bot size={20} /> : <User size={20} />}
            </div>

            <div style={{ maxWidth: '85%' }}>
              <div className="message-bubble">
                <p style={{ margin: 0, lineHeight: 1.55 }}>{msg.text}</p>

                {/* Direct Phone Calling Action */}
                {msg.action === 'call_phone' && (
                  <div style={{ marginTop: '10px' }}>
                    <a
                      href={msg.url}
                      className="action-launch-link"
                      style={{
                        background: 'rgba(34, 197, 94, 0.2)',
                        border: '1px solid rgba(34, 197, 94, 0.4)',
                        color: '#4ade80',
                      }}
                    >
                      <PhoneCall size={14} />
                      <span>{isTelugu ? 'కాల్ ప్రారంభించండి' : 'Dial Device Call'} ({msg.query})</span>
                    </a>
                  </div>
                )}

                {/* WhatsApp Calling Action */}
                {msg.action === 'call_whatsapp' && (
                  <div style={{ marginTop: '10px' }}>
                    <a
                      href={msg.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-launch-link"
                      style={{
                        background: 'rgba(37, 211, 102, 0.2)',
                        border: '1px solid rgba(37, 211, 102, 0.4)',
                        color: '#22c55e',
                      }}
                    >
                      <PhoneCall size={14} />
                      <span>{isTelugu ? 'వాట్సాప్‌లో కాల్ చేయండి' : 'Call via WhatsApp'} ({msg.query})</span>
                    </a>
                  </div>
                )}

                {/* If action triggered an external URL */}
                {msg.url && msg.action !== 'call_phone' && msg.action !== 'call_whatsapp' && (
                  <div style={{ marginTop: '10px' }}>
                    <a
                      href={msg.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-launch-link"
                    >
                      <span>
                        Visit {msg.url.startsWith('http') ? new URL(msg.url).hostname.replace('www.', '') : msg.url}
                      </span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>

              <div className="message-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>{msg.timestamp}</span>

                {msg.type && (
                  <span
                    className={`badge-action-type ${
                      msg.type === 'action' ? 'badge-action' : 'badge-ai'
                    }`}
                  >
                    {msg.action === 'call_phone'
                      ? (isTelugu ? '📞 ఫోన్ కాల్' : '📞 Device Call')
                      : msg.action === 'call_whatsapp'
                      ? (isTelugu ? '💬 వాట్సాప్ కాల్' : '💬 WhatsApp Call')
                      : msg.action === 'play_youtube'
                      ? (isTelugu ? '▶ యూట్యూబ్' : '▶ YouTube Play')
                      : msg.action === 'weather'
                      ? (isTelugu ? '⛅ వాతావరణం' : '⛅ Live Weather')
                      : msg.action === 'calculate'
                      ? (isTelugu ? '🧮 గణితం' : '🧮 Math Calc')
                      : msg.action === 'save_note'
                      ? (isTelugu ? '📝 వాయిస్ నోట్' : '📝 Voice Note')
                      : msg.type === 'action'
                      ? (isTelugu ? '⚡ త్వరిత చర్య' : '⚡ Fast Action')
                      : (isTelugu ? '🤖 AI సమాధానం' : '🤖 AI Answer')}
                  </span>
                )}

                {msg.sender === 'assistant' && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => speak(msg.text)}
                      className="btn-replay-audio"
                      title={isTelugu ? 'సమాధానం వినండి' : 'Listen to response'}
                    >
                      <Volume2 size={13} />
                      <span>{isTelugu ? 'వినండి' : 'Speak'}</span>
                    </button>

                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="btn-replay-audio"
                      title={isTelugu ? 'కాపీ చేయండి' : 'Copy to clipboard'}
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check size={13} color="var(--accent-emerald)" />
                          <span style={{ color: 'var(--accent-emerald)' }}>{isTelugu ? 'కాపీ అయింది!' : 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>{isTelugu ? 'కాపీ' : 'Copy'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Interactive Suggestion Chips */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: '8px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(0, 0, 0, 0.2)',
          scrollbarWidth: 'none',
        }}
      >
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSuggestionClick(s.command)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 500,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
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
            {s.icon}
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Footer: Microphone & Text Input */}
      <div className="chat-panel-footer">
        <Microphone />

        <form onSubmit={handleSend} className="text-input-bar">
          <input
            type="text"
            className="text-input-field"
            placeholder={
              isTelugu
                ? 'వాయిస్ కమాండ్ టైప్ చేయండి లేదా ఏదైనా ప్రశ్న అడగండి...'
                : 'Type a voice command or ask any question...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            type="submit"
            className="btn-send-message"
            disabled={!inputText.trim()}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
