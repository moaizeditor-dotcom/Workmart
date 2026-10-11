import React, { useState } from 'react';
import Card3DTilt from '../components/Card3DTilt';
import {
  Bell,
  CheckCheck,
  Trash2,
  Sparkles,
  MessageSquare,
  UserPlus,
  Briefcase,
  Eye,
  Award,
  Filter
} from 'lucide-react';

export default function NotificationsView({
  notifications,
  onMarkAllRead,
  onDeleteNotification,
  onNotificationClick
}) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Reactions') return n.type === 'reaction';
    if (activeFilter === 'Connections') return n.type === 'connection';
    if (activeFilter === 'Jobs') return n.type === 'job';
    if (activeFilter === 'Views') return n.type === 'view';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0A66C2] to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Notifications & Activity
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950 text-[#0A66C2] border border-blue-200 dark:border-blue-900">
                LIVE
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Stay updated on your network engagements, profile views, and career matches.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onMarkAllRead}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-[#0A66C2]" />
            <span>Mark all read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Reactions', 'Connections', 'Jobs', 'Views'].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === f
                ? 'bg-[#0A66C2] text-white font-bold shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 font-mono text-xs">
            No notifications matching this filter.
          </div>
        ) : (
          filteredNotifs.map((notif) => {
            const isUnread = !notif.read;

            return (
              <div
                key={notif.id}
                onClick={() => onNotificationClick && onNotificationClick(notif)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  isUnread
                    ? 'bg-blue-50/60 dark:bg-blue-950/40 border-[#0A66C2]/40 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={notif.actor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={notif.actor?.name || 'Actor'}
                    className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                  />
                  <div>
                    <div className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                      <span className="font-bold text-slate-900 dark:text-white mr-1">
                        {notif.actor?.name}
                      </span>
                      <span>{notif.title}</span>
                    </div>

                    {notif.detail && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {notif.detail}
                      </p>
                    )}

                    <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">
                      {notif.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isUnread && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0A66C2]" title="Unread" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNotification(notif.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Remove notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
