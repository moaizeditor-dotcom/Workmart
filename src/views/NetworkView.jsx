import React, { useState } from 'react';
import ConstellationGlobe from '../components/ConstellationGlobe';
import Card3DTilt from '../components/Card3DTilt';
import BorderBeam from '../components/BorderBeam';
import {
  Users,
  UserCheck,
  UserPlus,
  ShieldCheck,
  Search,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  Check,
  X,
  Send,
  MessageSquare,
  BookOpen,
  Calendar,
  Building,
  UserCheck2,
  Globe
} from 'lucide-react';

export default function NetworkView({
  nodes,
  onConnect,
  onAcceptInvite,
  onIgnoreInvite,
  currentUser
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | '3d'

  // Pending Invitations List State (LinkedIn Exact Feature)
  const [invitations, setInvitations] = useState([
    {
      id: 'inv_1',
      name: 'Elena Rostova',
      role: 'Staff Kernel Architect at Apex Systems',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      mutual: 34,
      score: 98.4,
      note: 'Hi Alex, followed your consensus benchmark paper. Would love to connect and exchange notes on distributed memory synchronization!'
    },
    {
      id: 'inv_2',
      name: 'Marcus Sterling',
      role: 'Chief Product Officer at Apex Spatial',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      mutual: 19,
      score: 96.8,
      note: 'Loved your 3D UI architecture article. Would love to stay connected!'
    }
  ]);

  // Connect With Note Modal
  const [connectTarget, setConnectTarget] = useState(null);
  const [personalNote, setPersonalNote] = useState('');

  const handleOpenConnectModal = (peer) => {
    setConnectTarget(peer);
    setPersonalNote(`Hi ${peer.name.split(' ')[0]}, I'd love to join your professional network on Workmark!`);
  };

  const handleSendConnect = (e) => {
    e.preventDefault();
    if (!connectTarget) return;

    if (onConnect) onConnect(connectTarget.id, personalNote);
    setConnectTarget(null);
    setPersonalNote('');
  };

  const handleAccept = (invite) => {
    setInvitations(invitations.filter((i) => i.id !== invite.id));
    if (onAcceptInvite) onAcceptInvite(invite);
  };

  const handleIgnore = (inviteId) => {
    setInvitations(invitations.filter((i) => i.id !== inviteId));
    if (onIgnoreInvite) onIgnoreInvite(inviteId);
  };

  const filteredNodes = nodes.filter((n) => {
    const matchesSearch =
      n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === 'All' || n.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Visual Header with Mode Toggle */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#0A66C2]" />
            My Network & Talent Graph
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-[#0A66C2] border border-blue-200 dark:border-blue-800">
              1,420 CONNECTIONS
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Manage your professional peers, explore the 3D talent graph, and expand your verified network.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-900 text-[#0A66C2] font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            People You May Know
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === '3d'
                ? 'bg-[#0A66C2] text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>3D Constellation Sphere</span>
          </button>
        </div>
      </div>

      {/* 3D Sphere Interactive Mode (Majestic Full Size Mode) */}
      {viewMode === '3d' && (
        <ConstellationGlobe
          onSelectNode={(node) => {
            console.log('Selected node in 3D:', node);
          }}
        />
      )}

      {/* Main Grid: Network Sidebar + Invitations & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Manage My Network Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-2">
              Manage My Network
            </h3>

            {[
              { label: 'Connections', count: '1,420', icon: Users, color: 'text-[#0A66C2]' },
              { label: 'Contacts Synced', count: '890', icon: UserCheck2, color: 'text-indigo-600' },
              { label: 'Following & Followers', count: '4,280', icon: Sparkles, color: 'text-amber-500' },
              { label: 'Groups & Guilds', count: '14', icon: Layers, color: 'text-emerald-500' },
              { label: 'Events & Summits', count: '6', icon: Calendar, color: 'text-rose-500' },
              { label: 'Company Pages', count: '32', icon: Building, color: 'text-slate-500' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{item.count}</span>
                </div>
              );
            })}
          </div>

          {/* Network Match Guarantee Card */}
          <div className="p-5 rounded-3xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0A66C2]" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Network Match Guarantee</h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Every peer in Workmark is verified against real code repositories, company work dossiers, or audited proofs. Zero spam, 100% verified talent.
            </p>
          </div>
        </aside>

        {/* Right Column: Pending Invitations & People You May Know */}
        <main className="lg:col-span-8 space-y-6">
          {/* Pending Invitations Section (Exact LinkedIn Feature) */}
          {invitations.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Pending Invitations</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-[#0A66C2]">
                    {invitations.length} NEW
                  </span>
                </h3>
              </div>

              <div className="space-y-3">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={inv.avatar}
                        alt={inv.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{inv.name}</h4>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-[#0A66C2] font-bold">
                            {inv.score} WM
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{inv.role}</p>
                        <p className="text-[10px] font-mono text-[#0A66C2] mt-0.5">
                          {inv.mutual} mutual connections
                        </p>
                        {inv.note && (
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 italic mt-1.5 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                            "{inv.note}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleIgnore(inv.id)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        Ignore
                      </button>
                      <button
                        onClick={() => handleAccept(inv)}
                        className="px-4 py-1.5 rounded-xl bg-[#0A66C2] text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* People You May Know Grid */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">People You May Know</h3>
                <p className="text-[11px] text-slate-500">Based on your technical profile and mutual constellation</p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter peers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#0A66C2]"
                />
              </div>
            </div>

            {/* Grid of Candidate Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredNodes.map((peer) => {
                const isConnected = peer.status === 'connected';

                return (
                  <div
                    key={peer.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={peer.avatar}
                            alt={peer.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#0A66C2] transition-colors">
                              {peer.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{peer.role}</p>
                            <p className="text-[10px] text-slate-400">{peer.company}</p>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-blue-50 dark:bg-blue-950 text-[#0A66C2] border border-blue-200 dark:border-blue-900">
                          {peer.score} WM
                        </span>
                      </div>

                      <div className="mt-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-500">{peer.category}</span>
                        <span className="text-[#0A66C2] font-bold">{peer.mutual} mutuals</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
                      {isConnected ? (
                        <button
                          disabled
                          className="flex-1 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#0A66C2] text-xs font-bold border border-blue-200 dark:border-blue-800 flex items-center justify-center gap-1 cursor-default"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Connected</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenConnectModal(peer)}
                          className="flex-1 py-1.5 rounded-xl bg-[#0A66C2] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Connect</span>
                        </button>
                      )}

                      <button
                        onClick={() => alert(`Direct message opened for ${peer.name}`)}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Send Message"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* ===================== CONNECT WITH NOTE MODAL ===================== */}
      {connectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#0A66C2]" />
                Connect with {connectTarget.name}
              </h4>
              <button onClick={() => setConnectTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              You can include a personal note explaining why you'd like to connect.
            </p>

            <form onSubmit={handleSendConnect} className="space-y-3 text-xs">
              <textarea
                rows={4}
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                placeholder="Ex: Loved your work in distributed consensus, would love to stay in touch..."
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2] resize-none leading-relaxed"
              />

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-[11px] text-slate-700 dark:text-slate-300">
                Your verified Workmark Score ({currentUser.workmarkScore} WM) will be enclosed with this invite.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConnectTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A66C2] text-white font-bold flex items-center gap-1.5 hover:bg-blue-700 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Invitation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
