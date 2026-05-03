import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import {
    Megaphone,
    BarChart2,
    Gavel,
    Mail,
    CalendarDays,
    ClipboardList,
    ArrowRight
} from 'lucide-react';
import api from '../services/api';

const EmptySection = ({ icon: Icon, message }) => (
    <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
        <Icon size={32} className="mb-2 opacity-50" />
        <p className="text-sm font-medium">{message}</p>
    </div>
);

const StudentHomePage = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [polls, setPolls] = useState([]);
    const [events, setEvents] = useState([]);
    const [decisions, setDecisions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [annRes, pollRes, eventRes, decRes] = await Promise.allSettled([
                    api.getAnnouncements(),
                    api.getPolls(),
                    api.getUpcomingEvents(),
                    api.getAllDecisions()
                ]);
                if (annRes.status === 'fulfilled') setAnnouncements((annRes.value.data || []).slice(0, 3));
                if (pollRes.status === 'fulfilled') setPolls((pollRes.value.data || []).filter(p => p.active !== false).slice(0, 3));
                if (eventRes.status === 'fulfilled') setEvents((eventRes.value.data || []).slice(0, 3));
                if (decRes.status === 'fulfilled') setDecisions((decRes.value.data || []).slice(0, 3));
            } catch {
                // Silently handle
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const quickActions = [
        {
            label: 'Nouvelle Réclamation',
            icon: Gavel,
            path: '/complaints',
            color: 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400'
        },
        {
            label: 'Voir Sondages',
            icon: BarChart2,
            path: '/polls',
            color: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400'
        },
        {
            label: 'Contacter Délégué',
            icon: Mail,
            path: '/messaging',
            color: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400'
        }
    ];

    return (
        <DashboardLayout title="Accueil">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Welcome */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Bonjour, {user?.fullName?.split(' ')[0]} !
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Voici les dernières actualités de votre espace EniGov.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {quickActions.map((action) => (
                        <Link
                            key={action.path}
                            to={action.path}
                            className="card !p-4 flex items-center gap-4 hover:scale-[1.02] hover:shadow-lg transition-all group"
                        >
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${action.color}`}>
                                <action.icon size={20} />
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {action.label}
                            </span>
                            <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-primary-500 transition-colors" />
                        </Link>
                    ))}
                </div>

                {/* Feed Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Announcements */}
                    <div className="card !p-0 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Megaphone size={18} className="text-blue-500" />
                                <h3 className="font-bold text-slate-800 dark:text-white">Annonces récentes</h3>
                            </div>
                            <Link to="/announcements" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
                                Voir tout
                            </Link>
                        </div>
                        <div className="p-5">
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />)}
                                </div>
                            ) : announcements.length === 0 ? (
                                <EmptySection icon={Megaphone} message="Aucune annonce pour le moment" />
                            ) : (
                                <div className="space-y-3">
                                    {announcements.map((ann) => (
                                        <div key={ann.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{ann.title}</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString('fr-FR') : ''}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Polls */}
                    <div className="card !p-0 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <BarChart2 size={18} className="text-emerald-500" />
                                <h3 className="font-bold text-slate-800 dark:text-white">Sondages actifs</h3>
                            </div>
                            <Link to="/polls" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
                                Voir tout
                            </Link>
                        </div>
                        <div className="p-5">
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />)}
                                </div>
                            ) : polls.length === 0 ? (
                                <EmptySection icon={BarChart2} message="Aucun sondage actif" />
                            ) : (
                                <div className="space-y-3">
                                    {polls.map((poll) => (
                                        <Link key={poll.id} to="/polls" className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{poll.question}</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {poll.totalVotes || 0} votes · {poll.options?.length || 0} options
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="card !p-0 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <CalendarDays size={18} className="text-orange-500" />
                                <h3 className="font-bold text-slate-800 dark:text-white">Événements à venir</h3>
                            </div>
                            <Link to="/events" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
                                Voir tout
                            </Link>
                        </div>
                        <div className="p-5">
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />)}
                                </div>
                            ) : events.length === 0 ? (
                                <EmptySection icon={CalendarDays} message="Aucun événement prévu" />
                            ) : (
                                <div className="space-y-3">
                                    {events.map((event) => (
                                        <Link key={event.id} to="/events" className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{event.title}</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {event.date ? new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                                {event.location ? ` · ${event.location}` : ''}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Decisions */}
                    <div className="card !p-0 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <ClipboardList size={18} className="text-purple-500" />
                                <h3 className="font-bold text-slate-800 dark:text-white">Dernières décisions</h3>
                            </div>
                            <Link to="/decisions" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
                                Voir tout
                            </Link>
                        </div>
                        <div className="p-5">
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />)}
                                </div>
                            ) : decisions.length === 0 ? (
                                <EmptySection icon={ClipboardList} message="Aucune décision publiée" />
                            ) : (
                                <div className="space-y-3">
                                    {decisions.map((dec) => (
                                        <Link key={dec.id} to="/decisions" className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{dec.title}</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {dec.sourceType === 'COMPLAINT' ? 'Réclamation' : dec.sourceType === 'POLL' ? 'Sondage' : ''}
                                                {dec.sourceTitle ? ` : ${dec.sourceTitle}` : ''}
                                                {dec.createdAt ? ` · ${new Date(dec.createdAt).toLocaleDateString('fr-FR')}` : ''}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentHomePage;
