import React, { useState } from 'react';
import {
  MessageSquare,
  ChevronUp,
  ChevronDown,
  X,
  Send,
  Sparkles,
  Paperclip,
  CheckCheck,
  Minimize2,
  Maximize2
} from 'lucide-react';

export default function FloatingChatDock({
  conversations,
  onSendMessage,
  currentUser
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConvId, setActiveConvId] = useState(conversations[0]?.id || null);
  const [msgText, setMsgText] = useState('');

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const unreadCount = conversations.reduce((acc, c) => acc + (c.unread || 0), 0);

  const handleSend = (e) => {
    e.preventDefault();
    if (!msgText.trim() || !activeConv) return;
    onSendMessage(activeConv.id, msgText);
    setMsgText('');
  };

  return (
    <div className="hidden md:block fixed bottom-0 right-4 sm:right-8 z-40 w-80 sm:w-96">
      {/* Minimized Dock Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-t-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-b-0 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-xl object-cover border border-slate-300 dark:border-slate-700"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 absolute -bottom-0.5 -right-0.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Messaging</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#0A66C2] text-white">
                  {unreadCount}
                </span>
              )}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-t-0 shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Conversation Switcher Mini Bar */}
          <div className="flex items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConvId(c.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium whitespace-nowrap transition-colors ${
                  activeConv?.id === c.id
                    ? 'bg-white dark:bg-slate-900 text-[#0A66C2] font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <img src={c.peer.avatar} alt={c.peer.name} className="w-4 h-4 rounded-full object-cover" />
                <span className="truncate max-w-[90px]">{c.peer.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Active Conversation Messages Stream */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            {activeConv ? (
              activeConv.messages.map((m) => {
                const isMe = m.sender === 'me';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-2.5 rounded-2xl ${
                        isMe
                          ? 'bg-[#0A66C2] text-white rounded-br-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <p className="leading-snug">{m.text}</p>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-0.5 px-1">
                      {m.time}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-slate-400 py-8">Select a conversation</div>
            )}
          </div>

          {/* Message Input Bar */}
          <form onSubmit={handleSend} className="p-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900">
            <input
              type="text"
              placeholder="Write a message..."
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#0A66C2]"
            />
            <button
              type="submit"
              className="p-1.5 rounded-xl bg-[#0A66C2] text-white hover:bg-blue-700 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
