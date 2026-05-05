import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import {
    Users,
    Search,
    Filter,
    Mail,
    GraduationCap,
    ChevronDown,
    X,
    UserCircle2,
    ArrowUpDown,
    Download,
    Laptop,
    Cpu,
    Settings,
    Factory
} from 'lucide-react';
import api from '../services/api';

const FILIERE_CONFIG = {
    INFO: { label: 'Informatique', icon: Laptop, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dotColor: 'bg-blue-500' },
    INFOTRO: { label: 'Infotronique', icon: Cpu, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dotColor: 'bg-emerald-500' },
    MECA: { label: 'Mécatronique', icon: Settings, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', dotColor: 'bg-orange-500' },
    GSIL: { label: 'GSIL', icon: Factory, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', dotColor: 'bg-purple-500' }
};

const PROMOTION_CONFIG = {
    PREMIERE_ANNEE: { label: '1ère année', short: '1A', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
    DEUXIEME_ANNEE: { label: '2ème année', short: '2A', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
    TROISIEME_ANNEE: { label: '3ème année', short: '3A', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' }
};

const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
};

const AVATAR_COLORS = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-purple-500 to-pink-600',
    'from-sky-500 to-cyan-600',
    'from-amber-500 to-yellow-600',
    'from-rose-500 to-pink-600',
    'from-violet-500 to-purple-600',
];

const getAvatarColor = (name) => {
    if (!name) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const StudentAvatar = ({ student, size = 'md' }) => {
    const sizeClasses = size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';

    if (student.profilePhoto) {
        return (
            <img
                src={student.profilePhoto}
                alt={student.fullName || student.username}
                className={`${sizeClasses} rounded-full object-cover ring-2 ring-white dark:ring-slate-700 shadow-sm`}
            />
        );
    }

    const initials = getInitials(student.fullName || student.username);
    const gradient = getAvatarColor(student.fullName || student.username);

    return (
        <div className={`${sizeClasses} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white ring-2 ring-white dark:ring-slate-700 shadow-sm`}>
            {initials}
        </div>
    );
};

const FilterDropdown = ({ label, icon: Icon, value, onChange, options, onClear }) => {
    const [open, setOpen] = useState(false);
    const selectedOption = options.find(o => o.value === value);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    value
                        ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-700 dark:text-primary-400'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
                }`}
            >
                <Icon size={16} />
                <span>{selectedOption ? selectedOption.label : label}</span>
                {value ? (
                    <X
                        size={14}
                        className="ml-1 hover:text-red-500 cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); onClear(); setOpen(false); }}
                    />
                ) : (
                    <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                        <div className="absolute top-full left-0 mt-2 z-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl py-1 min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
                        {options.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${
                                    opt.value === value
                                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                }`}
                            >
                                {opt.icon && <opt.icon size={16} className="opacity-70" />}
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const StudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filiereFilter, setFiliereFilter] = useState('');
    const [promotionFilter, setPromotionFilter] = useState('');
    const [sortField, setSortField] = useState('fullName');
    const [sortAsc, setSortAsc] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await api.getStudents();
                setStudents(res.data || []);
            } catch (err) {
                console.error('Error fetching students:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filteredStudents = useMemo(() => {
        let result = [...students];

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s =>
                (s.fullName || '').toLowerCase().includes(q) ||
                (s.username || '').toLowerCase().includes(q) ||
                (s.email || '').toLowerCase().includes(q)
            );
        }

        // Filiere filter
        if (filiereFilter) {
            result = result.filter(s => s.filiere === filiereFilter);
        }

        // Promotion filter
        if (promotionFilter) {
            result = result.filter(s => s.promotion === promotionFilter);
        }

        // Sorting
        result.sort((a, b) => {
            const aVal = (a[sortField] || '').toLowerCase();
            const bVal = (b[sortField] || '').toLowerCase();
            if (aVal < bVal) return sortAsc ? -1 : 1;
            if (aVal > bVal) return sortAsc ? 1 : -1;
            return 0;
        });

        return result;
    }, [students, searchQuery, filiereFilter, promotionFilter, sortField, sortAsc]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortAsc(!sortAsc);
        } else {
            setSortField(field);
            setSortAsc(true);
        }
    };

    const exportCSV = () => {
        const headers = ['Nom complet', 'Username', 'Email', 'Filière', 'Promotion'];
        const rows = filteredStudents.map(s => [
            s.fullName || '',
            s.username || '',
            s.email || '',
            FILIERE_CONFIG[s.filiere]?.label || s.filiere || '',
            PROMOTION_CONFIG[s.promotion]?.label || s.promotion || ''
        ]);

        const csvContent = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `etudiants_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // Stats summary
    const activeFilters = [filiereFilter, promotionFilter, searchQuery].filter(Boolean).length > 0;
    const filiereCounts = useMemo(() => {
        const counts = {};
        students.forEach(s => {
            if (s.filiere) counts[s.filiere] = (counts[s.filiere] || 0) + 1;
        });
        return counts;
    }, [students]);

    const filiereOptions = Object.entries(FILIERE_CONFIG).map(([key, config]) => ({
        value: key,
        label: config.label,
        icon: config.icon
    }));

    const promotionOptions = Object.entries(PROMOTION_CONFIG).map(([key, config]) => ({
        value: key,
        label: `${config.short} — ${config.label}`
    }));

    return (
        <DashboardLayout title="Étudiants">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header + Stats */}
                <div className="card !p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 flex items-center justify-center">
                                <Users size={22} className="text-sky-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-white">Liste des Étudiants</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    {loading ? 'Chargement...' : (
                                        activeFilters
                                            ? `${filteredStudents.length} résultat${filteredStudents.length > 1 ? 's' : ''} sur ${students.length} étudiants`
                                            : `${students.length} étudiant${students.length > 1 ? 's' : ''} inscrit${students.length > 1 ? 's' : ''}`
                                    )}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-sm transition-colors"
                            title="Exporter en CSV"
                        >
                            <Download size={16} />
                            Exporter CSV
                        </button>
                    </div>

                    {/* Mini stat cards */}
                    {!loading && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                            {Object.entries(FILIERE_CONFIG).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => setFiliereFilter(filiereFilter === key ? '' : key)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                        filiereFilter === key
                                            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600 scale-[1.02]'
                                            : 'border-transparent bg-slate-50 dark:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700'
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg mb-1 ${filiereFilter === key ? 'text-primary-600' : 'text-slate-400'}`}>
                                        <config.icon size={20} />
                                    </div>
                                    <div className="text-xl font-black text-slate-800 dark:text-white">{filiereCounts[key] || 0}</div>
                                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">{config.label}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Search + Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, username ou email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 text-sm font-medium transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <FilterDropdown
                        label="Filière"
                        icon={GraduationCap}
                        value={filiereFilter}
                        onChange={setFiliereFilter}
                        onClear={() => setFiliereFilter('')}
                        options={filiereOptions}
                    />

                    <FilterDropdown
                        label="Promotion"
                        icon={Filter}
                        value={promotionFilter}
                        onChange={setPromotionFilter}
                        onClear={() => setPromotionFilter('')}
                        options={promotionOptions}
                    />
                </div>

                {/* Students Table */}
                <div className="card !p-0 overflow-hidden">
                    {/* Table Header */}
                    <div className="hidden sm:grid grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <div className="w-10"></div>
                        <button onClick={() => handleSort('fullName')} className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-left">
                            Nom complet
                            <ArrowUpDown size={12} className={sortField === 'fullName' ? 'text-primary-500' : 'opacity-40'} />
                        </button>
                        <button onClick={() => handleSort('email')} className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-left">
                            Email
                            <ArrowUpDown size={12} className={sortField === 'email' ? 'text-primary-500' : 'opacity-40'} />
                        </button>
                        <div className="w-28 text-center">Filière</div>
                        <div className="w-20 text-center">Promo</div>
                        <div className="w-10"></div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <div className="p-5 space-y-3">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-40 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                                            <div className="h-3 w-56 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                                        </div>
                                        <div className="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                                        <div className="h-6 w-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="p-12 text-center">
                                <UserCircle2 size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                    {activeFilters ? 'Aucun étudiant ne correspond aux filtres' : 'Aucun étudiant inscrit'}
                                </p>
                                {activeFilters && (
                                    <button
                                        onClick={() => { setSearchQuery(''); setFiliereFilter(''); setPromotionFilter(''); }}
                                        className="mt-3 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
                                    >
                                        Réinitialiser les filtres
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredStudents.map((student, idx) => {
                                const filiereInfo = FILIERE_CONFIG[student.filiere];
                                const promoInfo = PROMOTION_CONFIG[student.promotion];

                                return (
                                    <div
                                        key={student.id}
                                        className="group px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200"
                                        style={{ animationDelay: `${idx * 30}ms` }}
                                    >
                                        {/* Desktop layout */}
                                        <div className="hidden sm:grid grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-4 items-center">
                                            <StudentAvatar student={student} />

                                            <div className="min-w-0">
                                                <p className="font-bold text-sm text-slate-800 dark:text-white truncate">
                                                    {student.fullName || student.username}
                                                </p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">@{student.username}</p>
                                            </div>

                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate font-medium">
                                                {student.email}
                                            </p>

                                            <div className="w-28">
                                                {filiereInfo ? (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${filiereInfo.color}`}>
                                                        <filiereInfo.icon size={12} />
                                                        {filiereInfo.label}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </div>

                                            <div className="w-20 text-center">
                                                {promoInfo ? (
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${promoInfo.color}`}>
                                                        {promoInfo.short}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </div>

                                            <Link
                                                to={`/messaging`}
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-all opacity-0 group-hover:opacity-100"
                                                title="Envoyer un message"
                                            >
                                                <Mail size={16} />
                                            </Link>
                                        </div>

                                        {/* Mobile layout */}
                                        <div className="sm:hidden flex items-start gap-3">
                                            <StudentAvatar student={student} />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold text-sm text-slate-800 dark:text-white">
                                                        {student.fullName || student.username}
                                                    </p>
                                                    {promoInfo && (
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${promoInfo.color}`}>
                                                            {promoInfo.short}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">@{student.username}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{student.email}</p>
                                                {filiereInfo && (
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold mt-2 ${filiereInfo.color}`}>
                                                        <filiereInfo.icon size={10} />
                                                        {filiereInfo.label}
                                                    </span>
                                                )}
                                            </div>
                                            <Link
                                                to={`/messaging`}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                                title="Envoyer un message"
                                            >
                                                <Mail size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer count */}
                    {!loading && filteredStudents.length > 0 && (
                        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 text-center">
                            {filteredStudents.length} étudiant{filteredStudents.length > 1 ? 's' : ''} affiché{filteredStudents.length > 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentsPage;
