// Verificar autenticação
if (!checkAuth()) {
    // Redirecionado pelo checkAuth
}

// Mostrar nome do usuário - será configurado no HTML após auth.js carregar

let graficoVendas = null;
let graficoFormas = null;

// Carregar dados ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    carregarDashboard();
});

function showLoading() {
    document.getElementById('loadingSpinner').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.remove('active');
}

async function carregarDashboard() {
    showLoading();
    
    try {
        const data = await api.get('/dashboard');
        
        // Atualizar cards
        document.getElementById('massaHoje').textContent = `${parseFloat(data.producaoHoje.massa || 0).toFixed(2)} kg`;
        document.getElementById('recheioHoje').textContent = `${parseFloat(data.producaoHoje.recheio || 0).toFixed(2)} kg`;
        document.getElementById('vendasHoje').textContent = data.faturamentoHoje.vendas || 0;
        document.getElementById('faturamentoHoje').textContent = formatarMoeda(data.faturamentoHoje.total || 0);
        document.getElementById('faturamentoMes').textContent = formatarMoeda(data.faturamentoMes.total || 0);
        
        // Pendentes
        document.getElementById('qtdPendente').textContent = data.pendentes.quantidade || 0;
        document.getElementById('valorPendente').textContent = formatarMoeda(data.pendentes.total_pendente || 0);
        document.getElementById('totalProdutos').textContent = data.totalProdutos || 0;
        
        // Tabela de estoque
        const tbodyEstoque = document.getElementById('tabelaEstoque');
        if (data.estoque && data.estoque.length > 0) {
            const estoqueBaixo = data.estoque.filter(e => e.status === 'baixo');
            
            if (estoqueBaixo.length === 0) {
                tbodyEstoque.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center text-success py-4">
                            <i class="fas fa-check-circle me-2"></i>Estoque OK!
                        </td>
                    </tr>
                `;
            } else {
                tbodyEstoque.innerHTML = estoqueBaixo.map(item => `
                    <tr>
                        <td>${item.nome}</td>
                        <td>${item.quantidade}</td>
                        <td>${item.estoque_minimo}</td>
                        <td>
                            <span class="badge bg-warning">Baixo</span>
                        </td>
                    </tr>
                `).join('');
            }
        } else {
            tbodyEstoque.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                        Nenhum produto cadastrado
                    </td>
                </tr>
            `;
        }
        
        // Top produtos
        const topDiv = document.getElementById('topProdutos');
        if (data.topProdutos && data.topProdutos.length > 0) {
            topDiv.innerHTML = data.topProdutos.map(p => `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <span>${p.nome}</span>
                        <span class="badge bg-primary rounded-pill">${p.quantidade} un</span>
                    </div>
                    <small class="text-success">${formatarMoeda(p.faturamento || 0)}</small>
                </div>
            `).join('');
        } else {
            topDiv.innerHTML = `
                <div class="list-group-item text-center text-muted py-4">
                    Nenhuma venda no período
                </div>
            `;
        }
        
        // Carregar gráficos
        await carregarGraficos();
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        alert('Erro ao carregar dados: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function carregarGraficos() {
    try {
        // Gráfico de vendas
        const resGrafico = await api.get('/relatorios/grafico?dias=30');
        
        // Preparar dados para o gráfico
        const labels = resGrafico.map(d => formatarData(d.data));
        const valores = resGrafico.map(d => parseFloat(d.total || 0));
        
        // Gráfico de vendas (barras)
        const ctxVendas = document.getElementById('graficoVendas');
        if (graficoVendas) graficoVendas.destroy();
        
        graficoVendas = new Chart(ctxVendas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Faturamento R$',
                    data: valores,
                    backgroundColor: 'rgba(46, 125, 50, 0.8)',
                    borderColor: 'rgba(46, 125, 50, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$' + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
        
        // Gráfico de formas de pagamento (estatísticas)
        const resEstatisticas = await api.get('/dashboard/estatisticas?dias=30');
        
        if (resEstatisticas.vendasPorForma && resEstatisticas.vendasPorForma.length > 0) {
            const ctxFormas = document.getElementById('graficoFormas');
            if (graficoFormas) graficoFormas.destroy();
            
            const formasLabels = resEstatisticas.vendasPorForma.map(f => {
                const nomes = {
                    'dinheiro': 'Dinheiro',
                    'cartao_credito': 'Crédito',
                    'cartao_debito': 'Débito',
                    'pix': 'PIX'
                };
                return nomes[f.forma_pagamento] || f.forma_pagamento;
            });
            
            const formasData = resEstatisticas.vendasPorForma.map(f => parseFloat(f.total || 0));
            
            graficoFormas = new Chart(ctxFormas, {
                type: 'doughnut',
                data: {
                    labels: formasLabels,
                    datasets: [{
                        data: formasData,
                        backgroundColor: ['#2e7d32', '#1976d2', '#f57c00', '#9c27b0'],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
        
    } catch (error) {
        console.error('Erro ao carregar gráficos:', error);
    }
}

function formatarMoeda(valor) {
    return 'R$ ' + parseFloat(valor || 0).toFixed(2).replace('.', ',');
}

function formatarData(dataStr) {
    if (!dataStr) return '';
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

