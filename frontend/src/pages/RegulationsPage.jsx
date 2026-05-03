import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    FileText,
    Plus,
    Download,
    Trash2,
    Send,
    Loader2,
    Paperclip,
    X,
    Calendar
} from 'lucide-react';

const RegulationsPage = () => {
    const { user } = useAuth();
    const isDelegue = user?.role === 'ROLE_DELEGUE';

    const [regulations, setRegulations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRegulations();
    }, []);

    const fetchRegulations = async () => {
        setLoading(true);
        try {
            const res = await api.get('/regulations');
            setRegulations(res.data);
        } catch {
            setRegulations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!title.trim() || !file) return;
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('title', title);
            if (description) data.append('description', description);
            data.append('file', file);

            await api.post('/regulations', data);
            setShowForm(false);
            setTitle('');
            setDescription('');
            setFile(null);
            fetchRegulations();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de l\'upload');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce règlement ?')) return;
        try {
            await api.delete(`/regulations/${id}`);
            fetchRegulations();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur');
        }
    };

    const getFileUrl = (filePath) => {
        return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8081'}/uploads/${filePath}`;
    };

    return (
        <DashboardLayout title="Règlements et documents">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Règlements et documents</h1>
                        <p className="text-sm text-slate-500">Documents officiels et règlements intérieurs</p>
                    </div>
                    {isDelegue && (
                        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
                            <Plus size={16} /> Ajouter un document
                        </button>
                    )}
                </div>

                {/* Upload Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Ajouter un document</h3>
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
                                        placeholder="ex: Règlement intérieur 2026"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Description / Notes (optionnel)</label>
                                    <textarea
                                        className="input min-h-[80px]"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="ex: Aller au secteur 9 pour les attestations"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Fichier PDF</label>
                                    <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm">
                                        <Paperclip size={16} className="text-slate-400" />
                                        <span className="text-slate-500">{file ? file.name : 'Cliquez pour sélectionner un PDF'}</span>
                                        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" accept="application/pdf" required />
                                    </label>
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

                {/* Regulations List */}
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="animate-spin text-primary-500" size={32} />
                    </div>
                ) : regulations.length === 0 ? (
                    <div className="card p-16 text-center border-dashed">
                        <FileText size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-400 font-medium">Aucun document pour le moment.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {regulations.map((reg) => (
                            <div key={reg.id} className="card !p-0 overflow-hidden">
                                <div className="p-5 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg shrink-0">
                                            <FileText size={22} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-800 dark:text-white">{reg.title}</h3>
                                            {reg.description && (
                                                <p className="text-xs text-slate-500 mt-0.5 whitespace-pre-wrap">{reg.description}</p>
                                            )}
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                                                <Calendar size={10} />
                                                {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('fr-FR') : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {reg.filePath && (
                                            <a
                                                href={getFileUrl(reg.filePath)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-bold hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                                            >
                                                <Download size={14} />
                                                Télécharger
                                            </a>
                                        )}
                                        {isDelegue && (
                                            <button
                                                onClick={() => handleDelete(reg.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
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

export default RegulationsPage;
