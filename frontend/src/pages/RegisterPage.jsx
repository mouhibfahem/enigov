import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Loader2, AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Password strength
    const getPasswordStrength = (pwd) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score;
    };

    const strength = getPasswordStrength(formData.password);
    const strengthLabels = ['', 'Faible', 'Moyen', 'Bon', 'Excellent'];
    const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-blue-500', 'bg-green-500'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register(formData);
            setRegisteredEmail(formData.email);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Échec de l\'inscription. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full card !p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-center mb-6">
                        <Logo className="scale-125" textColor="text-slate-800 dark:text-slate-100" />
                    </div>
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Vérifiez votre email !</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-2">
                        Un email de vérification a été envoyé à :
                    </p>
                    <p className="text-primary-600 dark:text-primary-400 font-bold text-lg mb-6">
                        {registeredEmail}
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
                        Cliquez sur le lien dans l'email pour activer votre compte.
                    </p>
                    <Link
                        to="/login"
                        className="text-primary-600 dark:text-primary-400 font-bold hover:underline underline-offset-4"
                    >
                        Aller à la connexion
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="max-w-md w-full card !p-8 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <Logo className="scale-125" textColor="text-slate-800 dark:text-slate-100" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Créer un compte</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Rejoignez la plateforme EniGov</p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6 flex items-start gap-3 border border-red-100 dark:border-red-900/30">
                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Nom complet</label>
                        <div className="relative group">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="input !pl-10 !py-2.5"
                                placeholder="Votre nom complet"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input !pl-10 !py-2.5"
                                placeholder="prenom.nom@enicar.ucar.tn"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Mot de passe</label>
                        <div className="relative group">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input !pl-10 !pr-10 !py-2.5"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {formData.password && (
                            <div className="space-y-1.5 mt-1">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-1 flex-1 rounded-full transition-colors ${strength >= level ? strengthColors[strength] : 'bg-slate-200 dark:bg-slate-700'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className={`text-[11px] font-medium ${strength <= 1 ? 'text-red-500' :
                                    strength === 2 ? 'text-orange-500' :
                                        strength === 3 ? 'text-blue-500' : 'text-green-500'
                                    }`}>
                                    {strengthLabels[strength]}
                                    {strength < 3 && ' — min. 8 caractères, 1 majuscule, 1 chiffre'}
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || strength < 3}
                        className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-primary-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <span>S'inscrire</span>
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Vous avez déjà un compte ?{' '}
                        <Link to="/login" className="text-primary-600 dark:text-primary-400 font-bold hover:underline underline-offset-4">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
