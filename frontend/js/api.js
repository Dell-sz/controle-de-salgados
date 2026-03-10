class API {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
    }

    // Método principal com TODAS as proteções
    async request(endpoint, options = {}) {
        // Pega o token do localStorage
        const token = localStorage.getItem('token');
        
        // Se não tiver token e não for rota pública, redireciona
        if (!token && !endpoint.includes('/auth/')) {
            console.error('❌ Sem token de autenticação');
            window.location.href = 'index.html';
            throw new Error('Não autenticado');
        }

        // Monta os headers
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Adiciona o token se existir (CRÍTICO!)
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('🔑 Token enviado:', token.substring(0, 15) + '...');
        }

        const config = {
            ...options,
            headers,
            credentials: 'include'
        };

        try {
            console.log(`📡 Requisição: ${options.method || 'GET'} ${endpoint}`);
            
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            
            // Se não autorizado, token pode ter expirado
            if (response.status === 401) {
                console.warn('⏰ Token expirado');
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                window.location.href = 'index.html';
                throw new Error('Sessão expirada');
            }
            
            // Se não OK, tenta extrair erro
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.erro || `Erro ${response.status}`);
            }
            
            return response;
        } catch (error) {
            console.error('❌ Erro na requisição:', error.message);
            throw error;
        }
    }

    // Métodos auxiliares
    async get(endpoint) {
        const response = await this.request(endpoint);
        return response.json();
    }

    async post(endpoint, data) {
        const response = await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response.json();
    }

    async put(endpoint, data) {
        const response = await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return response.json();
    }

    async delete(endpoint) {
        const response = await this.request(endpoint, {
            method: 'DELETE'
        });
        return response.json();
    }
}

// Instância global
window.api = new API();
console.log('✅ API inicializada');

