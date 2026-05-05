import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
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
    Globe,
    Shield,
    Zap,
    MapPin,
    Phone,
    Mail,
    Facebook,
    Linkedin,
    Users,
    Crown
} from 'lucide-react';
import Logo from '../components/Logo';

const features = [
    {
        icon: Megaphone,
        title: 'Annonces',
        description: 'Communication instantanée de la délégation et de l\'administration.',
        size: 'col-span-1 md:col-span-2 row-span-1',
        color: 'from-blue-600/20 to-cyan-500/10'
    },
    {
        icon: Gavel,
        title: 'Réclamations',
        description: 'Soumettez et suivez vos requêtes en temps réel.',
        size: 'col-span-1 row-span-1',
        color: 'from-indigo-600/20 to-purple-500/10'
    },
    {
        icon: BarChart2,
        title: 'Sondages',
        description: 'Participez aux décisions importantes de la vie étudiante.',
        size: 'col-span-1 row-span-1',
        color: 'from-emerald-600/20 to-teal-500/10'
    },
    {
        icon: MessageSquare,
        title: 'Messagerie',
        description: 'Échanges directs et sécurisés entre étudiants et délégués.',
        size: 'col-span-1 md:col-span-2 row-span-1',
        color: 'from-purple-600/20 to-pink-500/10'
    },
    {
        icon: CalendarDays,
        title: 'Agenda',
        description: 'Ne manquez aucun événement, examen ou réunion.',
        size: 'col-span-1 row-span-1',
        color: 'from-orange-600/20 to-yellow-500/10'
    },
    {
        icon: BookOpen,
        title: 'Documents',
        description: 'Accès rapide aux règlements et ressources officielles.',
        size: 'col-span-1 md:col-span-2 row-span-1',
        color: 'from-rose-600/20 to-pink-500/10'
    }
];

const LandingPage = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-primary-500 selection:text-white overflow-x-hidden font-sans">

            {/* Dark Studio Background with Transparent Hero Photo */}
            <div className="fixed inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay grayscale"
                    style={{
                        backgroundImage: 'url(/hero-bg.jpg)',
                        maskImage: 'radial-gradient(circle at center, black 0%, transparent 80%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 80%)'
                    }}
                />
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary-900/10 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
            </div>

            {/* Premium Navigation */}
            <header className="fixed top-0 left-0 right-0 z-50 p-4 sm:p-6">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="max-w-7xl mx-auto flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl"
                >
                    <Logo textColor="text-white" />

                    <nav className="hidden md:flex items-center gap-8">
                        <button onClick={() => scrollToSection('services')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors tracking-widest uppercase cursor-pointer">
                            Services
                        </button>
                        <button onClick={() => scrollToSection('gouvernance')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors tracking-widest uppercase cursor-pointer">
                            Gouvernance
                        </button>
                        <button onClick={() => scrollToSection('contact')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors tracking-widest uppercase cursor-pointer">
                            Contact
                        </button>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-black text-slate-300 hover:text-white transition-colors">
                            CONNEXION
                        </Link>
                        <Link to="/register" className="relative group overflow-hidden px-6 py-2.5 rounded-xl font-black text-sm tracking-tighter transition-all">
                            <span className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 group-hover:scale-110 transition-transform duration-500" />
                            <span className="relative z-10">S'INSCRIRE</span>
                        </Link>
                    </div>
                </motion.div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-44 pb-32 z-10 flex flex-col items-center min-h-[90vh] justify-center">
                <motion.div style={{ y: y1, opacity: opacityHero }} className="text-center px-4 max-w-5xl">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 mb-10 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    >
                        <Crown className="text-yellow-500" size={16} />
                        <span className="text-xs font-black tracking-[0.3em] uppercase text-slate-300">
                            The New Standard of Governance
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter leading-[0.9] mb-10"
                    >
                        ENI<span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-400 via-indigo-500 to-purple-600 animate-gradient-x">GOV</span>.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl sm:text-2xl text-slate-400 font-medium max-w-2xl mx-auto mb-16 leading-relaxed"
                    >
                        Une plateforme d'élite conçue pour l'excellence académique et la transparence totale à l'ENICarthage.
                    </motion.p>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <Link
                            to="/register"
                            className="group relative px-12 py-6 rounded-2xl bg-white text-black font-black text-xl overflow-hidden hover:scale-105 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                        >
                            <span className="relative z-10 flex items-center gap-3 font-black">
                                DÉCOUVRIR <ArrowRight size={24} strokeWidth={3} />
                            </span>
                        </Link>

                        <div className="flex items-center gap-6 px-8 py-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="flex -space-x-4">
                                {['student-1.jpg', 'student-2.jpg', 'student-3.jpg'].map((img, i) => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-[#020617] overflow-hidden shadow-xl bg-slate-800">
                                        <img src={`/${img}`} alt="student" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-black text-white">+200 Ingénieurs</div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inscrits cette année</div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section - Bento Grid Style */}
            <section id="services" className="py-40 relative z-10 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-20">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-[2px] w-12 bg-primary-500" />
                            <span className="text-sm font-black tracking-widest text-primary-500 uppercase">Nos Outils</span>
                        </div>
                        <h2 className="text-5xl sm:text-6xl font-black tracking-tighter">Conçu pour la performance.</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className={`group relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm p-10 flex flex-col justify-between ${f.size} hover:border-white/20 transition-all`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                                        <f.icon size={28} className="text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-2 tracking-tight">{f.title}</h3>
                                    <p className="text-slate-400 font-medium text-sm">{f.description}</p>
                                </div>
                                <div className="relative z-10 flex justify-end">
                                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                        <Zap size={18} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section - Representing Governance */}
            <section id="gouvernance" className="py-32 border-y border-white/5 bg-white/[0.01] relative z-10">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-16 text-center">
                    {[
                        { label: 'Établissement', value: 'ENICarthage', icon: Globe },
                        { label: 'Engagement', value: '100% Digital', icon: Zap },
                        { label: 'Gouvernance', value: 'Transparence', icon: Shield }
                    ].map((s, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <s.icon className="text-primary-500 mb-6" size={32} />
                            <div className="text-5xl font-black tracking-tighter mb-2 text-white">
                                {s.value}
                            </div>
                            <div className="text-xs font-black tracking-[0.3em] text-slate-500 uppercase">
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact & Administration Section */}
            <section id="contact" className="py-40 relative z-10 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        {/* School Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="space-y-12"
                        >
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-[2px] w-12 bg-primary-500" />
                                    <span className="text-sm font-black tracking-widest text-primary-500 uppercase">Nous Contacter</span>
                                </div>
                                <h2 className="text-5xl font-black tracking-tighter mb-6">Local Principal.</h2>
                                <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                                    L'ENICarthage est un établissement d'enseignement supérieur public, relevant de l'Université de Carthage, dédié à l'excellence technologique.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <MapPin className="text-primary-500" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Adresse</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed">
                                            45 Rue des Entrepreneurs<br />
                                            2035 Charguia II Tunis- Carthage-Tunisie
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <Phone className="text-primary-500" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Téléphone</h4>
                                        <p className="text-slate-400 text-sm">
                                            (+216) 71 941 579 / 71 940 699
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <Mail className="text-primary-500" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Email Officiel</h4>
                                        <p className="text-slate-400 text-sm">
                                            contact.enicarthage@enicar.ucar.tn
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Buttons */}
                            <div className="flex gap-4 pt-4">
                                <a href="https://www.facebook.com/ENICarthage.Tunisie" target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary-500 transition-all text-slate-400 hover:text-white">
                                    <Facebook size={24} />
                                </a>
                                <a href="https://www.linkedin.com/school/enicarthage/" target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary-500 transition-all text-slate-400 hover:text-white">
                                    <Linkedin size={24} />
                                </a>
                                <a href="http://www.enicarthage.rnu.tn/" target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary-500 transition-all text-slate-400 hover:text-white">
                                    <Globe size={24} />
                                </a>
                            </div>
                        </motion.div>

                        {/* Administration Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 md:p-12 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Users size={120} />
                            </div>
                            
                            <h3 className="text-3xl font-black mb-10 tracking-tight flex items-center gap-3">
                                <Users className="text-primary-500" size={28} /> Administration
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { role: 'Directrice', name: 'Houda BEN ATTIA SETHOM', email: 'houda.benattia@enicar.ucar.tn' },
                                    { role: 'Directrice des Études', name: 'Imen Kammoun', email: 'imen.kammoun@enicar.ucar.tn' },
                                    { role: 'Directeur des Stages', name: 'Faouzi Jaidi', email: 'faouzi.jaidi@enicar.ucar.tn' },
                                    { role: 'Directeur du Dép. Génie Électrique', name: 'Lotfi Bouslimi', email: 'lotfi.bouslimi@enicar.ucar.tn' },
                                    { role: 'Directeur du Dép. Informatique', name: 'Houcem Hermassi', email: 'houcem.hermassi@enicar.ucar.tn' },
                                    { role: 'Directeur du Dép. Génie Industriel', name: 'Basma Askri', email: 'basma.askri@enicar.ucar.tn' }
                                ].map((admin, idx) => (
                                    <div key={idx} className="group">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary-500 mb-1">{admin.role}</p>
                                        <h5 className="font-bold text-white mb-1 group-hover:text-primary-400 transition-colors">{admin.name}</h5>
                                        <a href={`mailto:${admin.email}`} className="text-xs text-slate-500 hover:text-white transition-colors truncate block">
                                            {admin.email}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="pt-40 pb-20 px-4 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center text-center">
                        <Logo textColor="text-white" />
                        <h2 className="text-5xl sm:text-7xl font-black tracking-tighter mt-12 mb-12">
                            L'avenir est entre <br /> vos mains.
                        </h2>
                        <Link
                            to="/register"
                            className="px-16 py-8 rounded-[2rem] bg-primary-600 text-white font-black text-2xl hover:bg-primary-700 transition-all shadow-[0_0_50px_rgba(79,70,229,0.3)]"
                        >
                            REJOINDRE UNIGOV
                        </Link>
                    </div>

                    <div className="mt-40 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex gap-8 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
                            <a href="http://www.enicarthage.rnu.tn/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Site Officiel</a>
                            <a href="#" className="hover:text-white transition-colors">Academic Rules</a>
                            <a href="mailto:contact.enicarthage@enicar.ucar.tn" className="hover:text-white transition-colors">Support</a>
                        </div>
                        <div className="text-[10px] font-black tracking-[0.2em] text-slate-600 uppercase text-center md:text-right">
                            © {new Date().getFullYear()} École Nationale d'Ingénieurs de Carthage<br />
                            <span className="text-slate-700">Developed for Excellence</span>
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes gradient-x {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-x 5s ease infinite;
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
