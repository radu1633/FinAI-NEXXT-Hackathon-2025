import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Send, LayoutDashboard, MessageSquare, LogOut, Sparkles } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: 'Hello! I\'m InvestAI, your personal banking assistant. How can I help you today?',
    sender: 'ai',
    timestamp: new Date(),
  },
];

const quickActions = [
  'Show my portfolio',
  'Predict next stock',
  'What\'s my risk score?',
  'Suggest diversification',
];

export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI typing
    setIsTyping(true);
    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: getAIResponse(text),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (userText: string): string => {
    const lowerText = userText.toLowerCase();
    
    if (lowerText.includes('portfolio') || lowerText.includes('show')) {
      return 'Your current portfolio is valued at $32,150 with a 8.7% growth this month. Top holdings: AAPL (32%), TSLA (24%), NVDA (18%), MSFT (15%), GOOGL (11%). Would you like detailed analytics?';
    } else if (lowerText.includes('predict') || lowerText.includes('stock')) {
      return 'Based on current market trends and your risk profile, I recommend NVDA with 95% confidence. It shows strong momentum with +12.3% predicted growth. Want to see more options?';
    } else if (lowerText.includes('risk')) {
      return 'Your current risk score is 780 (Excellent), with a Moderate risk profile. This means you\'re well-positioned for balanced growth with manageable volatility. Your portfolio diversity is strong at 85%.';
    } else if (lowerText.includes('diversif')) {
      return 'I suggest adding exposure to healthcare (10%) and commodities (5%) to improve your portfolio resilience. Consider ETFs like VHT or GLD to balance your tech-heavy holdings.';
    } else {
      return 'I can help you with portfolio analysis, stock predictions, risk assessments, and investment strategies. What would you like to explore?';
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#dfc9bc] to-[#f8eb4c]">
      {/* Sidebar */}
      <div className="w-64 bg-[#3b3c44] flex flex-col border-r-2 border-[#fbe304]">
        <div className="p-6 border-b border-[#6c6e74]">
          <h1 className="text-[#fbe304]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            InvestAI
          </h1>
        </div>

        <nav className="flex-1 p-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#dfc9bc] hover:text-[#fbe304] hover:bg-[#6c6e74]/30 rounded-lg transition-all mb-2"
            style={{ fontWeight: 600 }}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#fbe304] bg-[#928915]/30 rounded-lg mb-2"
            style={{ fontWeight: 600 }}
          >
            <MessageSquare size={20} />
            AI Chat
          </button>
        </nav>

        <div className="p-4 border-t border-[#6c6e74]">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#dfc9bc] hover:text-[#fbe304] rounded-lg transition-all"
            style={{ fontWeight: 600 }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-[#3b3c44] px-6 py-4 border-b-2 border-[#fbe304]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fbe304] to-[#928915] flex items-center justify-center">
              <Sparkles className="text-[#3b3c44]" size={20} />
            </div>
            <div>
              <h2 className="text-white" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Talk to InvestAI
              </h2>
              <p className="text-[#dfc9bc]" style={{ fontSize: '0.85rem' }}>
                Your AI banking assistant
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl px-6 py-4 ${
                    message.sender === 'user'
                      ? 'bg-[#fbe304] text-[#3b3c44]'
                      : 'bg-[#3b3c44] text-white'
                  }`}
                  style={{ fontWeight: 400, fontSize: '1rem', lineHeight: 1.6 }}
                >
                  {message.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-[#3b3c44] text-white rounded-2xl px-6 py-4 flex items-center gap-2">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-[#fbe304] rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-[#fbe304] rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-[#fbe304] rounded-full"
                  />
                </div>
                <span style={{ fontSize: '0.9rem' }}>InvestAI is thinking...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-3 bg-white/50 backdrop-blur-sm">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <motion.button
                key={action}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSendMessage(action)}
                className="px-4 py-2 bg-white rounded-full text-[#3b3c44] hover:bg-[#fbe304] transition-all border border-[#dfc9bc] shadow-sm"
                style={{ fontSize: '0.85rem', fontWeight: 500 }}
              >
                {action}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white/80 backdrop-blur-sm px-6 py-4 border-t border-[#dfc9bc]">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
              placeholder="Ask me anything about your investments..."
              className="flex-1 px-6 py-4 rounded-full bg-white border-2 border-[#dfc9bc] focus:border-[#fbe304] outline-none transition-all"
              style={{ fontSize: '1rem' }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSendMessage(inputValue)}
              className="px-6 py-4 bg-[#fbe304] text-[#3b3c44] rounded-full hover:bg-[#f8eb4c] transition-all shadow-lg"
            >
              <Send size={20} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
