'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Calendar,
  Briefcase,
  Mail,
  AlertCircle,
  ExternalLink,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/app-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AppNotification } from '@/types';

export default function NotificationsPage() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | AppNotification['type']>('ALL');

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'ALL') return true;
    return n.type === filter;
  });

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'NEW_JOBS':
        return <Briefcase className="w-4 h-4 text-indigo-400" />;
      case 'INTERVIEW_INVITE':
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      case 'EMAIL_CLASSIFIED':
        return <Mail className="w-4 h-4 text-sky-400" />;
      case 'FOLLOW_UP_DUE':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getNotifBadgeVariant = (type: AppNotification['type']): 'primary' | 'success' | 'warning' | 'neutral' => {
    switch (type) {
      case 'NEW_JOBS':
        return 'primary';
      case 'INTERVIEW_INVITE':
        return 'success';
      case 'FOLLOW_UP_DUE':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-400" />
            Notification Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time alerts for high-matching job discoveries, interview invitations, and upcoming application follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={markAllNotificationsAsRead}>
            <Check className="w-4 h-4 mr-1.5" />
            Mark All as Read
          </Button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'ALL' ? 'bg-slate-800 text-indigo-400 border border-slate-700' : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'UNREAD'
              ? 'bg-slate-800 text-indigo-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Unread ({notifications.filter((n) => !n.isRead).length})
        </button>
        <button
          onClick={() => setFilter('NEW_JOBS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'NEW_JOBS'
              ? 'bg-slate-800 text-indigo-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          New Matches
        </button>
        <button
          onClick={() => setFilter('INTERVIEW_INVITE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'INTERVIEW_INVITE'
              ? 'bg-slate-800 text-indigo-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Interviews
        </button>
        <button
          onClick={() => setFilter('FOLLOW_UP_DUE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'FOLLOW_UP_DUE'
              ? 'bg-slate-800 text-indigo-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Follow-ups Due
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-200">All caught up!</h3>
              <p className="text-xs text-slate-400 mt-1">
                You have no notifications matching the selected filter.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifs.map((notif) => (
            <Card
              key={notif.id}
              className={`transition-colors ${
                !notif.isRead ? 'border-indigo-900/50 bg-slate-900/90' : 'bg-slate-950/40 border-slate-800'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800/90 flex items-center justify-center shrink-0 mt-0.5">
                      {getNotifIcon(notif.type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getNotifBadgeVariant(notif.type)} size="sm">
                          {notif.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm font-semibold text-slate-100">{notif.title}</span>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                      <span className="text-[11px] text-slate-500 block pt-1">
                        {new Date(notif.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {notif.link && (
                      <Link href={notif.link} onClick={() => markNotificationAsRead(notif.id)}>
                        <Button variant="outline" size="sm" className="text-xs">
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                      </Link>
                    )}
                    {!notif.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-400 hover:text-white"
                        onClick={() => markNotificationAsRead(notif.id)}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
