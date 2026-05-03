import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    CalendarDays,
    Plus,
    MapPin,
    Clock,
    Trash2,
    Send,
    Loader2,
    X
} from 'lucide-react';

const EventsPage = () => {
    const { user } = useAuth();
    const isDelegue = user?.role === 'ROLE_DELEGUE';

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/events');
            setEvents(res.data);
        } catch {
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
                date: date,
                location: location || null
            });
            setShowForm(false);
            setTitle('');
            setDescription('');
            setDate('');
            setLocation('');
            fetchEvents();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la création');
        } finally {
            setSubmitting(false);
        }
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

    const isPast = (dateStr) => dateStr && new Date(dateStr) < new Date();

    return (
        <DashboardLayout title="Événements">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Événements</h1>
                        <p className="text-sm text-slate-500">Calendrier des événements universitaires</p>
                    </div>
                    {isDelegue && (
                        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
                            <Plus size={16} /> Nouvel Événement
                        </button>
                    )}
                </div>

                {/* Creation Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nouvel Événement</h3>
                                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCreate} className="p-5 space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Titre</label>
                                    <input
                                        className="input"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="ex: Journée portes ouvertes"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Description (optionnel)</label>
                                    <textarea
                                        className="input min-h-[100px]"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Détails de l'événement..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Date et heure</label>
                                    <input
                                        type="datetime-local"
                                        className="input"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Lieu (optionnel)</label>
                                    <input
                                        className="input"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="ex: Amphithéâtre A"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                                        Annuler
                                    </button>
                                    <button type="submit" disabled={submitting} className="btn-primary px-6 flex items-center gap-2">
                                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        Créer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Events List */}
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="animate-spin text-primary-500" size={32} />
                    </div>
                ) : events.length === 0 ? (
                    <div className="card p-16 text-center border-dashed">
                        <CalendarDays size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-400 font-medium">Aucun événement pour le moment.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {events.map((event) => {
                            const past = isPast(event.date);
                            return (
                                <div key={event.id} className={`card !p-0 overflow-hidden ${past ? 'opacity-60' : ''}`}>
                                    <div className="flex items-stretch">
                                        {/* Date block */}
                                        <div className={`w-20 shrink-0 flex flex-col items-center justify-center py-4 ${past ? 'bg-slate-100 dark:bg-slate-800' : 'bg-primary-50 dark:bg-primary-900/20'}`}>
                                            <span className={`text-[10px] font-bold uppercase ${past ? 'text-slate-400' : 'text-primary-500'}`}>
                                                {event.date ? new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' }) : ''}
                                            </span>
                                            <span className={`text-2xl font-black ${past ? 'text-slate-500' : 'text-primary-600 dark:text-primary-400'}`}>
                                                {event.date ? new Date(event.date).getDate() : ''}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-4 flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-800 dark:text-white">{event.title}</h3>
                                                {event.description && (
                                                    <p className="text-xs text-slate-500 mt-0.5 whitespace-pre-wrap">{event.description}</p>
                                                )}
                                                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {event.date ? new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
                                                    {event.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin size={12} />
                                                            {event.location}
                                                        </span>
                                                    )}
                                                    {past && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800">Passé</span>
                                                    )}
                                                </div>
                                            </div>

                                            {isDelegue && (
                                                <button
                                                    onClick={() => handleDelete(event.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default EventsPage;
