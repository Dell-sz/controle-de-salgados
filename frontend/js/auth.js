// Verificar autenticação ao carregar
document.addEventListener('DOMContentLoaded', () => {
    // Se já estiver logado, redirecionar para dashboard
    if (api.getToken() && window.location.pathname.includes('index.html')) {
        window.location.href = 'dashboard.html';
    }
    
    // Configurar formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const mensagemDiv = document.getElementById('mensagem');
    
    // Mostrar feedback visual
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Entrando...';
    
    try {
        const data = await api.post('/auth/login', { email, senha });
        api.setToken(data.token);
        api.setUsuario(data.usuario);
        
        // Redirecionar baseado no tipo de usuário
        if (data.usuario.tipo === 'admin') {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'dashboard.html';
        }
        
    } catch (error) {
        // Mostrar erro
        mensagemDiv.classList.remove('d-none', 'alert-success');
        mensagemDiv.classList.add('alert-danger');
        mensagemDiv.textContent = error.message || 'Erro ao fazer login';
        
        // Limpar senha
        document.getElementById('senha').value = '';
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function logout() {
    api.clearAuth();
    window.location.href = 'index.html';
}

function getUsuarioNome() {
    const usuario = api.getUsuario();
    return usuario ? usuario.nome : 'Usuário';
}

function getUsuarioTipo() {
    const usuario = api.getUsuario();
    return usuario ? usuario.tipo : 'operador';
}

