import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
});

// Request interceptor — add JWT token (must be registered BEFORE response interceptor)
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

// Response interceptor — error logging
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (import.meta.env.DEV) {
            console.error('API Error:', {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response?.status,
                data: error.response?.data,
            });
        }
        return Promise.reject(error);
    }
);

// Auth & User
api.updateProfile = (data) => api.put('/users/profile', data);
api.uploadPhoto = (formData) => api.post('/users/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
api.changePassword = (data) => api.put('/users/password', data);
api.getCurrentUser = () => api.get('/users/me');

// Messaging
api.getConversations = () => api.get('/messages/conversations');
api.getConversationHistory = (userId) => api.get(`/messages/history/${userId}`);
api.sendMessage = (data) => api.post('/messages', data);
api.getContacts = () => api.get('/messages/contacts');

// Agenda / Events
api.getUpcomingEvents = () => api.get('/events/upcoming');
api.createEvent = (data) => api.post('/events', data);

// Decisions
api.getAllDecisions = () => api.get('/decisions');
api.createDecision = (data) => api.post('/decisions', data);
api.deleteDecision = (id) => api.delete(`/decisions/${id}`);

// Announcements
api.getAnnouncements = () => api.get('/announcements');
api.createAnnouncement = (formData) => api.post('/announcements', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// Polls
api.getPolls = () => api.get('/polls');
api.createPoll = (data) => api.post('/polls', data);
api.vote = (pollId, data) => api.post(`/polls/${pollId}/vote`, data);

// Notifications
api.getNotifications = () => api.get('/notifications');
api.getUnreadCount = () => api.get('/notifications/unread-count');
api.markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
api.markAllNotificationsRead = () => api.put('/notifications/read-all');

// Stats (Delegate)
api.getDashboardStats = () => api.get('/stats');
api.getStudents = () => api.get('/users/students');

export default api;

