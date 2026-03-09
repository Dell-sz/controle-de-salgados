const API_URL = 'http://localhost:3000/api';

class Api {
    constructor() {
        this.token = localStorage.getItem('token');
    }
    
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }
    
    getToken() {
        return this.token;
    }
    
    getUsuario() {
        const usuario = localStorage.getItem('usuario');
        return usuario ? JSON.parse(usuario) : null;
    }
    
    setUsuario(usuario) {
        localStorage.setItem('usuario', JSON.stringify(usuario));
    }
    
    clearAuth() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        this.token = null;
    }
    
    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        const config = {
            ...options,
            headers,
            credentials: 'include'
        };
        
        try {
            const response = await fetch(`${API_URL}${endpoint}`, config);
            
            if (response.status === 401) {
                // Token expirado
                this.clearAuth();
                window.location.href = '/index.html';
                throw new Error('Sessão expirada');
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.erro || 'Erro na requisição');
            }
            
            return data;
            
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    get(endpoint) {
        return this.request(endpoint);
    }
    
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

const api = new Api();

