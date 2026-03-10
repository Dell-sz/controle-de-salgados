// Configuração
const API_URL = 'http://localhost:3000/api';

// Login
async function login(event) {
    if (event) event.preventDefault();
    
    const email = document.getElementById('email')?.value;
    const senha = document.getElementById('senha')?.value;
    
    if (!email || !senha) {
        alert('Preencha email e senha');
        return;
    }
    
    try {
        console.log('🔄 Tentando login...');
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.erro || 'Erro no login');
        }
        
        if (data.token) {
            // Salva token e usuário
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            console.log('✅ Login bem-sucedido!');
            console.log('👤 Usuário:', data.usuario.nome);
            console.log('🔑 Token:', data.token.substring(0, 20) + '...');
            
            // Redireciona
            window.location.href = 'dashboard.html';
        } else {
            throw new Error('Resposta inválida do servidor');
        }
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        alert('Erro ao fazer login: ' + error.message);
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}

// Verifica autenticação
function checkAuth() {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname.split('/').pop();
    
    // Páginas que não precisam de autenticação
    const publicPages = ['index.html', 'login.html'];
    
    if (!token && !publicPages.includes(currentPage)) {
        console.warn('⚠️ Sem token, redirecionando para login');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Executa verificação em todas as páginas
document.addEventListener('DOMContentLoaded', checkAuth);

// Expõe funções globalmente
window.login = login;
window.logout = logout;

