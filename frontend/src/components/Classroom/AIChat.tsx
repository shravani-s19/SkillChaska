// File: src/components/Classroom/AIChat.tsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, Sparkles, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Dark theme for code
import { learnService } from '../../services/learn.service';
import { cn } from '../../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentTimestamp: number;
  moduleContext: string;
}

export const AIChat = ({ isOpen, onClose, currentTimestamp, moduleContext }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm your AI Tutor. I see you're studying "${moduleContext}". Ask me anything about this topic!`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await learnService.askAI(
        currentTimestamp,
        moduleContext,
        input
      );
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the brain right now. Please check your connection and try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-20 bottom-0 w-96 bg-surface border-l border-border z-30 flex flex-col shadow-2xl backdrop-blur-sm"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-surface/95">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-secondary/20 rounded-xl flex items-center justify-center relative">
                <Bot className="w-5 h-5 text-secondary" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-surface animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Learning Assistant</h3>
                <p className="text-[10px] text-textSecondary uppercase font-bold tracking-wider">
                  Context: {formatTime(currentTimestamp)}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-surface/50">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm overflow-hidden",
                  msg.role === 'user' 
                    ? "bg-secondary text-white rounded-tr-none" 
                    : "bg-white/5 border border-white/10 rounded-tl-none"
                )}>
                  {/* Markdown Renderer */}
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Custom Code Block Renderer
                      code({node, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match && !String(children).includes('\n');
                        
                        return !isInline ? (
                          <div className="my-2 rounded-lg overflow-hidden border border-white/10">
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match?.[1]}
                              PreTag="div"
                              customStyle={{ margin: 0, padding: '1rem', fontSize: '0.8rem' }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className="bg-black/20 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                            {children}
                          </code>
                        );
                      },
                      // Customizing other elements to fit the chat bubble
                      ul: ({children}) => <ul className="list-disc pl-4 my-2 space-y-1">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal pl-4 my-2 space-y-1">{children}</ol>,
                      li: ({children}) => <li className="pl-1">{children}</li>,
                      p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                      a: ({href, children}) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                          {children}
                        </a>
                      ),
                      h1: ({children}) => <h1 className="text-lg font-bold my-2">{children}</h1>,
                      h2: ({children}) => <h2 className="text-base font-bold my-2">{children}</h2>,
                      h3: ({children}) => <h3 className="text-sm font-bold my-1">{children}</h3>,
                      blockquote: ({children}) => <blockquote className="border-l-2 border-white/30 pl-3 my-2 italic opacity-80">{children}</blockquote>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-textSecondary/50 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-textSecondary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-textSecondary/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-surface">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about this lesson..."
                className="w-full bg-white/5 border border-border rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:border-secondary focus:bg-white/10 transition-all placeholder:text-textSecondary/50"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-all disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-textSecondary mt-3 text-center flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-secondary" />
              AI can make mistakes. Double check important info.
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};