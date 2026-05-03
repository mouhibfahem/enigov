import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, Sun, Moon, Check, CheckCheck, Megaphone, Gavel, BarChart2, ClipboardList, Mail, CalendarDays } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const typeConfig = {
    NEW_ANNOUNCEMENT: { icon: Megaphone, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20', route: '/announcements' },
    COMPLAINT_STATUS_CHANGED: { icon: Gavel, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20', route: '/complaints' },
    NEW_POLL: { icon: BarChart2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20', route: '/polls' },
    NEW_DECISION: { icon: ClipboardList, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20', route: '/decisions' },
    NEW_MESSAGE: { icon: Mail, color: 'text-sky-500 bg-sky-50 dark:bg-sky-900/20', route: '/messaging' },
    NEW_EVENT: { icon: CalendarDays, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20', route: '/events' },
};

const Header = ({ title }) => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const roleLabel = user?.role === 'ROLE_DELEGUE' ? 'Délégué' : 'Étudiant';

    const fetchUnreadCount = async () => {
        try {
            const res = await api.getUnreadCount();
            setUnreadCount(res.data?.count || 0);
        } catch { /* silent */ }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.getNotifications();
            setNotifications(res.data || []);
        } catch { /* silent */ }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (showNotifications) fetchNotifications();
    }, [showNotifications]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await api.markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { /* silent */ }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch { /* silent */ }
    };

    const handleNotificationClick = (notif) => {
        if (!notif.isRead) handleMarkRead(notif.id);
        const config = typeConfig[notif.type];
        if (config?.route) {
            setShowNotifications(false);
            navigate(config.route);
        }
    };

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "À l'instant";
        if (mins < 60) return `il y a ${mins}min`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `il y a ${hours}h`;
        const days = Math.floor(hours / 24);
        return `il y a ${days}j`;
    };

    return (
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>

            <div className="flex items-center gap-3">
                <button
                    onClick={toggleTheme}
                    className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                    title={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-yellow-500" />}
                </button>

                {/* Notification bell */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-xl transition-all relative"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 max-h-[480px] flex flex-col">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                                <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                                    >
                                        <CheckCheck size={14} />
                                        Tout marquer lu
                                    </button>
                                )}
                            </div>
                            <div className="overflow-y-auto flex-1">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-sm">
                                        <Bell size={28} className="mx-auto mb-2 opacity-40" />
                                        Aucune notification
                                    </div>
                                ) : (
                                    notifications.map((notif) => {
                                        const config = typeConfig[notif.type] || typeConfig.NEW_ANNOUNCEMENT;
                                        const Icon = config.icon;
                                        return (
                                            <div
                                                key={notif.id}
                                                onClick={() => handleNotificationClick(notif)}
                                                className={`px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800/50 ${!notif.isRead ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                                            >
                                                <div className={`p-2 rounded-lg shrink-0 ${config.color}`}>
                                                    <Icon size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm leading-snug ${!notif.isRead ? 'font-semibold text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 mt-1">
                                                        {timeAgo(notif.createdAt)}
                                                    </p>
                                                </div>
                                                {!notif.isRead && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
                                                        className="p-1 text-slate-300 hover:text-primary-500 shrink-0 mt-0.5"
                                                        title="Marquer comme lu"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 mx-2"></div>

                <Link to="/settings" className="flex items-center gap-3 pl-2 group/profile cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none group-hover/profile:text-primary-600 transition-colors">
                            {user?.fullName}
                        </p>
                        <p className="text-[10px] font-bold text-primary-500 uppercase tracking-wider mt-1">
                            {roleLabel}
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-bold relative overflow-hidden group-hover/profile:shadow-md group-hover/profile:bg-primary-600 group-hover/profile:text-white transition-all">
                        {user?.profilePhoto ? (
                            <img
                                src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8081'}/uploads/${user.profilePhoto}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User size={20} />
                        )}
                    </div>
                </Link>
            </div>
        </header>
    );
};

export default Header;
