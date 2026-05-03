import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Send,
    Search,
    Check,
    CheckCheck,
    Loader2,
    MessageSquare,
    Plus
} from 'lucide-react';

const MessagingPage = () => {
    const { user } = useAuth();
    const isDelegue = user?.role === 'ROLE_DELEGUE';

    const [conversations, setConversations] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isStartingNew, setIsStartingNew] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        fetchContacts();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await api.get('/messages/conversations');
            setConversations(res.data);
            // Auto-select first conversation if none active
            if (!activeContact && res.data.length > 0) {
                const first = res.data[0];
                setActiveContact({ id: first.otherUserId, name: first.otherUserName });
                fetchHistory(first.otherUserId);
            }
        } catch {
            setConversations([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchContacts = async () => {
        try {
            const res = await api.get('/messages/contacts');
            setContacts(res.data);
        } catch {
            setContacts([]);
        }
    };

    const fetchHistory = async (userId) => {
        try {
            const res = await api.get(`/messages/history/${userId}`);
            setMessages(res.data);
        } catch {
            setMessages([]);
        }
    };

    const handleSelectContact = (contact) => {
        const id = contact.otherUserId || contact.id;
        const name = contact.otherUserName || contact.fullName || contact.name;
        setActiveContact({ id, name });
        fetchHistory(id);
        setIsStartingNew(false);
        setSearchQuery('');
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || !activeContact || sending) return;
        setSending(true);
        try {
            await api.post('/messages', {
                content: message,
                recipientId: activeContact.id
            });
            setMessage('');
            await fetchHistory(activeContact.id);
            fetchConversations();
        } catch (err) {
            alert(err.response?.data?.message || "Erreur lors de l'envoi");
        } finally {
            setSending(false);
        }
    };

    const isActive = (contactId) => activeContact?.id === contactId;

    return (
        <DashboardLayout title="Messagerie">
            <div className="h-[calc(100vh-160px)] flex gap-4 overflow-hidden">
                {/* Sidebar — Conversations */}
                <div className="w-80 card !p-0 flex flex-col overflow-hidden shrink-0">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 dark:text-white">Messages</h3>
                        <button
                            onClick={() => setIsStartingNew(!isStartingNew)}
                            className={`p-2 rounded-lg transition-all ${isStartingNew ? 'bg-primary-600 text-white' : 'text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'}`}
                            title="Nouveau message"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 text-xs py-2 pl-8 pr-3 rounded-lg border-none outline-none dark:text-slate-200"
                            />
                        </div>
                    </div>

                    {/* Contact list */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="py-12 flex justify-center">
                                <Loader2 size={20} className="animate-spin text-slate-400" />
                            </div>
                        ) : isStartingNew ? (
                            <div className="p-2">
                                <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contacts disponibles</p>
                                {contacts
                                    .filter(c => (c.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((c) => (
                                        <div
                                            key={c.id}
                                            onClick={() => handleSelectContact(c)}
                                            className="p-3 mx-1 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-all"
                                        >
                                            <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs uppercase">
                                                {(c.fullName || '?').charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-slate-800 dark:text-white">{c.fullName}</p>
                                                <p className="text-[10px] text-slate-400">{(c.role || '').replace('ROLE_', '')}</p>
                                            </div>
                                        </div>
                                    ))}
                                {contacts.filter(c => (c.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                    <p className="p-6 text-center text-xs text-slate-400">Aucun contact trouvé.</p>
                                )}
                            </div>
                        ) : conversations.length > 0 ? (
                            conversations
                                .filter(c => (c.otherUserName || '').toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((c) => (
                                    <div
                                        key={c.otherUserId}
                                        onClick={() => handleSelectContact(c)}
                                        className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-l-3 ${
                                            isActive(c.otherUserId)
                                                ? 'bg-primary-50/50 dark:bg-primary-900/10 border-l-4 border-primary-600'
                                                : 'border-l-4 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}
                                    >
                                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold uppercase shrink-0">
                                            {(c.otherUserName || '?').charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="font-semibold text-sm text-slate-800 dark:text-white truncate">{c.otherUserName}</span>
                                                <span className="text-[10px] text-slate-400 shrink-0">
                                                    {c.lastTimestamp ? new Date(c.lastTimestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-slate-500 truncate pr-2">{c.lastMessage}</p>
                                                {c.unreadCount > 0 && (
                                                    <span className="w-5 h-5 bg-primary-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0">
                                                        {c.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <div className="p-8 text-center">
                                <MessageSquare size={32} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                                <p className="text-sm text-slate-400 mb-2">Aucune conversation.</p>
                                <button
                                    onClick={() => setIsStartingNew(true)}
                                    className="text-xs font-semibold text-primary-600 hover:underline"
                                >
                                    Démarrer une discussion
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 card !p-0 flex flex-col overflow-hidden">
                    {!activeContact ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                            <MessageSquare size={48} className="mb-4 opacity-20" />
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Messagerie</h3>
                            <p className="text-sm max-w-xs">
                                {isDelegue
                                    ? 'Sélectionnez une conversation ou contactez un étudiant.'
                                    : 'Envoyez un message au délégué.'
                                }
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Chat header */}
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold uppercase">
                                    {(activeContact.name || '?').charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">{activeContact.name}</h4>
                                    <span className="text-[10px] text-slate-400">Conversation privée</span>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
                                {messages.length === 0 && (
                                    <p className="text-center text-xs text-slate-400 py-8">Aucun message. Commencez la discussion !</p>
                                )}
                                {messages.map((m) => {
                                    const isMine = m.senderId === user?.id;
                                    return (
                                        <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-3 rounded-2xl ${
                                                isMine
                                                    ? 'bg-primary-600 text-white rounded-tr-sm'
                                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm border border-slate-100 dark:border-slate-700'
                                            }`}>
                                                <p className="text-sm leading-relaxed">{m.content}</p>
                                                <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-primary-200' : 'text-slate-400'}`}>
                                                    <span className="text-[9px] font-medium">
                                                        {m.timestamp ? new Date(m.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
                                                    {isMine && (m.read ? <CheckCheck size={12} /> : <Check size={12} />)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                                    <input
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Écrivez votre message..."
                                        className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 px-2"
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || !message.trim()}
                                        className={`p-2.5 rounded-lg transition-all ${
                                            sending || !message.trim()
                                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                                : 'bg-primary-600 text-white hover:bg-primary-700'
                                        }`}
                                    >
                                        <Send size={16} className={sending ? 'animate-pulse' : ''} />
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MessagingPage;
