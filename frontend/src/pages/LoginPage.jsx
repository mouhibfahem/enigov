import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, User, Lock, Loader2, AlertCircle, ArrowRight, Mail, RefreshCw } from 'lucide-react';
import Logo from '../components/Logo';
import api from '../services/api';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailNotVerified, setEmailNotVerified] = useState(null); // stores email for resend
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setEmailNotVerified(null);
        setResendSuccess(false);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            const data = err.response?.data;

            // Handle email not verified
            if (data?.code === 'EMAIL_NOT_VERIFIED') {
                setEmailNotVerified(data.email);
                setError(data.message);
            } else {
                setError(data?.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!emailNotVerified) return;
        setResendLoading(true);
        try {
            await api.post('/auth/resend-verification', { email: emailNotVerified });
            setResendSuccess(true);
        } catch {
            // Silently handle
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="max-w-md w-full card !p-8 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <Logo className="scale-125" textColor="text-slate-800 dark:text-slate-100" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Bienvenue</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Connectez-vous à votre espace EniGov</p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6 border border-red-100 dark:border-red-900/30">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="shrink-0 mt-0.5" size={18} />
                            <span>{error}</span>
                        </div>

                        {/* Resend verification button */}
                        {emailNotVerified && (
                            <div className="mt-3 pt-3 border-t border-red-100 dark:border-red-900/30">
                                {resendSuccess ? (
                                    <p className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-2">
                                        <Mail size={16} /> Email de vérification renvoyé !
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleResendVerification}
                                        disabled={resendLoading}
                                        className="text-primary-600 dark:text-primary-400 font-bold text-sm hover:underline underline-offset-4 flex items-center gap-2"
                                    >
                                        {resendLoading ? (
                                            <Loader2 className="animate-spin" size={14} />
                                        ) : (
                                            <RefreshCw size={14} />
                                        )}
                                        Renvoyer l'email de vérification
                                    </button>
                                )}
                            </div>
                        )}
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

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Mot de passe</label>
                            <Link
                                to="/forgot-password"
                                className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline underline-offset-4"
                            >
                                Oublié ?
                            </Link>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input !pl-12 !py-3.5"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full !py-4 flex items-center justify-center gap-3 mt-8 shadow-lg shadow-primary-200 dark:shadow-none"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={22} />
                        ) : (
                            <>
                                <span className="text-lg">Se connecter</span>
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Pas encore de compte ?{' '}
                        <Link to="/register" className="text-primary-600 dark:text-primary-400 font-bold hover:underline underline-offset-4">
                            S'inscrire
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
