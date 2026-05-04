import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import {
    Users,
    Gavel,
    BarChart2,
    Mail,
    Megaphone,
    CalendarDays,
    ClipboardList,
    Plus,
    ArrowRight,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import api from '../services/api';

const StatCard = ({ icon: Icon, label, value, color, loading }) => (
    <div className="card !p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={22} />
        </div>
        <div>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
            {loading ? (
                <div className="h-7 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mt-1" />
            ) : (
                <p className="text-2xl font-black text-slate-800 dark:text-white">{value}</p>
            )}
        </div>
    </div>
);

const DelegateDashboard = () => {
    const [stats, setStats] = useState({});
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, complaintsRes] = await Promise.allSettled([
                    api.getDashboardStats(),
                    api.get('/complaints')
                ]);

                if (statsRes.status === 'fulfilled') {
                    setStats(statsRes.value.data || {});
                }

                if (complaintsRes.status === 'fulfilled') {
                    setRecentComplaints((complaintsRes.value.data || []).slice(0, 5));
                }
            } catch {
                // Silently handle
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const quickActions = [
        { label: 'Nouvelle Annonce', icon: Megaphone, path: '/announcements', color: 'bg-blue-500 hover:bg-blue-600' },
        { label: 'Nouveau Sondage', icon: BarChart2, path: '/polls', color: 'bg-emerald-500 hover:bg-emerald-600' },
        { label: 'Nouvel Événement', icon: CalendarDays, path: '/events', color: 'bg-orange-500 hover:bg-orange-600' },
        { label: 'Nouvelle Décision', icon: ClipboardList, path: '/decisions', color: 'bg-purple-500 hover:bg-purple-600' }
    ];

    const statusConfig = {
        PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
        IN_PROGRESS: { label: 'En cours', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: TrendingUp },
        RESOLVED: { label: 'Résolue', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
        REJECTED: { label: 'Rejetée', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle }
    };

    return (
        <DashboardLayout title="Tableau de bord">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                    {quickActions.map((action) => (
                        <Link
                            key={action.path}
                            to={action.path}
                            className={`${action.color} text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors shadow-lg`}
                        >
                            <Plus size={16} />
                            {action.label}
                        </Link>
                    ))}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={Users}
                        label="Étudiants"
                        value={stats.totalStudents || 0}
                        color="bg-sky-500/10 text-sky-500 dark:bg-sky-500/20 dark:text-sky-400"
                        loading={loading}
                    />
                    <StatCard
                        icon={Gavel}
                        label="Réclamations"
                        value={stats.totalComplaints || 0}
                        color="bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400"
                        loading={loading}
                    />
                    <StatCard
                        icon={Clock}
                        label="En attente"
                        value={stats.pendingComplaints || 0}
                        color="bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400"
                        loading={loading}
                    />
                    <StatCard
                        icon={BarChart2}
                        label="Sondages actifs"
                        value={stats.activePolls || 0}
                        color="bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400"
                        loading={loading}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={Megaphone}
                        label="Annonces"
                        value={stats.totalAnnouncements || 0}
                        color="bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400"
                        loading={loading}
                    />
                    <StatCard
                        icon={ClipboardList}
                        label="Décisions"
                        value={stats.totalDecisions || 0}
                        color="bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 dark:text-purple-400"
                        loading={loading}
                    />
                    <StatCard
                        icon={CalendarDays}
                        label="Événements à venir"
                        value={stats.upcomingEvents || 0}
                        color="bg-orange-500/10 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400"
                        loading={loading}
                    />
                    <StatCard
                        icon={Mail}
                        label="Messages non lus"
                        value={stats.unreadMessages || 0}
                        color="bg-pink-500/10 text-pink-500 dark:bg-pink-500/20 dark:text-pink-400"
                        loading={loading}
                    />
                </div>

                {/* Complaint Status Breakdown */}
                {!loading && (stats.totalComplaints > 0) && (
                    <div className="card !p-5">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <Gavel size={18} className="text-indigo-500" />
                            Répartition des réclamations
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'En attente', value: stats.pendingComplaints || 0, color: 'bg-amber-500' },
                                { label: 'En cours', value: stats.inProgressComplaints || 0, color: 'bg-blue-500' },
                                { label: 'Résolues', value: stats.resolvedComplaints || 0, color: 'bg-green-500' },
                                { label: 'Rejetées', value: stats.rejectedComplaints || 0, color: 'bg-red-500' },
                            ].map((item) => {
                                const pct = stats.totalComplaints > 0 ? Math.round((item.value / stats.totalComplaints) * 100) : 0;
                                return (
                                    <div key={item.label} className="text-center">
                                        <div className="text-2xl font-black text-slate-800 dark:text-white">{item.value}</div>
                                        <div className="text-xs font-medium text-slate-500 mt-0.5">{item.label}</div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2">
                                            <div className={`${item.color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-1">{pct}%</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Filière/Promotion Breakdown */}
                {!loading && stats.studentsByFiliere && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="card !p-5">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Users size={18} className="text-sky-500" />
                                Répartition par filière
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { key: 'INFO', label: 'Informatique', icon: '💻', color: 'bg-blue-500' },
                                    { key: 'INFOTRO', label: 'Infotronique', icon: '🔌', color: 'bg-emerald-500' },
                                    { key: 'MECA', label: 'Mécatronique', icon: '⚙️', color: 'bg-orange-500' },
                                    { key: 'GSIL', label: 'GSIL', icon: '🏭', color: 'bg-purple-500' }
                                ].map((f) => {
                                    const count = stats.studentsByFiliere?.[f.key] || 0;
                                    const total = stats.totalStudents || 1;
                                    const pct = Math.round((count / total) * 100);
                                    return (
                                        <div key={f.key}>
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                                    <span>{f.icon}</span> {f.label}
                                                </span>
                                                <span className="font-bold text-slate-800 dark:text-white">{count} <span className="text-xs text-slate-400 font-medium">({pct}%)</span></span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                                <div className={`${f.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="card !p-5">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <BarChart2 size={18} className="text-emerald-500" />
                                Répartition par promotion
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { key: 'PREMIERE_ANNEE', label: '1ère année', short: '1A', color: 'bg-sky-500' },
                                    { key: 'DEUXIEME_ANNEE', label: '2ème année', short: '2A', color: 'bg-indigo-500' },
                                    { key: 'TROISIEME_ANNEE', label: '3ème année', short: '3A', color: 'bg-violet-500' }
                                ].map((p) => {
                                    const count = stats.studentsByPromotion?.[p.key] || 0;
                                    const total = stats.totalStudents || 1;
                                    const pct = Math.round((count / total) * 100);
                                    return (
                                        <div key={p.key}>
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                                    <span className="font-bold">{p.short}</span> — {p.label}
                                                </span>
                                                <span className="font-bold text-slate-800 dark:text-white">{count} <span className="text-xs text-slate-400 font-medium">({pct}%)</span></span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                                <div className={`${p.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
                {/* Recent Complaints */}
                <div className="card !p-0 overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Gavel size={18} className="text-indigo-500" />
                            <h3 className="font-bold text-slate-800 dark:text-white">Réclamations récentes</h3>
                        </div>
                        <Link to="/complaints" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                            Voir tout <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <div className="p-5 space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />)}
                            </div>
                        ) : recentComplaints.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                                <Gavel size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-medium">Aucune réclamation</p>
                            </div>
                        ) : (
                            recentComplaints.map((complaint) => {
                                const statusInfo = statusConfig[complaint.status] || statusConfig.PENDING;
                                return (
                                    <div key={complaint.id} className="px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                                                {complaint.title}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {complaint.studentName || 'Étudiant'} · {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('fr-FR') : ''}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${statusInfo.color}`}>
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DelegateDashboard;
