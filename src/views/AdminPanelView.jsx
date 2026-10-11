import React, { useState } from 'react';
import Card3DTilt from '../components/Card3DTilt';
import { initialAdminStats } from '../data/mockData';
import {
  Users,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Briefcase,
  DollarSign,
  Activity,
  UserX,
  UserCheck,
  CheckCircle2,
  Lock,
  Layers,
  Search,
  Server,
  Zap,
  LogOut
} from 'lucide-react';

export default function AdminPanelView({ onLogout }) {
  const [stats, setStats] = useState(initialAdminStats);
  const [userList, setUserList] = useState(initialAdminStats.managedUsers);
  const [userSearch, setUserSearch] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('6M');

  const handleToggleStatus = (id) => {
    setUserList(
      userList.map((u) => {
        if (u.id === id) {
          const newStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const handleToggleVerify = (id) => {
    setUserList(
      userList.map((u) => {
        if (u.id === id) {
          const newRole = u.role.includes('Verified') ? 'Standard' : 'Verified Expert';
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  const filteredUsers = userList.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with Admin Status and Logout */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center shadow-md shadow-rose-500/20">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Admin Control Tower
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 border border-rose-200 dark:border-rose-900">
                  ROOT PRIVILEGES
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Executive telemetry, user governance, growth curves, and network audit controls.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Server className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-500">Cluster:</span>
              <span className="text-emerald-600 font-bold">100% OPERATIONAL</span>
            </div>

            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-rose-600 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Users', val: stats.kpis.totalUsers, change: stats.kpis.userGrowth, icon: Users, color: 'text-[#0A66C2]' },
          { label: 'Daily Active', val: stats.kpis.dailyActiveUsers, change: '+12.1%', icon: Activity, color: 'text-indigo-600' },
          { label: 'Audited Proofs', val: stats.kpis.verifiedProofs, change: '+34.8%', icon: ShieldCheck, color: 'text-emerald-600' },
          { label: 'Opportunities', val: stats.kpis.activeJobs, change: '+9.4%', icon: Briefcase, color: 'text-amber-500' },
          { label: 'Platform ARR', val: stats.kpis.platformARR, change: '+41.2%', icon: DollarSign, color: 'text-purple-600' },
          { label: 'System SLA', val: stats.kpis.systemUptime, change: 'Optimal', icon: Zap, color: 'text-emerald-600' }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{kpi.label}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="mt-2 text-lg sm:text-xl font-mono font-extrabold text-slate-900 dark:text-white">
                {kpi.val}
              </div>
              <div className="text-[10px] font-mono text-emerald-600 mt-1 font-semibold">
                {kpi.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Graphs & Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: User Growth Trend Curve */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#0A66C2]" />
                Network Expansion & Active Users
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly verified registration volume and active graph nodes
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono">
              {['1M', '6M', '1Y', 'ALL'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg ${
                    selectedTimeframe === tf
                      ? 'bg-white dark:bg-slate-900 text-[#0A66C2] font-bold shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Analytics Area Curve */}
          <div className="h-64 w-full relative pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0A66C2" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0A66C2" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="700" y2="40" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="700" y2="90" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="700" y2="140" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="4 4" />

              {/* Shaded Area */}
              <path
                d="M 0,180 C 120,160 200,110 320,95 C 440,80 540,40 700,20 L 700,200 L 0,200 Z"
                fill="url(#chartGradient)"
              />

              {/* Stroke Line */}
              <path
                d="M 0,180 C 120,160 200,110 320,95 C 440,80 540,40 700,20"
                fill="none"
                stroke="#0A66C2"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Key Data Nodes */}
              {[
                { cx: 0, cy: 180, val: '24k' },
                { cx: 160, cy: 130, val: '48k' },
                { cx: 320, cy: 95, val: '86k' },
                { cx: 500, cy: 55, val: '124k' },
                { cx: 700, cy: 20, val: '142k' }
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.cx} cy={pt.cy} r="5" fill="#FFFFFF" stroke="#0A66C2" strokeWidth="3" />
                  <text x={pt.cx} y={pt.cy - 12} fill="#0A66C2" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    {pt.val}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>May 2026</span>
            <span>Jun 2026</span>
            <span>Jul 2026</span>
            <span>Aug 2026</span>
            <span>Sep 2026</span>
            <span>Oct 2026 (Live)</span>
          </div>
        </div>

        {/* Right: Security & Proof Distribution */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Proof Quality Breakdown
          </h3>
          <p className="text-xs text-slate-500">Distribution of talent verification tiers across 142k members</p>

          <div className="space-y-3.5 pt-2">
            {[
              { label: 'Staff Tier (95+ WM)', pct: 28, color: 'from-[#0A66C2] to-cyan-500' },
              { label: 'Principal Architect (98+ WM)', pct: 14, color: 'from-indigo-600 to-purple-500' },
              { label: 'Senior Specialist (85+ WM)', pct: 42, color: 'from-emerald-500 to-teal-400' },
              { label: 'Under Review & Pending', pct: 16, color: 'from-amber-400 to-orange-400' }
            ].map((bar, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{bar.label}</span>
                  <span className="font-mono">{bar.pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${bar.color} rounded-full`}
                    style={{ width: `${bar.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Governance & Moderation Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0A66C2]" />
              User Governance & Integrity Directory
            </h3>
            <p className="text-xs text-slate-500">
              Direct administrative privileges to audit, verify, or suspend accounts
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search user by name, email, or role..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#0A66C2]"
            />
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Designation / Role</th>
                <th className="p-3">Workmark Score</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => {
                const isActive = u.status === 'Active';
                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            {u.name}
                            {u.role.includes('Verified') && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#0A66C2]" />
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{u.role}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950 text-[#0A66C2] border border-blue-200 dark:border-blue-900">
                        {u.score} WM
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleToggleVerify(u.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        Toggle Verification
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {isActive ? 'Suspend' : 'Reinstate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
