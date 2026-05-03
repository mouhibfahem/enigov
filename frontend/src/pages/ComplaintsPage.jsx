import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Plus,
    Clock,
    CheckCircle2,
    XCircle,
    TrendingUp,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    Trash2,
    Send,
    Globe,
    Lock,
    Loader2,
    Paperclip
} from 'lucide-react';

const statusConfig = {
    PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
    IN_PROGRESS: { label: 'En cours', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: TrendingUp },
    RESOLVED: { label: 'Résolue', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
    REJECTED: { label: 'Rejetée', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle }
};

const ComplaintsPage = () => {
    const { user } = useAuth();
    const isDelegue = user?.role === 'ROLE_DELEGUE';

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(isDelegue ? 'all' : 'my');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', isPublic: false });
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [respondingTo, setRespondingTo] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [responseStatus, setResponseStatus] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetchComplaints();
    }, [activeTab]);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            let endpoint;
            if (isDelegue) {
                endpoint = '/complaints';
            } else if (activeTab === 'my') {
                endpoint = '/complaints/my';
            } else {
                endpoint = '/complaints/public';
            }
            const response = await api.get(endpoint);
            setComplaints(response.data);
        } catch {
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('isPublic', formData.isPublic);
            if (file) data.append('file', file);

            await api.post('/complaints', data);
            setShowForm(false);
            setFormData({ title: '', description: '', isPublic: false });
            setFile(null);
            fetchComplaints();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la soumission');
        } finally {
            setSubmitting(false);
        }
    };

    const handleVote = async (id, type) => {
        try {
            const res = await api.post(`/complaints/${id}/${type}`);
            setComplaints(prev => prev.map(c => c.id === id ? res.data : c));
        } catch {
            // silently handle
        }
    };

    const handleRespond = async (id) => {
        try {
            await api.put(`/complaints/${id}/status`, {
                status: responseStatus || null,
                response: responseText || null
            });
            setRespondingTo(null);
            setResponseText('');
            setResponseStatus('');
            fetchComplaints();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette réclamation ?')) return;
        try {
            await api.delete(`/complaints/${id}`);
            fetchComplaints();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur');
        }
    };

    const filtered = statusFilter === 'ALL'
        ? complaints
        : complaints.filter(c => c.status === statusFilter);

    return (
        <DashboardLayout title="Réclamations">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Top bar */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Tabs */}
                    {!isDelegue ? (
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                            <button
                                onClick={() => setActiveTab('my')}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'my' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'}`}
                            >
                                Mes Réclamations
                            </button>
                            <button
                                onClick={() => setActiveTab('public')}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'public' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'}`}
                            >
                                Publiques
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="input !w-auto !py-2 text-sm"
                            >
                                <option value="ALL">Tous les statuts</option>
                                <option value="PENDING">En attente</option>
                                <option value="IN_PROGRESS">En cours</option>
                                <option value="RESOLVED">Résolues</option>
                                <option value="REJECTED">Rejetées</option>
                            </select>
                        </div>
                    )}

                    {!isDelegue && (
                        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
                            <Plus size={16} /> Nouvelle Réclamation
                        </button>
                    )}
                </div>

                {/* New Complaint Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nouvelle Réclamation</h3>
                                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Titre</label>
                                    <input
                                        className="input"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Décrivez brièvement le problème"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Description</label>
                                    <textarea
                                        className="input min-h-[120px]"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Donnez tous les détails..."
                                        required
                                    />
                                </div>

                                {/* Public/Private toggle */}
                                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isPublic: false })}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${!formData.isPublic ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400'}`}
                                    >
                                        <Lock size={16} /> Privée
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isPublic: true })}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${formData.isPublic ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400'}`}
                                    >
                                        <Globe size={16} /> Publique
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 -mt-2">
                                    {formData.isPublic
                                        ? 'Visible par tous les étudiants. Ils pourront voter pour ou contre.'
                                        : 'Visible uniquement par vous et le délégué.'
                                    }
                                </p>

                                {/* File */}
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Pièce jointe (optionnel)</label>
                                    <label className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm">
                                        <Paperclip size={16} className="text-slate-400" />
                                        <span className="text-slate-500">{file ? file.name : 'Cliquez pour joindre un fichier'}</span>
                                        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" accept="image/*,application/pdf" />
                                    </label>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                                        Annuler
                                    </button>
                                    <button type="submit" disabled={submitting} className="btn-primary px-6 flex items-center gap-2">
                                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        Soumettre
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Complaints List */}
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="animate-spin text-primary-500" size={32} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="card p-16 text-center border-dashed">
                        <MessageSquare size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-400 font-medium">Aucune réclamation trouvée.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((complaint) => {
                            const status = statusConfig[complaint.status] || statusConfig.PENDING;
                            const StatusIcon = status.icon;
                            const isOwner = complaint.studentId === user?.id;

                            return (
                                <div key={complaint.id} className="card !p-0 overflow-hidden">
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <h4 className="font-bold text-slate-800 dark:text-white">{complaint.title}</h4>
                                                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${status.color}`}>
                                                        <StatusIcon size={12} className="inline mr-1" />
                                                        {status.label}
                                                    </span>
                                                    {complaint.public ? (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                                            <Globe size={10} className="inline mr-0.5" /> Publique
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                            <Lock size={10} className="inline mr-0.5" /> Privée
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 whitespace-pre-wrap">{complaint.description}</p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                                    <span>{complaint.studentName}</span>
                                                    <span>&middot;</span>
                                                    <span>{complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('fr-FR') : ''}</span>
                                                    {complaint.attachmentPath && (
                                                        <>
                                                            <span>&middot;</span>
                                                            <a
                                                                href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8081'}/uploads/${complaint.attachmentPath}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary-600 font-bold hover:underline flex items-center gap-1"
                                                            >
                                                                <Paperclip size={12} /> Pièce jointe
                                                            </a>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Vote buttons (public complaints only, not for delegate) */}
                                            {complaint.public && !isDelegue && (
                                                <div className="flex flex-col items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={() => handleVote(complaint.id, 'upvote')}
                                                        className={`p-1.5 rounded-lg transition-colors ${complaint.userVote === 'UP' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'text-slate-400 hover:bg-green-50 hover:text-green-600'}`}
                                                    >
                                                        <ThumbsUp size={18} />
                                                    </button>
                                                    <span className={`text-sm font-bold ${complaint.voteScore > 0 ? 'text-green-600' : complaint.voteScore < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                                        {complaint.voteScore}
                                                    </span>
                                                    <button
                                                        onClick={() => handleVote(complaint.id, 'downvote')}
                                                        className={`p-1.5 rounded-lg transition-colors ${complaint.userVote === 'DOWN' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'}`}
                                                    >
                                                        <ThumbsDown size={18} />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Vote score display for delegate */}
                                            {complaint.public && isDelegue && (
                                                <div className="flex flex-col items-center shrink-0">
                                                    <span className={`text-lg font-bold ${complaint.voteScore > 0 ? 'text-green-600' : complaint.voteScore < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                                        {complaint.voteScore > 0 ? '+' : ''}{complaint.voteScore}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">votes</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Delegate response display */}
                                        {complaint.delegateResponse && (
                                            <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-800/20">
                                                <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mb-1">Réponse du délégué</p>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{complaint.delegateResponse}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Delegate actions */}
                                    {isDelegue && (
                                        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                                            {respondingTo === complaint.id ? (
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex gap-2">
                                                        <select
                                                            value={responseStatus}
                                                            onChange={(e) => setResponseStatus(e.target.value)}
                                                            className="input !w-auto !py-1.5 text-sm"
                                                        >
                                                            <option value="">Statut...</option>
                                                            <option value="IN_PROGRESS">En cours</option>
                                                            <option value="RESOLVED">Résolue</option>
                                                            <option value="REJECTED">Rejetée</option>
                                                        </select>
                                                        <input
                                                            value={responseText}
                                                            onChange={(e) => setResponseText(e.target.value)}
                                                            placeholder="Votre réponse..."
                                                            className="input flex-1 !py-1.5 text-sm"
                                                        />
                                                        <button
                                                            onClick={() => handleRespond(complaint.id)}
                                                            className="btn-primary !py-1.5 !px-4 text-sm"
                                                        >
                                                            <Send size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => { setRespondingTo(null); setResponseText(''); setResponseStatus(''); }}
                                                            className="px-3 py-1.5 text-slate-400 hover:text-slate-600 text-sm"
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => { setRespondingTo(complaint.id); setResponseStatus(''); setResponseText(''); }}
                                                        className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                                                    >
                                                        Répondre
                                                    </button>
                                                    <span className="text-slate-300 dark:text-slate-600">|</span>
                                                    <button
                                                        onClick={() => handleDelete(complaint.id)}
                                                        className="text-sm font-semibold text-red-500 hover:underline flex items-center gap-1"
                                                    >
                                                        <Trash2 size={14} /> Supprimer
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ComplaintsPage;
