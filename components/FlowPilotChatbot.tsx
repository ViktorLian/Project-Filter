'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const SYSTEM_PROMPT = `Du er FlowPilot Assistant - en vennlig og hjelpsom chatbot.

OM FLOWPILOT:
FlowPilot er et lead management system designet for små bedrifter og selvstendig næringsdrivende som:
- Elektrikere, VVS-folk, snekkere
- Konsulter, coacher, eiendomsmeglere
- Frisører, tandleger, fysioterapeuter
- Alle som mottar og håndterer kundehenvendelser

FLOWPILOT LØSER:
✓ Automatisk innsamling av leads fra nettsiden
✓ Intelligente auto-svar til kundene
✓ AI-analyse av lead-kvalitet
✓ Automatiske oppfølgings-e-poster
✓ Google Maps-optimisering
✓ Analytics og rapporter
✓ Lead-gruppering og e-postkampanjer

PRISING (NOK per måned):
- Starter: 499 kr/mnd → 100 henvendelser, 2 skjemaer og grunnleggende oversikt
- Pro: 1499 kr/mnd (MEST VALGT) → 500 henvendelser, 20 skjemaer og oppfølgingsflyter
- Enterprise: 2499 kr/mnd → Ubegrensede henvendelser, API, webhooks og tilpasset oppsett

6-MÅNEDER FORHÅNDSBETALING: 20% rabatt på alle planer!

PRØVEPERIODE: 14 dager. Betalt abonnement velges etter prøveperioden.

INSTRUKSJONER:
- Svar kort og vennlig (maks 2-3 setninger)
- Forklare enkelt - ikke teknisk jargong
- Hvis de spør om kjøp: "Du kan starte gratis på flowpilot.no eller kontakt hei@flowpilot.no"
- Hvis de spør om feature som mangler: "Vi legger alltid til nye features! Kontakt oss med forslag."
- Vær alltid positiv og hjelpsom`;

export default function FlowPilotChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: 'Hei! 👋 Jeg er FlowPilot Assistant. Jeg kan hjelpe deg med spørsmål om FlowPilot, pricing, features, og mer. Hva vil du vite?',
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.sender === 'bot' ? 'assistant' : 'user',
            content: m.text,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const botMessage: ChatMessage = {
        id: messages.length + 2,
        text: data.reply || 'Beklager, jeg kunne ikke svare på det. Prøv å spørre på nytt!',
        sender: 'bot',
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: ChatMessage = {
        id: messages.length + 2,
        text: 'Beklager, det oppstod en feil. Prøv igjen senere eller kontakt oss på hei@flowpilot.no',
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {isOpen && (
        <div
          style={{
            width: '400px',
            height: '600px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 5px 40px rgba(0,0,0,0.16)',
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '10px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '16px',
              borderRadius: '12px 12px 0 0',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>💬 FlowPilot Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              background: '#f9f9f9',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  marginBottom: '12px',
                  textAlign: msg.sender === 'bot' ? 'left' : 'right',
                }}
              >
                <div
                  style={{
                    background: msg.sender === 'bot' ? '#e9ecef' : '#667eea',
                    color: msg.sender === 'bot' ? '#333' : 'white',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    maxWidth: '80%',
                    display: 'inline-block',
                    wordWrap: 'break-word',
                    fontSize: '14px',
                    lineHeight: '1.4',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
                💭 Tenker...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              display: 'flex',
              padding: '12px',
              borderTop: '1px solid #eee',
              gap: '8px',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Skriv spørsmål..."
              style={{
                flex: 1,
                border: '1px solid #ddd',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
              }}
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading}
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                fontWeight: 'bold',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          transition: 'transform 0.2s ease-in-out',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        💬
      </button>
    </div>
  );
}
