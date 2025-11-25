// API Configuration
const API_BASE_URL = '';

// Get current user ID from localStorage
function getCurrentUserId() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        const userObj = JSON.parse(user);
        return userObj.userId || userObj.id || 1; // Fallback to 1 if not logged in
    }
    return 1; // Default to user 1 if not logged in
}

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const config = { ...defaultOptions, ...options };
    
    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// User API
const UserAPI = {
    getAll: () => apiCall('/api/users'),
    getById: (id) => apiCall(`/api/users/${id}`),
    create: (userData) => apiCall('/api/users', {
        method: 'POST',
        body: userData
    }),
    update: (id, userData) => apiCall(`/api/users/${id}`, {
        method: 'PUT',
        body: userData
    }),
    delete: (id) => apiCall(`/api/users/${id}`, {
        method: 'DELETE'
    })
};

// Profile API
const ProfileAPI = {
    getAll: () => apiCall('/api/profiles'),
    getById: (id) => apiCall(`/api/profiles/${id}`),
    create: (profileData) => apiCall('/api/profiles', {
        method: 'POST',
        body: profileData
    }),
    update: (id, profileData) => apiCall(`/api/profiles/${id}`, {
        method: 'PUT',
        body: profileData
    })
};

// Swipe API
const SwipeAPI = {
    getAll: () => apiCall('/api/swipes'),
    create: (swipeData) => apiCall('/api/swipes', {
        method: 'POST',
        body: swipeData
    }),
    getByUser: (userId) => apiCall(`/api/swipes/user/${userId}`)
};

// Match API
const MatchAPI = {
    getAll: () => apiCall('/api/matches'),
    getById: (id) => apiCall(`/api/matches/${id}`)
};

// Message API
const MessageAPI = {
    getAll: () => apiCall('/api/messages'),
    getByMatch: (matchId) => apiCall(`/api/messages/match/${matchId}`),
    create: (messageData) => apiCall('/api/messages', {
        method: 'POST',
        body: messageData
    })
};

// Skill API
const SkillAPI = {
    getAll: () => apiCall('/api/skills'),
    create: (skillData) => apiCall('/api/skills', {
        method: 'POST',
        body: skillData
    })
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UserAPI, ProfileAPI, SwipeAPI, MatchAPI, MessageAPI, SkillAPI };
}

