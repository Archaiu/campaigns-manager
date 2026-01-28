// Backend API URL - zmień na URL swojego backendu na Koyeb
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
console.log("Mój aktualny adres API to:", API_BASE_URL);

class ApiClient {
  constructor() {
    this.onTokenExpired = null;
  }

  setTokenExpiredHandler(handler) {
    this.onTokenExpired = handler;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (response.status === 401) {
        const data = await response.json();
        
        if (data.error === 'Token wygasł' || data.error === 'Nieprawidłowy token' || data.error === 'Brak tokenu') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          if (this.onTokenExpired) {
            this.onTokenExpired(data.error);
          }
          
          throw new Error(data.error);
        }
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Błąd serwera');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
