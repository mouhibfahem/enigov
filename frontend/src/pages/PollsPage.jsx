import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Plus,
    Clock,
    CheckCircle2,
    Lock,
    Trash2,
    Send,
    Loader2,
    BarChart3,
    Users,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const PollsPage = () => {
    const { user } = useAuth();
    const isDelegue = user?.role === 'ROLE_DELEGUE';

    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [deadline, setDeadline] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [expandedVoters, setExpandedVoters] = useState({});

    useEffect(() => {
        fetchPolls();
    }, []);

    const fetchPolls = async () => {
        setLoading(true);
        try {
            const res = await api.get('/polls');
            setPolls(res.data);
        } catch {
            setPolls([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const filteredOptions = options.filter(o => o.trim());
        if (!question.trim() || filteredOptions.length < 2) return;
        setSubmitting(true);
        try {
            await api.post('/polls', {
                question,
                options: filteredOptions,
                deadline: deadline || null
            });
            setShowForm(false);
            setQuestion('');
            setOptions(['', '']);
            setDeadline('');
            fetchPolls();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la création');
        } finally {
            setSubmitting(false);
        }
    };

    const handleVote = async (pollId, optionIndex) => {
        try {
            const res = await api.post(`/polls/${pollId}/vote`, { optionIndex });
            setPolls(prev => prev.map(p => p.id === pollId ? res.data : p));
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors du vote');
        }
    };

    const handleClose = async (id) => {
        if (!window.confirm('Clôturer ce sondage ?')) return;
        try {
            await api.put(`/polls/${id}/close`);
            fetchPolls();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce sondage ?')) return;
        try {
            await api.delete(`/polls/${id}`);
            fetchPolls();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur');
        }
    };

    const toggleVoters = (pollId, optIndex) => {
        const key = `${pollId}-${optIndex}`;
        setExpandedVoters(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <DashboardLayout title="Sondages">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Sondages</h1>
                        <p className="text-sm text-slate-500">Participez aux décisions de votre université</p>
                    </div>
                    {isDelegue && (
                        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
                            <Plus size={16} /> Nouveau Sondage
                        </button>
                    )}
                </div>

                {/* Creation Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nouveau Sondage</h3>
                                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCreate} className="p-5 space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Question</label>
                                    <input
                                        className="input"
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        placeholder="ex: Faut-il décaler les examens ?"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Options</label>
                                    <div className="space-y-2">
                                        {options.map((opt, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input
                                                    className="input flex-1"
                                                    value={opt}
                                                    onChange={(e) => {
                                                        const newOpts = [...options];
                                                        newOpts[idx] = e.target.value;
                                                        setOptions(newOpts);
                                                    }}
                                                    placeholder={`Option ${idx + 1}`}
                                                    required={idx < 2}
                                                />
                                                {idx >= 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                                                        className="p-2 text-slate-400 hover:text-red-500"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setOptions([...options, ''])}
                                            className="text-sm font-semibold text-primary-600 hover:underline"
                                        >
                                            + Ajouter une option
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Date limite (optionnel)</label>
                                    <input
                                        type="datetime-local"
                                        className="input"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                                        Annuler
                                    </button>
                                    <button type="submit" disabled={submitting} className="btn-primary px-6 flex items-center gap-2">
                                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        Lancer le Sondage
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Polls List */}
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="animate-spin text-primary-500" size={32} />
                    </div>
                ) : polls.length === 0 ? (
                    <div className="card p-16 text-center border-dashed">
                        <BarChart3 size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-400 font-medium">Aucun sondage pour le moment.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {polls.map((poll) => {
                            const isExpired = poll.deadline && new Date(poll.deadline) < new Date();
                            const isClosed = !poll.active || isExpired;
                            const canVote = !isDelegue && !poll.userVoted && !isClosed;

                            return (
                                <div key={poll.id} className="card !p-0 overflow-hidden">
                                    <div className="p-5">
                                        {/* Poll header */}
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {isClosed ? (
                                                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                            <Lock size={10} className="inline mr-0.5" /> Clôturé
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                                            <Clock size={10} className="inline mr-0.5" /> En cours
                                                        </span>
                                                    )}
                                                    {poll.userVoted && (
                                                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                            <CheckCircle2 size={10} className="inline mr-0.5" /> Voté
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{poll.question}</h3>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                                    <span>{poll.createdAt ? new Date(poll.createdAt).toLocaleDateString('fr-FR') : ''}</span>
                                                    <span>&middot;</span>
                                                    <span className="flex items-center gap-1"><Users size={12} /> {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}</span>
                                                    {poll.deadline && (
                                                        <>
                                                            <span>&middot;</span>
                                                            <span>Limite : {new Date(poll.deadline).toLocaleDateString('fr-FR')}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Delegate actions */}
                                            {isDelegue && (
                                                <div className="flex items-center gap-1 shrink-0">
                                                    {poll.active && !isExpired && (
                                                        <button
                                                            onClick={() => handleClose(poll.id)}
                                                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                                            title="Clôturer"
                                                        >
                                                            <Lock size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(poll.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Options */}
                                        <div className="space-y-2">
                                            {poll.options.map((opt) => {
                                                const isSelected = poll.userVotedOptionIndex === opt.index;
                                                const showResults = poll.userVoted || isDelegue || isClosed;

                                                return (
                                                    <div key={opt.index}>
                                                        <button
                                                            onClick={() => canVote && handleVote(poll.id, opt.index)}
                                                            disabled={!canVote}
                                                            className={`w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden ${
                                                                isSelected
                                                                    ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20'
                                                                    : canVote
                                                                        ? 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer'
                                                                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                                                            }`}
                                                        >
                                                            {/* Progress bar background */}
                                                            {showResults && (
                                                                <div
                                                                    className={`absolute inset-0 transition-all ${isSelected ? 'bg-primary-100/50 dark:bg-primary-900/20' : 'bg-slate-100/50 dark:bg-slate-800/30'}`}
                                                                    style={{ width: `${opt.percentage}%` }}
                                                                />
                                                            )}
                                                            <div className="relative flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    {isSelected && <CheckCircle2 size={16} className="text-primary-600 dark:text-primary-400" />}
                                                                    <span className={`font-medium text-sm ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                                                        {opt.text}
                                                                    </span>
                                                                </div>
                                                                {showResults && (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs font-bold text-slate-500">{opt.voteCount}</span>
                                                                        <span className="text-xs font-bold text-slate-400">({opt.percentage}%)</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </button>

                                                        {/* Delegate: show voters */}
                                                        {isDelegue && opt.voterNames && opt.voterNames.length > 0 && (
                                                            <div className="ml-3 mt-1">
                                                                <button
                                                                    onClick={() => toggleVoters(poll.id, opt.index)}
                                                                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                                                                >
                                                                    <Users size={12} />
                                                                    {opt.voterNames.length} votant{opt.voterNames.length > 1 ? 's' : ''}
                                                                    {expandedVoters[`${poll.id}-${opt.index}`] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                                </button>
                                                                {expandedVoters[`${poll.id}-${opt.index}`] && (
                                                                    <div className="mt-1 pl-4 py-1 border-l-2 border-slate-200 dark:border-slate-700">
                                                                        {opt.voterNames.map((name, i) => (
                                                                            <p key={i} className="text-xs text-slate-500 py-0.5">{name}</p>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
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

export default PollsPage;
