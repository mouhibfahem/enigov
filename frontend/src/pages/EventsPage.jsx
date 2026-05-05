import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CalendarDays,
    Plus,
    MapPin,
    Clock,
    Trash2,
    Send,
    Loader2,
    X,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    List as ListIcon,
    AlertCircle,
    BookOpen,
    FileText,
    Heart,
    Settings
} from 'lucide-react';

const categoryColors = {
    'ACADEMIC': 'bg-blue-600 text-white shadow-blue-500/20',
    'EXAM': 'bg-red-600 text-white shadow-red-500/20',
    'SOCIAL': 'bg-purple-600 text-white shadow-purple-500/20',
    'ADMIN': 'bg-amber-600 text-white shadow-amber-500/20'
};

const categoryLabels = {
    'ACADEMIC': 'Académique',
    'EXAM': 'Examen / DS',
    'SOCIAL': 'Vie Étudiante',
    'ADMIN': 'Administratif'
};

const categoryIcons = {
    'ACADEMIC': BookOpen,
    'EXAM': FileText,
    'SOCIAL': Heart,
    'ADMIN': Settings
};

const EventsPage = () => {
    const { user } = useAuth();
    const isDelegue = user?.role === 'ROLE_DELEGUE';

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('calendar'); // 'calendar' or 'list'
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('SOCIAL');
    const [submitting, setSubmitting] = useState(false);

    // Calendar state
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/events');
            console.log('Événements reçus du serveur:', res.data);
            setEvents(res.data);
        } catch (err) {
            console.error('Erreur lors du chargement des événements:', err);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!title.trim() || !date) return;
        setSubmitting(true);
        try {
            await api.post('/events', { 
                title, 
                description, 
                date, 
                endDate: endDate || null, 
                location, 
                type 
            });
            setShowForm(false);
            resetForm();
            fetchEvents();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la création');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDate('');
        setEndDate('');
        setLocation('');
        setType('SOCIAL');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cet événement ?')) return;
        try {
            await api.delete(`/events/${id}`);
            fetchEvents();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur');
        }
    };

    // Calendar logic
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
    const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());
    
    // Adjust for Monday start (0=Sun, 1=Mon... -> 0=Mon, 6=Sun)
    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    const prevMonth = () => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));

    const isToday = (day) => {
        const now = new Date();
        return day === now.getDate() && 
               currentMonth.getMonth() === now.getMonth() && 
               currentMonth.getFullYear() === now.getFullYear();
    };

    const getEventsForDay = (day) => {
        const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return events.filter(e => {
            const start = new Date(e.date);
            const end = e.endDate ? new Date(e.endDate) : start;
            const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const n = new Date(end.getFullYear(), end.getMonth(), end.getDate());
            return checkDate >= s && checkDate <= n;
        });
    };

    return (
        <DashboardLayout title="Agenda Universitaire">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <CalendarDays className="text-primary-600" />
                            Agenda ENICarthage
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">Gérez et consultez les dates clés de l'année</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                        <button 
                            onClick={() => setView('calendar')}
                            className={`p-2 rounded-lg transition-all ${view === 'calendar' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30' : 'text-slate-400'}`}
                            title="Vue Calendrier"
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button 
                            onClick={() => setView('list')}
                            className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30' : 'text-slate-400'}`}
                            title="Vue Liste"
                        >
                            <ListIcon size={20} />
                        </button>
                    </div>

                    {isDelegue && (
                        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20">
                            <Plus size={18} strokeWidth={3} /> 
                            <span className="font-bold">Nouvel Événement</span>
                        </button>
                    )}
                </div>

                {/* Calendar View */}
                <AnimatePresence mode="wait">
                    {view === 'calendar' ? (
                        <motion.div 
                            key="calendar"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl"
                        >
                            {/* Calendar Navigation */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                                <h2 className="text-lg font-black text-slate-800 dark:text-white capitalize">
                                    {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <button onClick={prevMonth} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 text-sm font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                                        Aujourd'hui
                                    </button>
                                    <button onClick={nextMonth} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
                                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                                    <div key={day} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-100 dark:border-slate-800 last:border-0">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 auto-rows-[120px]">
                                {[...Array(startDay)].map((_, i) => (
                                    <div key={`empty-${i}`} className="bg-slate-50/30 dark:bg-slate-900/50 border-r border-b border-slate-100 dark:border-slate-800 last:border-r-0" />
                                ))}
                                
                                {[...Array(daysInMonth)].map((_, i) => {
                                    const day = i + 1;
                                    const dayEvents = getEventsForDay(day);
                                    const firstEvent = dayEvents[0];
                                    const bgClass = firstEvent ? categoryColors[firstEvent.type]?.split(' ')[0].replace('bg-', 'bg-').replace('-600', '-50') : '';
                                    const darkBgClass = firstEvent ? categoryColors[firstEvent.type]?.split(' ')[0].replace('bg-', 'dark:bg-').replace('-600', '/10') : 'dark:bg-slate-900';

                                    return (
                                        <div key={day} className={`min-h-[120px] p-2 transition-colors ${bgClass} ${darkBgClass}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-sm font-black ${isToday(day) ? 'w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30' : 'text-slate-400'}`}>
                                                    {day}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {dayEvents.map(e => (
                                                    <div 
                                                        key={e.id} 
                                                        className={`text-[10px] p-1.5 rounded-lg truncate font-bold shadow-sm ${categoryColors[e.type] || 'bg-slate-500 text-white'}`}
                                                        title={e.title}
                                                    >
                                                        {e.title}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ) : (
                        /* List View */
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {loading ? (
                                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary-500" size={32} /></div>
                            ) : events.length === 0 ? (
                                <div className="card p-20 text-center border-dashed">
                                    <CalendarDays size={48} className="mx-auto mb-4 text-slate-300" />
                                    <p className="text-slate-500 font-bold">Aucun événement à afficher.</p>
                                </div>
                            ) : (
                                events.map(event => (
                                    <div key={event.id} className="card group hover:border-primary-500/30 transition-all !p-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${categoryColors[event.type]?.split(' ')[0] || 'bg-slate-600'} bg-opacity-10 text-slate-800 dark:text-white border border-slate-100 dark:border-slate-800`}>
                                                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">
                                                        {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
                                                    </span>
                                                    <span className="text-2xl font-black">
                                                        {new Date(event.date).getDate()}
                                                        {event.endDate && new Date(event.endDate).getDate() !== new Date(event.date).getDate() && (
                                                            <span className="text-xs ml-0.5">-{new Date(event.endDate).getDate()}</span>
                                                        )}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${categoryColors[event.type] || 'bg-slate-600 text-white'}`}>
                                                            {categoryIcons[event.type] && React.createElement(categoryIcons[event.type], { size: 10 })}
                                                            {categoryLabels[event.type] || 'Événement'}
                                                        </span>
                                                        <h3 className="text-lg font-black text-slate-800 dark:text-white">{event.title}</h3>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        {event.description && <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{event.description}</p>}
                                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                                            <span className="flex items-center gap-1"><Clock size={14} /> {new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                            {event.location && <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {isDelegue && (
                                                <button onClick={() => handleDelete(event.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                                                    <Trash2 size={20} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-6 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {Object.entries(categoryLabels).map(([key, label]) => {
                        const Icon = categoryIcons[key];
                        return (
                            <div key={key} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${categoryColors[key].split(' ')[0]}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                                    {Icon && <Icon size={10} className="opacity-60" />}
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Form Modal */}
                <AnimatePresence>
                    {showForm && (
                        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-white/10"
                            >
                                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Nouvel Événement</h2>
                                    <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>
                                
                                <form onSubmit={handleCreate} className="p-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Titre</label>
                                            <input className="input-premium w-full" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nom de l'événement" required />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Description</label>
                                            <textarea className="input-premium w-full min-h-[80px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Détails..." />
                                        </div>
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Début</label>
                                            <input type="datetime-local" className="input-premium w-full" value={date} onChange={(e) => setDate(e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Fin (Optionnel)</label>
                                            <input type="datetime-local" className="input-premium w-full" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Catégorie</label>
                                            <select className="input-premium w-full" value={type} onChange={(e) => setType(e.target.value)}>
                                                {Object.entries(categoryLabels).map(([k, v]) => (
                                                    <option key={k} value={k}>{v}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">Lieu</label>
                                            <input className="input-premium w-full" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="ex: Amphi A, Hall, etc." />
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-4 pt-4">
                                        <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors uppercase tracking-widest text-xs">
                                            Annuler
                                        </button>
                                        <button type="submit" disabled={submitting} className="flex-1 btn-primary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                                            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                            Publier
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .input-premium {
                    background: transparent;
                    border: 2px solid #e2e8f0;
                    border-radius: 1rem;
                    padding: 0.75rem 1rem;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .dark .input-premium { border-color: #1e293b; color: white; }
                .input-premium:focus {
                    border-color: #4f46e5;
                    outline: none;
                    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
                }
            `}</style>
        </DashboardLayout>
    );
};

export default EventsPage;
