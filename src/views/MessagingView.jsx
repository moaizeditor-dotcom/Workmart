import React, { useState, useEffect, useRef } from 'react';
import Card3DTilt from '../components/Card3DTilt';
import {
  Send,
  Video,
  Phone,
  ShieldCheck,
  Calendar,
  Sparkles,
  Search,
  Paperclip,
  CheckCheck,
  Plus,
  X,
  FileCode,
  Smile,
  MoreVertical,
  UserCheck
} from 'lucide-react';

export default function MessagingView({
  conversations,
  onSendMessage,
  onNewConversation,
  currentUser,
  connections = []
}) {
  const [convList, setConvList] = useState(conversations);
  const [activeConvId, setActiveConvId] = useState(conversations[0]?.id || null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // New Chat Modal State
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const activeConv = convList.find((c) => c.id === activeConvId) || convList[0];

  useEffect(() => {
    setConvList(conversations);
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const userText = inputText.trim();
    setInputText('');

    if (onSendMessage) {
      onSendMessage(activeConv.id, userText, 'me');
    }
  };

  const handleStartNewChat = (peer) => {
    const existing = convList.find((c) => c.peer.name === peer.name);
    if (existing) {
      setActiveConvId(existing.id);
      setIsNewChatModalOpen(false);
      return;
    }

    const newConv = {
      id: `conv_${Date.now()}`,
      peer: {
        name: peer.name,
        role: peer.role,
        avatar: peer.avatar,
        online: true,
        verified: true
      },
      lastMessage: 'Conversation initiated',
      timestamp: 'Just now',
      unread: 0,
      messages: [
        {
          id: `m_init_${Date.now()}`,
          sender: 'peer',
          text: `Hi ${currentUser.name.split(' ')[0]}, connected via Workmark talent graph!`,
          time: 'Just now'
        }
      ]
    };

    if (onNewConversation) onNewConversation(newConv);
    setActiveConvId(newConv.id);
    setIsNewChatModalOpen(false);
  };

  const filteredConversations = convList.filter((c) =>
    c.peer.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.peer.role.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-[740px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Column: Conversations List */}
        <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col">
          {/* Header & New Chat Button */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Messaging</span>
                <span className="text-[10px] font-mono text-[#0A66C2] bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full font-bold">
                  VERIFIED DIRECT
                </span>
              </h3>
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="p-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 text-[#0A66C2] border border-slate-200 dark:border-slate-600 transition-colors"
                title="Compose new conversation"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#0A66C2]"
              />
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-mono text-xs">
                No matching messages.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-4 cursor-pointer transition-all flex items-start gap-3 ${
                      isActive
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-[#0A66C2]'
                        : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.peer.avatar}
                        alt={conv.peer.name}
                        className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                      />
                      {conv.peer.online && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800 absolute -bottom-0.5 -right-0.5" />
                      )}
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{conv.peer.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{conv.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{conv.peer.role}</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 truncate mt-1">
                        {conv.lastMessage}
                      </p>
                    </div>

                    {conv.unread > 0 && (
                      <span className="w-2 h-2 rounded-full bg-[#0A66C2] shrink-0 self-center" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="md:col-span-8 flex flex-col bg-white dark:bg-slate-900">
          {activeConv ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={activeConv.peer.avatar}
                      alt={activeConv.peer.name}
                      className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                    />
                    {activeConv.peer.online && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 absolute -bottom-0.5 -right-0.5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{activeConv.peer.name}</h4>
                      {activeConv.peer.verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#0A66C2]" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{activeConv.peer.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    onClick={() => alert(`Meeting schedule dispatched to ${activeConv.peer.name}`)}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0A66C2] transition-colors"
                    title="Schedule Sync"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => alert(`Calling ${activeConv.peer.name}...`)}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0A66C2] transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => alert(`Opening secure video room with ${activeConv.peer.name}...`)}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0A66C2] transition-colors"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
                {activeConv.messages.map((m) => {
                  const isMe = m.sender === 'me';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div
                        className={`max-w-[70%] p-3.5 rounded-2xl shadow-sm ${
                          isMe
                            ? 'bg-[#0A66C2] text-white rounded-br-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <p className="leading-relaxed">{m.text}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 px-1">
                        <span>{m.time}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-[#0A66C2]" />}
                      </div>
                    </div>
                  );
                })}

                {/* Simulated Peer Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                    <span className="w-2 h-2 rounded-full bg-[#0A66C2] animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-[#0A66C2] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-[#0A66C2] animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] font-mono">{activeConv.peer.name} is replying...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Write a message with technical deliverables..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#0A66C2]"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-2xl bg-[#0A66C2] text-white hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-mono text-xs">
              Select a conversation to start messaging.
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Compose Direct Message</h3>
              <button onClick={() => setIsNewChatModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {connections.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No connected peers in your network yet.</p>
              ) : (
                connections.map((peer) => (
                  <div
                    key={peer.id}
                    onClick={() => handleStartNewChat(peer)}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={peer.avatar} alt={peer.name} className="w-9 h-9 rounded-xl object-cover" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{peer.name}</h4>
                        <p className="text-[10px] text-slate-500">{peer.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#0A66C2] font-bold">Start Chat →</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
