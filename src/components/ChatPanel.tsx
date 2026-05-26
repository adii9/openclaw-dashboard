"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Send, User, RefreshCw, BookOpen, History, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import OpenClawLogo from "./OpenClawLogo";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  contextTokens?: number;
  usage?: { input: number; output: number; total: number };
}

const THINKING_MESSAGES = [
  "Thinking...",
  "Planning...",
  "Researching...",
  "Analyzing...",
  "Processing...",
  "Working on it...",
];

interface Session {
  id: string;
  name: string;
  updatedAt: string;
  preview: string;
  sessionId: string;
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your Openclaw assistant. How can I help you today?",
      timestamp: new Date(Date.now() - 60000),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState(THINKING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>("main");

  // Cycle through thinking messages
  useEffect(() => {
    if (!isTyping) return;
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % THINKING_MESSAGES.length;
      setThinkingMessage(THINKING_MESSAGES[index]);
    }, 1500);
    return () => clearInterval(interval);
  }, [isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Fetch sessions from OpenClaw
  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await fetch("/api/openclaw?method=sessions.list");
      const data = await response.json();

      if (data.sessions && Array.isArray(data.sessions)) {
        const sessionList: Session[] = data.sessions.map((s: { sessionId: string; updatedAt: number; key: string; label?: string; displayName?: string; origin?: { label?: string }; status?: string; lastChannel?: string }) => {
          const date = new Date(s.updatedAt);
          const now = new Date();
          const diffMs = now.getTime() - date.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);

          let timeAgo = 'Just now';
          if (diffMins > 60) timeAgo = `${diffHours}h ago`;
          if (diffHours > 24) timeAgo = `${diffDays}d ago`;
          else if (diffMins > 0) timeAgo = `${diffMins}m ago`;

          const name = s.label || s.displayName || s.origin?.label || s.key.split(':').pop()?.slice(0, 12) || 'Chat';

          return {
            id: s.sessionId,
            sessionId: s.sessionId,
            name,
            updatedAt: timeAgo,
            preview: s.status || s.lastChannel || '',
          };
        });
        setSessions(sessionList);
      }
    } catch (e) {
      console.error("Failed to fetch sessions:", e);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Load session history
  const loadSession = async (session: Session) => {
    setLoadingSessions(true);
    try {
      const response = await fetch(`/api/openclaw?method=session.history&sessionId=${session.sessionId}`);
      const data = await response.json();

      if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
        const loadedMessages: Message[] = data.messages.map((m: { role?: string; text?: string; timestamp?: number }) => ({
          id: `${m.timestamp || Date.now()}-${Math.random()}`,
          role: (m.role === 'user' ? 'user' : 'assistant') as "user" | "assistant",
          content: m.text || '',
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        }));
        setMessages(loadedMessages);
      } else {
        setMessages([{
          id: "1",
          role: "assistant",
          content: `Loaded session: ${session.name}. How can I help you?`,
          timestamp: new Date(),
        }]);
      }
      setShowHistory(false);
    } catch (e) {
      console.error("Failed to load session:", e);
      setMessages([{
        id: "1",
        role: "assistant",
        content: "Failed to load session history.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = input;
    setInput("");
    setIsTyping(true);
    setError(null);

    try {
      const response = await fetch("/api/openclaw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "agent.send",
          agentId: selectedAgent,
          message: messageToSend,
        }),
      });

      const data = await response.json();

      let assistantContent = "Sorry, I couldn't process your message.";
      let contextTokens = 0;
      let usage = { input: 0, output: 0, total: 0 };

      const payload = data.result?.payloads?.[0] || data.payload || data.result || data;
      assistantContent = payload.text || payload.content || payload.message || data.text || data.error || assistantContent;

      contextTokens = data.result?.meta?.agentMeta?.contextTokens || 0;
      const agentUsage = data.result?.meta?.agentMeta?.usage || {};
      usage = {
        input: agentUsage.input || 0,
        output: agentUsage.output || 0,
        total: agentUsage.total || 0
      };

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
        contextTokens,
        usage,
      };

      // Force typing animation to show for at least 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e) {
      setError((e as Error).message);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Failed to send message: ${(e as Error).message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: "assistant",
      content: "Hello! I'm your Openclaw assistant. How can I help you today?",
      timestamp: new Date(),
    }]);
    setError(null);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-r border-[--border-subtle] flex flex-col bg-[--bg-panel]"
          >
            <div className="p-4 border-b border-[--border-subtle] flex items-center justify-between">
              <h2 className="font-medium text-sm">History</h2>
              <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-[--bg-elevated] rounded">
                <X size={16} className="text-[--text-muted]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {loadingSessions ? (
                <div className="p-4 text-center text-[--text-muted] text-sm">Loading...</div>
              ) : sessions.length > 0 ? (
                <div className="space-y-1">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => loadSession(session)}
                      className="w-full text-left p-3 rounded-lg hover:bg-[--bg-elevated] transition-colors"
                    >
                      <div className="text-sm font-medium truncate">{session.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[--text-dim]">{session.updatedAt}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-[--text-muted] text-sm">No past interactions</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowHistory(!showHistory); if (!showHistory && sessions.length === 0) fetchSessions(); }}
              className="p-2 hover:bg-[--bg-elevated] rounded-lg transition-colors"
            >
              <History size={18} className={showHistory ? "text-[--accent-cyan]" : "text-[--text-muted]"} />
            </button>
            <h1 className="font-display text-xl font-bold">Chat</h1>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-[--bg-input] border border-[--border-subtle] rounded-lg px-3 py-2 text-sm"
            >
              <option value="main">Main</option>
              <option value="dev">Dev</option>
              <option value="lifebot">Lifebot</option>
            </select>
            <button onClick={handleNewChat} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[--border-subtle] text-sm text-[--text-muted] hover:text-[--text-primary] transition-colors">
              <RefreshCw size={14} />
              New
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[--accent-rose]/10 border border-[--accent-rose]/30 text-sm text-[--accent-rose]">
            {error}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === "user"
                  ? "bg-[--bg-elevated] text-[--text-muted]"
                  : "bg-gradient-to-br from-[#ff6b35] to-[#ff8c42]"
              }`}>
                {message.role === "user" ? <User size={16} /> : <OpenClawLogo size={28} />}
              </div>

              {/* Message */}
              <div className={`max-w-[80%] ${message.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div className={`px-4 py-3 rounded-2xl text-sm ${
                  message.role === "user"
                    ? "bg-[#ff6b35]/10 text-[--text-primary] border border-[#ff6b35]/20"
                    : "bg-[--bg-panel] border border-[--border-subtle] text-[--text-primary]"
                }`}>
                  <ReactMarkdown
                    components={{
                      // Code blocks
                      code({ node, className, children, ...props }) {
                        const inline = !className;
                        if (inline) {
                          return <code className="px-1 py-0.5 rounded bg-[--bg-elevated] text-[#ff6b35] font-mono text-xs" {...props}>{children}</code>;
                        }
                        return (
                          <pre className="bg-[--bg-input] rounded-lg p-3 overflow-x-auto my-2 text-xs border border-[#ff6b35]/20">
                            <code className="text-[--text-primary] font-mono" {...props}>{children}</code>
                          </pre>
                        );
                      },
                      // Tables
                      table({ node, children, ...props }) {
                        return (
                          <div className="overflow-x-auto my-3">
                            <table className="min-w-full text-xs border border-[--border-subtle] rounded-lg overflow-hidden" {...props}>
                              {children}
                            </table>
                          </div>
                        );
                      },
                      thead({ node, children, ...props }) {
                        return <thead className="bg-[--bg-elevated]" {...props}>{children}</thead>;
                      },
                      th({ node, children, ...props }) {
                        return <th className="px-3 py-2 text-left text-[--text-muted] border-b border-[--border-subtle] font-medium" {...props}>{children}</th>;
                      },
                      td({ node, children, ...props }) {
                        return <td className="px-3 py-2 text-[--text-primary] border-b border-[--border-subtle]" {...props}>{children}</td>;
                      },
                      tr({ node, children, ...props }) {
                        return <tr className="hover:bg-[--bg-elevated]/50" {...props}>{children}</tr>;
                      },
                      // Other elements
                      p({ node, children, ...props }) {
                        return <p className="mb-2 last:mb-0 leading-relaxed" {...props}>{children}</p>;
                      },
                      ul({ node, children, ...props }) {
                        return <ul className="list-disc list-inside my-2 space-y-1" {...props}>{children}</ul>;
                      },
                      ol({ node, children, ...props }) {
                        return <ol className="list-decimal list-inside my-2 space-y-1" {...props}>{children}</ol>;
                      },
                      li({ node, children, ...props }) {
                        return <li className="text-[--text-primary]" {...props}>{children}</li>;
                      },
                      strong({ node, children, ...props }) {
                        return <strong className="font-semibold text-[--text-primary]" {...props}>{children}</strong>;
                      },
                      em({ node, children, ...props }) {
                        return <em className="italic" {...props}>{children}</em>;
                      },
                      blockquote({ node, children, ...props }) {
                        return <blockquote className="border-l-2 border-[--accent-cyan] pl-3 my-2 text-[--text-muted] italic" {...props}>{children}</blockquote>;
                      },
                      h1({ node, children, ...props }) {
                        return <h1 className="text-lg font-bold mb-2" {...props}>{children}</h1>;
                      },
                      h2({ node, children, ...props }) {
                        return <h2 className="text-base font-bold mb-2" {...props}>{children}</h2>;
                      },
                      h3({ node, children, ...props }) {
                        return <h3 className="text-sm font-bold mb-1" {...props}>{children}</h3>;
                      },
                      hr({ node, ...props }) {
                        return <hr className="border-[--border-subtle] my-3" {...props} />;
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>

                {/* Context */}
                {message.role === "assistant" && message.usage && message.usage.total > 0 && message.contextTokens > 0 && (
                  <div className="text-[10px] text-[--text-dim] flex items-center gap-1 px-1">
                    <BookOpen size={10} className="text-[#ff6b35]" />
                    <span>{((message.usage.total / message.contextTokens) * 100).toFixed(1)}% context</span>
                  </div>
                )}

                <span className="text-[10px] text-[--text-dim] px-1">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator - at bottom of messages */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] flex items-center justify-center flex-shrink-0">
                <OpenClawLogo size={26} />
              </div>
              <div className="bg-[--bg-panel] border border-[--border-subtle] px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-3 h-3 rounded-full bg-[#ff6b35]"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-3 h-3 rounded-full bg-[#ff4d4d]"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-3 h-3 rounded-full bg-[#ff8c42]"
                  />
                </div>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={thinkingMessage}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs text-[--text-muted]"
                  >
                    {thinkingMessage}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="mt-4 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Openclaw..."
            className="flex-1 bg-[--bg-input] border border-[--border-subtle] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[--accent-cyan]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-lg"
            style={{ boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)' }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
