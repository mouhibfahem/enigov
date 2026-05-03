import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import api from '../services/api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full card !p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-center mb-6">
                        <Logo className="scale-125" textColor="text-slate-800 dark:text-slate-100" />
                    </div>
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Email envoyé !</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Si un compte existe avec l'adresse <strong className="text-slate-700 dark:text-slate-300">{email}</strong>,
                        vous recevrez un lien de réinitialisation.
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
                        Le lien expire dans 15 minutes.
                    </p>
                    <Link
                        to="/login"
                        className="text-primary-600 dark:text-primary-400 font-bold hover:underline underline-offset-4 inline-flex items-center gap-2"
                    >
                        <ArrowLeft size={16} /> Retour à la connexion
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full card !p-8 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <Logo className="scale-125" textColor="text-slate-800 dark:text-slate-100" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Mot de passe oublié ?</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        Entrez votre adresse email pour recevoir un lien de réinitialisation.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6 flex items-start gap-3 border border-red-100 dark:border-red-900/30">
                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input !pl-12 !py-3.5"
                                placeholder="prenom.nom@enicar.ucar.tn"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full !py-4 flex items-center justify-center gap-3 shadow-lg shadow-primary-200 dark:shadow-none"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={22} />
                        ) : (
                            <span className="text-lg">Envoyer le lien</span>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 text-center">
                    <Link
                        to="/login"
                        className="text-primary-600 dark:text-primary-400 font-bold hover:underline underline-offset-4 inline-flex items-center gap-2"
                    >
                        <ArrowLeft size={16} /> Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
