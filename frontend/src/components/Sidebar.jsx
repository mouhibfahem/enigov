import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    LayoutDashboard,
    Megaphone,
    BarChart2,
    Gavel,
    Scale,
    ClipboardList,
    Settings,
    LogOut,
    Mail,
    CalendarDays,
    Users
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const isDelegue = user?.role === 'ROLE_DELEGUE';

    const studentMenuGroups = [
        {
            title: 'GÉNÉRAL',
            items: [
                { icon: Home, label: 'Accueil', path: '/' }
            ]
        },
        {
            title: 'COMMUNICATION',
            items: [
                { icon: Megaphone, label: 'Annonces', path: '/announcements' },
                { icon: BarChart2, label: 'Sondages', path: '/polls' },
                { icon: Mail, label: 'Messagerie', path: '/messaging' }
            ]
        },
        {
            title: 'RÉCLAMATIONS',
            items: [
                { icon: Gavel, label: 'Réclamations', path: '/complaints' }
            ]
        },
        {
            title: 'INSTITUTIONNEL',
            items: [
                { icon: ClipboardList, label: 'Décisions', path: '/decisions' },
                { icon: Scale, label: 'Règlements et documents', path: '/regulations' },
                { icon: CalendarDays, label: 'Événements', path: '/events' }
            ]
        },
        {
            title: 'OUTILS',
            items: [
                { icon: Settings, label: 'Paramètres', path: '/settings' }
            ]
        }
    ];

    const delegueMenuGroups = [
        {
            title: 'GÉNÉRAL',
            items: [
                { icon: LayoutDashboard, label: 'Tableau de bord', path: '/' }
            ]
        },
        {
            title: 'GESTION',
            items: [
                { icon: Gavel, label: 'Réclamations', path: '/complaints' },
                { icon: Megaphone, label: 'Annonces', path: '/announcements' },
                { icon: BarChart2, label: 'Sondages', path: '/polls' },
                { icon: ClipboardList, label: 'Décisions', path: '/decisions' }
            ]
        },
        {
            title: 'COMMUNAUTÉ',
            items: [
                { icon: Users, label: 'Étudiants', path: '/students' },
                { icon: Mail, label: 'Messagerie', path: '/messaging' }
            ]
        },
        {
            title: 'INSTITUTIONNEL',
            items: [
                { icon: Scale, label: 'Règlements et documents', path: '/regulations' },
                { icon: CalendarDays, label: 'Événements', path: '/events' }
            ]
        },
        {
            title: 'OUTILS',
            items: [
                { icon: Settings, label: 'Paramètres', path: '/settings' }
            ]
        }
    ];

    const menuGroups = isDelegue ? delegueMenuGroups : studentMenuGroups;

    return (
        <aside className="w-72 bg-white dark:bg-[#1a1c2e] border-r border-slate-100 dark:border-slate-800 flex flex-col h-screen sticky top-0 transition-colors duration-300">
            <div className="p-8">
                <Logo textColor="text-slate-800 dark:text-slate-100" />
            </div>

            {isDelegue && (
                <div className="mx-4 mb-4 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800/30">
                    <p className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-wider text-center">
                        Espace Délégué
                    </p>
                </div>
            )}

            <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar">
                {menuGroups.map((group, idx) => (
                    <div key={idx} className="mb-6 last:mb-0">
                        <h3 className="px-4 mb-3 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
                            {group.title}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition-all group ${isActive
                                            ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 border-l-4 border-primary-600'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary-600 dark:hover:text-primary-400'
                                            }`}
                                    >
                                        <item.icon size={18} className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 group-hover:text-primary-600 transition-colors'} />
                                        <span className="text-[14px]">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 mt-auto space-y-4">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-all text-sm"
                >
                    <LogOut size={18} />
                    <span>Déconnexion</span>
                </button>

                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">
                        © 2026 EniGov Platform
                    </p>
                    <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 text-center mt-1">
                        École Nationale d'Ingénieurs de Carthage
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
