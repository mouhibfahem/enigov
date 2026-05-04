import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Megaphone,
    Plus,
    Calendar,
    Trash2,
    Send,
    Loader2,
    Paperclip,
    X,
    Globe,
    Target,
    Users
} from 'lucide-react';

const FILIERES = [
    { value: 'INFO', label: 'Informatique', short: 'INFO' },
    { value: 'INFOTRO', label: 'Infotronique', short: 'INFOTRO' },
    { value: 'MECA', label: 'Mécatronique', short: 'MECA' },
    { value: 'GSIL', label: 'GSIL', short: 'GSIL' }
];

const PROMOTIONS = [
    { value: 'PREMIERE_ANNEE', label: '1ère année', short: '1A' },
    { value: 'DEUXIEME_ANNEE', label: '2ème année', short: '2A' },
    { value: 'TROISIEME_ANNEE', label: '3ème année', short: '3A' }
];

const TargetBadge = ({ targetAll, targetFilieres, targetPromotions, targetLabel }) => {
    if (targetAll) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <Globe size={10} /> Tous
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 max-w-[200px] truncate" title={targetLabel}>
            <Target size={10} /> {targetLabel || 'Ciblé'}
        </span>
    );
};

const AnnouncementsPage = () => {
    const { user } = useAuth();
    const isDelegue = user?.role === 'ROLE_DELEGUE';

    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    // Target audience state
    const [targetAll, setTargetAll] = useState(true);
    const [selectedFilieres, setSelectedFilieres] = useState([]);
    const [selectedPromotions, setSelectedPromotions] = useState([]);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await api.get('/announcements');
            setAnnouncements(res.data);
        } catch {
            setAnnouncements([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleFiliere = (value) => {
        setSelectedFilieres(prev =>
            prev.includes(value) ? prev.filter(f => f !== value) : [...prev, value]
        );
    };

    const togglePromotion = (value) => {
        setSelectedPromotions(prev =>
            prev.includes(value) ? prev.filter(p => p !== value) : [...prev, value]
        );
    };

    const resetTargetForm = () => {
        setTargetAll(true);
        setSelectedFilieres([]);
        setSelectedPromotions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('title', title);
            data.append('content', content);
            if (file) data.append('file', file);
            data.append('targetAll', targetAll);
            if (!targetAll) {
                selectedFilieres.forEach(f => data.append('targetFilieres', f));
                selectedPromotions.forEach(p => data.append('targetPromotions', p));
            }

            await api.post('/announcements', data);
            setShowForm(false);
            setTitle('');
            setContent('');
            setFile(null);
            resetTargetForm();
            fetchAnnouncements();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la publication');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette annonce ?')) return;
        try {
            await api.delete(`/announcements/${id}`);
            fetchAnnouncements();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur');
        }
    };

    return (
        <DashboardLayout title="Annonces">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Annonces</h1>
                        <p className="text-sm text-slate-500">Les dernières nouvelles du délégué</p>
                    </div>
                    {isDelegue && (
                        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
                            <Plus size={16} /> Nouvelle Annonce
                        </button>
                    )}
                </div>

                {/* Creation Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-2xl">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nouvelle Annonce</h3>
                                <button onClick={() => { setShowForm(false); resetTargetForm(); }} className="text-slate-400 hover:text-slate-600 text-xl">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Titre</label>
                                    <input
                                        className="input"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Titre de l'annonce"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Contenu</label>
                                    <textarea
                                        className="input min-h-[120px]"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Rédigez votre annonce..."
                                        required
                                    />
                                </div>

                                {/* Target Audience Section */}
                                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <Users size={16} className="text-primary-500" /> Public cible
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => { setTargetAll(!targetAll); if (!targetAll) { setSelectedFilieres([]); setSelectedPromotions([]); } }}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${targetAll ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${targetAll ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    {targetAll ? (
                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                            <Globe size={12} /> Visible par tous les étudiants
                                        </p>
                                    ) : (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                            {/* Filières */}
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Filières</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {FILIERES.map((f) => (
                                                        <button
                                                            key={f.value}
                                                            type="button"
                                                            onClick={() => toggleFiliere(f.value)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                                selectedFilieres.includes(f.value)
                                                                    ? 'bg-primary-500 text-white shadow-sm'
                                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                            }`}
                                                        >
                                                            {f.short}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Promotions */}
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Promotions</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {PROMOTIONS.map((p) => (
                                                        <button
                                                            key={p.value}
                                                            type="button"
                                                            onClick={() => togglePromotion(p.value)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                                selectedPromotions.includes(p.value)
                                                                    ? 'bg-primary-500 text-white shadow-sm'
                                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                            }`}
                                                        >
                                                            {p.short}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Summary */}
                                            {(selectedFilieres.length > 0 || selectedPromotions.length > 0) && (
                                                <div className="bg-primary-50 dark:bg-primary-900/10 rounded-lg p-2 text-xs text-primary-700 dark:text-primary-300 font-medium">
                                                    <Target size={12} className="inline mr-1" />
                                                    {selectedFilieres.length > 0 && selectedFilieres.map(f => FILIERES.find(x => x.value === f)?.short).join(', ')}
                                                    {selectedFilieres.length > 0 && selectedPromotions.length > 0 && ' · '}
                                                    {selectedPromotions.length > 0 && selectedPromotions.map(p => PROMOTIONS.find(x => x.value === p)?.short).join(', ')}
                                                </div>
                                            )}
                                            {!targetAll && selectedFilieres.length === 0 && selectedPromotions.length === 0 && (
                                                <p className="text-xs text-amber-500 font-medium">⚠ Aucun filtre sélectionné — visible par tous</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Pièce jointe (optionnel)</label>
                                    <label className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm">
                                        <Paperclip size={16} className="text-slate-400" />
                                        <span className="text-slate-500">{file ? file.name : 'Cliquez pour joindre un fichier'}</span>
                                        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" accept="image/*,application/pdf" />
                                    </label>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => { setShowForm(false); resetTargetForm(); }} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
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

                {/* Announcements List */}
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="animate-spin text-primary-500" size={32} />
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="card p-16 text-center border-dashed">
                        <Megaphone size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-400 font-medium">Aucune annonce pour le moment.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((ann) => (
                            <div key={ann.id} className="card !p-0 overflow-hidden">
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg shrink-0 mt-0.5">
                                                <Megaphone size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3
                                                    className="font-bold text-slate-800 dark:text-white cursor-pointer hover:text-primary-600 transition-colors"
                                                    onClick={() => setExpandedId(expandedId === ann.id ? null : ann.id)}
                                                >
                                                    {ann.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                                                    </span>
                                                    {ann.delegateName && (
                                                        <>
                                                            <span>&middot;</span>
                                                            <span>{ann.delegateName}</span>
                                                        </>
                                                    )}
                                                    <span>&middot;</span>
                                                    <TargetBadge
                                                        targetAll={ann.targetAll}
                                                        targetFilieres={ann.targetFilieres}
                                                        targetPromotions={ann.targetPromotions}
                                                        targetLabel={ann.targetLabel}
                                                    />
                                                    {ann.attachmentPath && (
                                                        <>
                                                            <span>&middot;</span>
                                                            <a
                                                                href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8081'}/uploads/${ann.attachmentPath}`}
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
                                        </div>

                                        {isDelegue && (
                                            <button
                                                onClick={() => handleDelete(ann.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Content — always visible */}
                                    <div className={`mt-3 pl-11`}>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                                            {ann.content}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AnnouncementsPage;
