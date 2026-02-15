import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader2, Sparkles, ShieldAlert } from 'lucide-react';
import { GlassCard, Button } from './UI';
import { createSupportChat, executeToolCall } from '../services/geminiService';
import { getChatHistory, saveChatHistory } from '../services/dataService';
import { ChatMessage } from '../types';
import { Language } from '../services/translations';

interface ChatWidgetProps {
  setLang: (l: Language) => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ setLang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Keep the chat session instance ref
  const chatSession = useRef<any>(null);

  useEffect(() => {
    // Load persisted history (simulating backend)
    const history = getChatHistory();
    setMessages(history);

    // Initialize Gemini Chat
    if (!chatSession.current) {
        chatSession.current = createSupportChat();
    }

    // Listen for admin replies
    const handleStorageUpdate = () => {
        setMessages(getChatHistory());
    };
    window.addEventListener('chat_updated', handleStorageUpdate);
    return () => window.removeEventListener('chat_updated', handleStorageUpdate);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveChatHistory(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      if (chatSession.current) {
        let response = await chatSession.current.sendMessage(userMsg.text);
        
        // Handle Function Calls Loop
        // The SDK might return multiple tool calls or text. 
        // We need to check if there are function calls.
        // Note: @google/genai SDK v0.1+ simplifies this, but we handle the raw response structure.
        
        // Check for tool calls in the candidates
        let functionCalls = response.functionCalls;

        while (functionCalls && functionCalls.length > 0) {
            const toolResponses = [];
            for (const call of functionCalls) {
                const result = await executeToolCall(call.name, call.args, setLang);
                toolResponses.push({
                    name: call.name,
                    response: { result: result },
                    id: call.id
                });
            }
            // Send tool output back to model
            response = await chatSession.current.sendToolResponse({ functionResponses: toolResponses });
            functionCalls = response.functionCalls;
        }
        
        const text = response.text || "I processed your request.";
        
        const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: text,
            timestamp: Date.now()
        };
        
        // Check for grounding (Google Search data)
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks && groundingChunks.length > 0) {
           botMsg.text += "\n\nSources:\n" + groundingChunks.map((c: any) => 
             c.web?.uri ? `- [${c.web.title}](${c.web.uri})` : ''
           ).join('\n');
        }

        const finalMessages = [...newMessages, botMsg];
        setMessages(finalMessages);
        saveChatHistory(finalMessages);
      } else {
        // Fallback if API key missing
        const fallbackMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: "I'm offline right now (API Key missing). Please contact admin.",
            timestamp: Date.now()
        };
        setMessages([...newMessages, fallbackMsg]);
      }
    } catch (error) {
      console.error("Chat Error", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an error connecting to the AI service.",
        timestamp: Date.now()
      };
      setMessages([...newMessages, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 lg:bottom-6">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-purple-500/30 flex items-center justify-center text-white hover:scale-105 transition-transform"
        >
          <MessageSquare className="w-7 h-7" />
        </button>
      )}

      {isOpen && (
        <div className="w-[90vw] sm:w-[380px] h-[500px] flex flex-col bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">AI Support</h3>
                <p className="text-xs text-indigo-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#020617] relative">
            {messages.length === 0 && (
                <div className="text-center mt-12 space-y-3 opacity-60">
                    <Sparkles className="w-12 h-12 text-indigo-500 mx-auto" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Ask me anything about Psychology Trade.</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-white/5 rounded-full">Change Language</span>
                        <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-white/5 rounded-full">Deposit Funds</span>
                        <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-white/5 rounded-full">USD to JPY</span>
                    </div>
                </div>
            )}
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : msg.role === 'admin'
                    ? 'bg-amber-500 text-black rounded-tl-none font-medium'
                    : 'bg-white dark:bg-[#1e293b] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-tl-none shadow-sm'
                }`}>
                  {msg.role === 'admin' && (
                     <div className="flex items-center gap-1 text-xs font-bold uppercase mb-1 opacity-70">
                        <ShieldAlert className="w-3 h-3" /> Admin Support
                     </div>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-[#1e293b] p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-white/5 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-white/10 shrink-0">
            <div className="relative flex items-center gap-2">
               <input 
                 type="text" 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                 placeholder="Type a message..."
                 className="w-full bg-slate-100 dark:bg-[#1e293b] border-none rounded-xl py-3 pl-4 pr-12 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
               />
               <button 
                 onClick={handleSend}
                 disabled={!input.trim()}
                 className="absolute right-2 p-1.5 bg-indigo-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
               >
                 <Send className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};