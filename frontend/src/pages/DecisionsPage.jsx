import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Gavel,
    Plus,
    Calendar,
    Trash2,
    Send,
    Loader2,
    X,
    MessageSquare,
    BarChart3,
    ExternalLink
} from 'lucide-react';

const DecisionsPage = () => {
    const { user } = useAuth();
    const isDelegue = user?.role === 'ROLE_DELEGUE';

    const [decisions, setDecisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [sourceType, setSourceType] = useState('COMPLAINT');
    const [sourceId, setSourceId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    // Sources for the delegate picker
    const [complaints, setComplaints] = useState([]);
    const [polls, setPolls] = useState([]);
    const [loadingSources, setLoadingSources] = useState(false);

    useEffect(() => {
        fetchDecisions();
    }, []);

    const fetchDecisions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/decisions');
            setDecisions(res.data);
        } catch {
            setDecisions([]);
        } finally {
            setLoading(false);
        }
    };

    const openForm = async () => {
        setShowForm(true);
        setLoadingSources(true);
        try {
            const [cRes, pRes] = await Promise.allSettled([
                api.get('/complaints'),
                api.get('/polls')
            ]);
            setComplaints(cRes.status === 'fulfilled' ? cRes.value.data : []);
            setPolls(pRes.status === 'fulfilled' ? pRes.value.data : []);
        } catch {
            // Silent
        } finally {
            setLoadingSources(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        setSubmitting(true);
        try {
            await api.post('/decisions', {
                title,
                content,
                sourceType: sourceId ? sourceType : null,
                sourceId: sourceId || null
            });
            setShowForm(false);
            setTitle('');
            setContent('');
            setSourceType('COMPLAINT');
            setSourceId('');
            fetchDecisions();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la création');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette décision ?')) return;
        try {
            await api.delete(`/decisions/${id}`);
            fetchDecisions();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur');
        }
    };

    const sourceLabel = (type) => type === 'COMPLAINT' ? 'Réclamation' : 'Sondage';
    const sourceIcon = (type) => type === 'COMPLAINT' ? MessageSquare : BarChart3;
    const sourceRoute = (type, id) => type === 'COMPLAINT' ? `/complaints` : `/polls`;

    return (
        <DashboardLayout title="Décisions">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Décisions</h1>
                        <p className="text-sm text-slate-500">Les décisions prises suite aux réclamations et sondages</p>
                    </div>
                    {isDelegue && (
                        <button onClick={openForm} className="btn-primary flex items-center gap-2 text-sm">
                            <Plus size={16} /> Nouvelle Décision
                        </button>
                    )}
                </div>

                {/* Creation Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nouvelle Décision</h3>
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
                                        placeholder="ex: Amélioration du réseau WiFi — Bâtiment B"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Contenu</label>
                                    <textarea
                                        className="input min-h-[120px]"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Détaillez la décision prise..."
                                        required
                                    />
                                </div>

                                {/* Source linking */}
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Lier à une source (optionnel)</label>
                                    <div className="flex gap-2 mb-2">
                                        <button
                                            type="button"
                                            onClick={() => { setSourceType('COMPLAINT'); setSourceId(''); }}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${sourceType === 'COMPLAINT' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400 bg-slate-50 dark:bg-slate-800/50'}`}
                                        >
                                            <MessageSquare size={14} /> Réclamation
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setSourceType('POLL'); setSourceId(''); }}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${sourceType === 'POLL' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400 bg-slate-50 dark:bg-slate-800/50'}`}
                                        >
                                            <BarChart3 size={14} /> Sondage
                                        </button>
                                    </div>
                                    {loadingSources ? (
                                        <div className="flex justify-center py-4">
                                            <Loader2 size={20} className="animate-spin text-slate-400" />
                                        </div>
                                    ) : (
                                        <select
                                            value={sourceId}
                                            onChange={(e) => setSourceId(e.target.value)}
                                            className="input text-sm"
                                        >
                                            <option value="">— Aucune source —</option>
                                            {sourceType === 'COMPLAINT'
                                                ? complaints.map(c => (
                                                    <option key={c.id} value={c.id}>{c.title}</option>
                                                ))
                                                : polls.map(p => (
                                                    <option key={p.id} value={p.id}>{p.question}</option>
                                                ))
                                            }
                                        </select>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                                        Annuler
                                    </button>
                                    <button type="submit" disabled={submitting} className="btn-primary px-6 flex items-center gap-2">
                                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        Publier
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Decisions List */}
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="animate-spin text-primary-500" size={32} />
                    </div>
                ) : decisions.length === 0 ? (
                    <div className="card p-16 text-center border-dashed">
                        <Gavel size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-400 font-medium">Aucune décision pour le moment.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {decisions.map((decision) => {
                            const SourceIcon = decision.sourceType ? sourceIcon(decision.sourceType) : null;

                            return (
                                <div key={decision.id} className="card !p-0 overflow-hidden">
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg shrink-0 mt-0.5">
                                                    <Gavel size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3
                                                        className="font-bold text-slate-800 dark:text-white cursor-pointer hover:text-primary-600 transition-colors"
                                                        onClick={() => setExpandedId(expandedId === decision.id ? null : decision.id)}
                                                    >
                                                        {decision.title}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            {decision.createdAt ? new Date(decision.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                                                        </span>
                                                        {decision.sourceType && (
                                                            <>
                                                                <span>&middot;</span>
                                                                <a
                                                                    href={sourceRoute(decision.sourceType, decision.sourceId)}
                                                                    className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-bold hover:underline"
                                                                >
                                                                    {SourceIcon && <SourceIcon size={12} />}
                                                                    {sourceLabel(decision.sourceType)}
                                                                    {decision.sourceTitle && `: ${decision.sourceTitle}`}
                                                                    <ExternalLink size={10} />
                                                                </a>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {isDelegue && (
                                                <button
                                                    onClick={() => handleDelete(decision.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className={`mt-3 pl-11`}>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                                                {decision.content}
                                            </p>
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

export default DecisionsPage;
