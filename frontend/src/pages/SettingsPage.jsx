import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import {
    User,
    Lock,
    Moon,
    Sun,
    Shield,
    Palette,
    Camera,
    Save,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Eye,
    EyeOff,
    Laptop,
    Cpu,
    Settings as SettingsIcon,
    Factory
} from 'lucide-react';

const SettingsPage = () => {
    const { user, updateUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const darkMode = theme === 'dark';
    const [activeTab, setActiveTab] = useState('profile');
    const [saved, setSaved] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);

    // Profile form
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState('');

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Password strength
    const getPasswordStrength = (pwd) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score;
    };

    const strength = getPasswordStrength(newPassword);
    const strengthLabels = ['', 'Faible', 'Moyen', 'Bon', 'Excellent'];
    const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-blue-500', 'bg-green-500'];

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileError('');
        try {
            await api.updateProfile({ fullName });
            updateUser({ fullName });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            setProfileError(error.response?.data?.message || "Erreur lors de la mise à jour.");
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess(false);

        if (newPassword !== confirmPassword) {
            setPasswordError('Les mots de passe ne correspondent pas.');
            return;
        }

        if (strength < 3) {
            setPasswordError('Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre.');
            return;
        }

        setPasswordLoading(true);
        try {
            await api.changePassword({ currentPassword, newPassword });
            setPasswordSuccess(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordSuccess(false), 5000);
        } catch (error) {
            setPasswordError(error.response?.data?.message || "Erreur lors du changement de mot de passe.");
        } finally {
            setPasswordLoading(false);
        }
    };

    const fileInputRef = React.useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Client-side validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Format non supporté. Utilisez JPG, PNG ou WebP.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Le fichier est trop volumineux. Maximum 5 Mo.');
            return;
        }

        const data = new FormData();
        data.append('file', file);

        try {
            const response = await api.uploadPhoto(data);
            const photoUrl = response.data.profilePhoto;
            updateUser({ profilePhoto: photoUrl });
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            alert(`Erreur upload: ${msg}`);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profil', icon: User },
        { id: 'appearance', label: 'Apparence', icon: Palette },
        { id: 'security', label: 'Sécurité', icon: Shield }
    ];

    return (
        <DashboardLayout title="Paramètres">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-none translate-x-1'
                                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <tab.icon size={20} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="card shadow-xl border-none">
                        {activeTab === 'profile' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="relative group">
                                        <div
                                            className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400 text-3xl font-bold border-4 border-white dark:border-slate-800 shadow-md overflow-hidden cursor-pointer"
                                            onClick={() => user?.profilePhoto && setShowLightbox(true)}
                                        >
                                            {user?.profilePhoto ? (
                                                <img
                                                    src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8081'}/uploads/${user.profilePhoto}`}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover transition-transform hover:scale-110"
                                                />
                                            ) : (
                                                user?.fullName?.charAt(0) || 'U'
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fileInputRef.current.click();
                                            }}
                                            className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-slate-700 shadow-lg rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors border border-slate-100 dark:border-slate-600 z-10"
                                        >
                                            <Camera size={16} />
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/webp"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">{user?.fullName}</h3>
                                        <p className="text-slate-500 font-medium">{user?.role === 'ROLE_DELEGUE' ? 'Délégué' : 'Étudiant'}</p>
                                        <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
                                        {user?.filiere && (
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                                                    {user.filiere === 'INFO' ? <><Laptop size={12} /> Informatique</> :
                                                     user.filiere === 'INFOTRO' ? <><Cpu size={12} /> Infotronique</> :
                                                     user.filiere === 'MECA' ? <><SettingsIcon size={12} /> Mécatronique</> :
                                                     user.filiere === 'GSIL' ? <><Factory size={12} /> GSIL</> : user.filiere}
                                                </span>
                                                {user?.promotion && (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                        {user.promotion === 'PREMIERE_ANNEE' ? '1ère année' :
                                                         user.promotion === 'DEUXIEME_ANNEE' ? '2ème année' :
                                                         user.promotion === 'TROISIEME_ANNEE' ? '3ème année' : user.promotion}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Lightbox Modal */}
                                {showLightbox && user?.profilePhoto && (
                                    <div
                                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                                        onClick={() => setShowLightbox(false)}
                                    >
                                        <div className="relative max-w-4xl max-h-[90vh]">
                                            <img
                                                src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8081'}/uploads/${user.profilePhoto}`}
                                                alt="Profile Full Size"
                                                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <button
                                                className="absolute -top-12 right-0 text-white hover:text-primary-400 transition-colors"
                                                onClick={() => setShowLightbox(false)}
                                            >
                                                <span className="text-sm font-bold uppercase tracking-widest">Fermer</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {profileError && (
                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6 flex items-start gap-3 border border-red-100 dark:border-red-900/30">
                                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                                        <span>{profileError}</span>
                                    </div>
                                )}

                                <form onSubmit={handleProfileSave} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nom Complet</label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="input !pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                                        <button type="submit" disabled={profileLoading} className="btn-primary flex items-center gap-2 px-8">
                                            {profileLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                            <span>Enregistrer</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Mode d'affichage</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => darkMode && toggleTheme()}
                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${!darkMode ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-orange-500">
                                                <Sun size={24} />
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-300">Mode Clair</span>
                                        </button>
                                        <button
                                            onClick={() => !darkMode && toggleTheme()}
                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${darkMode ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-slate-800 shadow-sm flex items-center justify-center text-blue-400">
                                                <Moon size={24} />
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-300">Mode Sombre</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Changer le mot de passe</h3>

                                {passwordSuccess && (
                                    <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm mb-6 flex items-start gap-3 border border-green-100 dark:border-green-900/30">
                                        <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
                                        <span>Mot de passe modifié avec succès !</span>
                                    </div>
                                )}

                                {passwordError && (
                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6 flex items-start gap-3 border border-red-100 dark:border-red-900/30">
                                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                                        <span>{passwordError}</span>
                                    </div>
                                )}

                                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mot de passe actuel</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="input !pl-10"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nouveau mot de passe</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                            <input
                                                type={showNewPassword ? 'text' : 'password'}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="input !pl-10 !pr-10"
                                                placeholder="••••••••"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {newPassword && (
                                            <div className="space-y-1.5 mt-1">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4].map((level) => (
                                                        <div
                                                            key={level}
                                                            className={`h-1.5 flex-1 rounded-full transition-colors ${strength >= level ? strengthColors[strength] : 'bg-slate-200 dark:bg-slate-700'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className={`text-xs font-medium ${strength <= 1 ? 'text-red-500' :
                                                    strength === 2 ? 'text-orange-500' :
                                                        strength === 3 ? 'text-blue-500' : 'text-green-500'
                                                    }`}>
                                                    {strengthLabels[strength]}
                                                    {strength < 3 && ' — min. 8 caractères, 1 majuscule, 1 chiffre'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Confirmer le nouveau mot de passe</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="input !pl-10"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                        {confirmPassword && newPassword !== confirmPassword && (
                                            <p className="text-xs text-red-500 font-medium ml-1">Les mots de passe ne correspondent pas.</p>
                                        )}
                                    </div>
                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={passwordLoading || strength < 3 || newPassword !== confirmPassword}
                                            className="btn-primary px-8 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {passwordLoading ? <Loader2 className="animate-spin" size={18} /> : <Shield size={18} />}
                                            <span>Mettre à jour</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {saved && (
                            <div className="fixed bottom-8 right-8 animate-in slide-in-from-right duration-300">
                                <div className="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                                    <CheckCircle2 size={24} />
                                    <span className="font-bold">Paramètres enregistrés avec succès !</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;
