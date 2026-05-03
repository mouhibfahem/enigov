import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Megaphone,
    BarChart2,
    Gavel,
    MessageSquare,
    CalendarDays,
    BookOpen,
    ArrowRight,
    LogIn,
    UserPlus,
    ShieldCheck,
    Users,
    Sparkles
} from 'lucide-react';
import Logo from '../components/Logo';

const features = [
    {
        icon: Megaphone,
        title: 'Annonces officielles',
        description: 'Restez informé en temps réel des communiqués de la délégation et de l\'administration.',
        color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
    },
    {
        icon: Gavel,
        title: 'Réclamations',
        description: 'Soumettez vos préoccupations et suivez leur résolution étape par étape.',
        color: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
    },
    {
        icon: BarChart2,
        title: 'Sondages & Votes',
        description: 'Faites entendre votre voix sur les décisions qui concernent la vie étudiante.',
        color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
    },
    {
        icon: MessageSquare,
        title: 'Messagerie',
        description: 'Échangez directement avec vos délégués et entre étudiants.',
        color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
    },
    {
        icon: CalendarDays,
        title: 'Agenda & Événements',
        description: 'Ne manquez aucune réunion, conférence ou activité organisée.',
        color: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
    },
    {
        icon: BookOpen,
        title: 'Règlements',
        description: 'Consultez les textes, statuts et décisions de l\'établissement.',
        color: 'bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400'
    }
];

const stats = [
    { icon: Users, label: 'Étudiants', value: 'ENICarthage' },
    { icon: ShieldCheck, label: 'Plateforme sécurisée', value: 'JWT + SSL' },
    { icon: Sparkles, label: 'Université', value: 'Carthage' }
];

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: i * 0.08 }
    })
};

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            {/* Top bar */}
            <header className="sticky top-0 z-40 glass border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <Logo textColor="text-slate-800 dark:text-slate-100" />
                    <nav className="flex items-center gap-2 sm:gap-3">
                        <Link
                            to="/login"
                            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                        >
                            <LogIn size={16} />
                            <span className="hidden sm:inline">Se connecter</span>
                        </Link>
                        <Link
                            to="/register"
                            className="btn-primary !py-2 !px-4 flex items-center gap-2 text-sm"
                        >
                            <UserPlus size={16} />
                            <span className="hidden sm:inline">S'inscrire</span>
                            <span className="sm:hidden">Inscription</span>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-5"
                    style={{ backgroundImage: 'url(/hero-bg.jpg)' }}
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/60 to-slate-50 dark:via-slate-950/60 dark:to-slate-950" />

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        className="max-w-3xl mx-auto text-center"
                    >
                        <motion.div
                            variants={fadeUp}
                            custom={0}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800/40 mb-6"
                        >
                            <Sparkles className="text-primary-600 dark:text-primary-400" size={14} />
                            <span className="text-xs font-bold text-primary-700 dark:text-primary-300 tracking-wide uppercase">
                                Plateforme de gouvernance étudiante
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            custom={1}
                            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
                        >
                            Bienvenue sur{' '}
                            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                EniGov
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            custom={2}
                            className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto"
                        >
                            La plateforme officielle de communication et de gouvernance
                            entre les étudiants, les délégués et l'administration de
                            l'École Nationale d'Ingénieurs de Carthage.
                        </motion.p>

                        <motion.div
                            variants={fadeUp}
                            custom={3}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <Link
                                to="/register"
                                className="btn-primary !py-4 !px-8 flex items-center gap-3 shadow-lg shadow-primary-200 dark:shadow-none text-base"
                            >
                                <span>Créer un compte</span>
                                <ArrowRight size={20} />
                            </Link>
                            <Link
                                to="/login"
                                className="px-8 py-4 rounded-lg font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center gap-3"
                            >
                                <LogIn size={20} />
                                <span>J'ai déjà un compte</span>
                            </Link>
                        </motion.div>

                        <motion.div
                            variants={fadeUp}
                            custom={4}
                            className="mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto"
                        >
                            {stats.map(({ icon: Icon, label, value }) => (
                                <div key={label} className="text-center">
                                    <Icon
                                        className="mx-auto mb-2 text-primary-600 dark:text-primary-400"
                                        size={22}
                                    />
                                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                        {value}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                                        {label}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 sm:py-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-14 max-w-2xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                            Tout ce dont vous avez besoin
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            Une suite d'outils pensée pour la vie associative et
                            académique de l'école.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map(({ icon: Icon, title, description, color }, i) => (
                            <motion.div
                                key={title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                className="card hover:shadow-md hover:-translate-y-0.5 transition-all"
                            >
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${color} mb-4`}>
                                    <Icon size={22} />
                                </div>
                                <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-white">
                                    {title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="pb-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 p-10 sm:p-16 text-center shadow-xl">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white blur-3xl" />
                            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-white blur-3xl" />
                        </div>
                        <div className="relative">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                                Prêt à rejoindre la communauté ?
                            </h2>
                            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                                Créez votre compte avec votre adresse universitaire et
                                accédez à l'ensemble de la plateforme.
                            </p>
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-white text-primary-700 font-bold hover:bg-primary-50 transition-colors shadow-lg"
                            >
                                <UserPlus size={20} />
                                <span>Commencer maintenant</span>
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800 py-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Logo textColor="text-slate-800 dark:text-slate-100" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                        &copy; {new Date().getFullYear()} EniGov &middot; ENICarthage &middot; Université de Carthage
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
