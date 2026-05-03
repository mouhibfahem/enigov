import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Logo from '../components/Logo';
import api from '../services/api';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('Lien de vérification invalide.');
            return;
        }

        api.get(`/auth/verify-email?token=${token}`)
            .then((res) => {
                setStatus('success');
                setMessage(res.data.message);
            })
            .catch((err) => {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Erreur lors de la vérification.');
            });
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full card !p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="flex justify-center mb-6">
                    <Logo className="scale-125" textColor="text-slate-800 dark:text-slate-100" />
                </div>

                {status === 'loading' && (
                    <div className="py-8">
                        <Loader2 className="animate-spin mx-auto text-primary-500" size={48} />
                        <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium">Vérification en cours...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-8">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Email vérifié !</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">{message}</p>
                        <Link
                            to="/login"
                            className="btn-primary inline-flex items-center gap-2 !px-8 !py-3"
                        >
                            Se connecter
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="py-8">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Échec de la vérification</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">{message}</p>
                        <Link
                            to="/login"
                            className="text-primary-600 dark:text-primary-400 font-bold hover:underline underline-offset-4"
                        >
                            Retour à la connexion
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;
