//const API_BASE_URL = 'http://localhost:5000/api';

const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://eco-trackers1.onrender.com/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Carbon activities endpoints
  async addActivity(activityData) {
    return this.request('/carbon/activities', {
      method: 'POST',
      body: JSON.stringify(activityData)
    });
  }

  async getActivities(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/carbon/activities?${queryString}`);
  }

  async getStats(period = 'all') {
    return this.request(`/carbon/stats?period=${period}`);
  }

  async deleteActivity(activityId) {
    return this.request(`/carbon/activities/${activityId}`, {
      method: 'DELETE'
    });
  }

  async getEmissionFactors() {
    return this.request('/carbon/emission-factors');
  }

  // User and ranking endpoints
  async getLeaderboard(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users/leaderboard?${queryString}`);
  }

  async getUserRanking(userId, period = 'all-time') {
    return this.request(`/users/ranking/${userId}?period=${period}`);
  }

  async getCommunityStats() {
    return this.request('/users/community-stats');
  }

  async getUserAchievements(userId) {
    return this.request(`/users/achievements/${userId}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService(); 