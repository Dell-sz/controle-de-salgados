// frontend/js/relatorios-completo.js

// Variáveis globais dos gráficos
let graficoVendas, graficoPagamentos, graficoProdutos, graficoClientes;

document.addEventListener('DOMContentLoaded', function () {
  verificarAutenticacao();
  carregarClientes();
  definirDatasPadrao();
  aplicarFiltros();
});

function verificarAutenticacao() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  document.getElementById('usuario-info').textContent = usuario.nome || '';
}

function definirDatasPadrao() {
  const hoje = new Date();
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(hoje.getDate() - 7);

  document.getElementById('data_inicio').value = formatarDataInput(seteDiasAtras);
  document.getElementById('data_fim').value = formatarDataInput(hoje);
}

function formatarDataInput(data) {
  return data.toISOString().split('T')[0];
}

function atualizarDatasPorPeriodo() {
  const periodo = document.getElementById('periodo').value;
  const hoje = new Date();
  let dataInicio = new Date();

  switch (periodo) {
    case 'hoje':
      dataInicio = hoje;
      break;
    case 'ontem':
      dataInicio = new Date(hoje);
      dataInicio.setDate(hoje.getDate() - 1);
      break;
    case 'semana':
      dataInicio.setDate(hoje.getDate() - 7);
      break;
    case 'mes':
      dataInicio.setDate(hoje.getDate() - 30);
      break;
    case 'mes_atual':
      dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      break;
    case 'mes_anterior':
      dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
      hoje.setTime(ultimoDia.getTime());
      break;
    case 'personalizado':
      return;
  }

  if (periodo !== 'personalizado') {
    document.getElementById('data_inicio').value = formatarDataInput(dataInicio);
    document.getElementById('data_fim').value = formatarDataInput(hoje);
  }
}

async function carregarClientes() {
  try {
    const clientes = await api.get('/destinos');
    const select = document.getElementById('cliente');

    clientes.forEach(cliente => {
      const option = document.createElement('option');
      option.value = cliente.id;
      option.textContent = cliente.nome;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
  }
}

async function aplicarFiltros() {
  try {
    const filtros = {
      data_inicio: document.getElementById('data_inicio').value,
      data_fim: document.getElementById('data_fim').value,
      destino_id: document.getElementById('cliente').value,
      forma_pagamento: document.getElementById('forma_pagamento').value
    };

    document.getElementById('tabela-vendas').innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                </td>
            </tr>
        `;

    const vendas = await api.get(`/relatorios/vendas?data_inicio=${filtros.data_inicio}&data_fim=${filtros.data_fim}${filtros.destino_id ? '&destino_id=' + filtros.destino_id : ''}`);
    const producao = await api.get(`/relatorios/producao?data_inicio=${filtros.data_inicio}&data_fim=${filtros.data_fim}`);

    const vendasFiltradas = filtrarVendas(vendas.vendas, filtros);

    atualizarCards(vendasFiltradas, producao);
    atualizarTabela(vendasFiltradas);
    atualizarGraficos(vendasFiltradas, producao);

  } catch (error) {
    console.error('Erro ao aplicar filtros:', error);
    document.getElementById('tabela-vendas').innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">
                    Erro ao carregar dados: ${error.message}
                </td>
            </tr>
        `;
  }
}

function filtrarVendas(vendas, filtros) {
  if (!vendas) return [];

  return vendas.filter(v => {
    if (filtros.forma_pagamento && v.forma_pagamento !== filtros.forma_pagamento) {
      return false;
    }
    return true;
  });
}

function atualizarCards(vendas, producao) {
  const totalVendas = vendas.reduce((sum, v) => sum + (parseFloat(v.valor_total) || 0), 0);
  document.getElementById('total-vendas').textContent = formatarMoeda(totalVendas);

  let totalProdutos = 0;
  vendas.forEach(v => {
    if (v.itens && v.itens.length > 0) {
      v.itens.forEach(item => {
        totalProdutos += parseInt(item.quantidade) || 0;
      });
    }
  });
  document.getElementById('total-produtos').textContent = totalProdutos;

  const producoes = producao.producoes || [];
  let totalProduzido = 0;
  producoes.forEach(p => {
    if (p.itens && p.itens.length > 0) {
      p.itens.forEach(item => {
        totalProduzido += parseInt(item.quantidade) || 0;
      });
    }
  });
  document.getElementById('total-producao').textContent = totalProduzido;

  const clientesUnicos = new Set(vendas.map(v => v.destino_id).filter(id => id)).size;
  document.getElementById('total-clientes').textContent = clientesUnicos;
}

function atualizarTabela(vendas) {
  const tbody = document.getElementById('tabela-vendas');

  if (!vendas || vendas.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">
                    Nenhuma venda encontrada no período
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = vendas.map(venda => `
        <tr>
            <td>${formatarData(venda.data)}</td>
            <td>${venda.destino_nome || '--'}</td>
            <td>${venda.forma_pagamento || '--'}</td>
            <td>${venda.quantidade || 0}</td>
            <td>${formatarMoeda(venda.valor_unitario || 0)}</td>
            <td>${formatarMoeda(venda.valor_total || 0)}</td>
            <td>${venda.forma_pagamento || '--'}</td>
            <td>
                <span class="badge ${venda.pago ? 'bg-success' : 'bg-warning'}">
                    ${venda.pago ? 'Pago' : 'Pendente'}
                </span>
            </td>
        </tr>
    `).join('');
}

function atualizarGraficos(vendas, producao) {
  const vendasPorDia = agruparVendasPorDia(vendas);
  criarGraficoVendas(vendasPorDia);

  const pagamentos = agruparPorFormaPagamento(vendas);
  criarGraficoPagamentos(pagamentos);

  const produtos = agruparProdutosMaisVendidos(vendas);
  criarGraficoProdutos(produtos);

  const clientes = agruparClientesQueMaisCompram(vendas);
  criarGraficoClientes(clientes);
}

function agruparVendasPorDia(vendas) {
  const grupos = {};

  vendas.forEach(v => {
    const dia = v.data ? v.data.split('T')[0] : '';
    if (!dia) return;
    if (!grupos[dia]) {
      grupos[dia] = 0;
    }
    grupos[dia] += parseFloat(v.valor_total) || 0;
  });

  const datas = Object.keys(grupos).sort();

  return {
    labels: datas.map(d => formatarDataCurta(d)),
    valores: datas.map(d => grupos[d])
  };
}

function agruparPorFormaPagamento(vendas) {
  const grupos = {};

  vendas.forEach(v => {
    const forma = v.forma_pagamento || 'Não informado';
    if (!grupos[forma]) {
      grupos[forma] = 0;
    }
    grupos[forma] += parseFloat(v.valor_total) || 0;
  });

  return {
    labels: Object.keys(grupos),
    valores: Object.values(grupos)
  };
}

function agruparProdutosMaisVendidos(vendas) {
  const grupos = {};

  vendas.forEach(v => {
    let produto = 'Produto não identificado';
    let qtd = 0;

    if (v.itens && v.itens.length > 0) {
      v.itens.forEach(item => {
        produto = item.produto_nome || 'Produto não identificado';
        qtd = parseInt(item.quantidade) || 0;

        if (!grupos[produto]) {
          grupos[produto] = 0;
        }
        grupos[produto] += qtd;
      });
    }
  });

  const top5 = Object.entries(grupos)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    labels: top5.map(item => item[0]),
    valores: top5.map(item => item[1])
  };
}

function agruparClientesQueMaisCompram(vendas) {
  const grupos = {};

  vendas.forEach(v => {
    if (!v.destino_id) return;
    const cliente = v.destino_nome || `Cliente ${v.destino_id}`;
    if (!grupos[cliente]) {
      grupos[cliente] = 0;
    }
    grupos[cliente] += parseFloat(v.valor_total) || 0;
  });

  const top5 = Object.entries(grupos)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    labels: top5.map(item => item[0]),
    valores: top5.map(item => item[1])
  };
}

function criarGraficoVendas(dados) {
  const ctx = document.getElementById('graficoVendas').getContext('2d');

  if (graficoVendas) {
    graficoVendas.destroy();
  }

  graficoVendas = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dados.labels,
      datasets: [{
        label: 'Vendas (R$)',
        data: dados.valores,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return 'R$ ' + value.toFixed(2);
            }
          }
        }
      }
    }
  });
}

function criarGraficoPagamentos(dados) {
  const ctx = document.getElementById('graficoPagamentos').getContext('2d');

  if (graficoPagamentos) {
    graficoPagamentos.destroy();
  }

  const cores = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)'
  ];

  graficoPagamentos = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: dados.labels,
      datasets: [{
        data: dados.valores,
        backgroundColor: cores,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.label || '';
              let value = context.raw || 0;
              return `${label}: R$ ${value.toFixed(2)}`;
            }
          }
        }
      }
    }
  });
}

function criarGraficoProdutos(dados) {
  const ctx = document.getElementById('graficoProdutos').getContext('2d');

  if (graficoProdutos) {
    graficoProdutos.destroy();
  }

  graficoProdutos = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dados.labels,
      datasets: [{
        label: 'Quantidade Vendida',
        data: dados.valores,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

function criarGraficoClientes(dados) {
  const ctx = document.getElementById('graficoClientes').getContext('2d');

  if (graficoClientes) {
    graficoClientes.destroy();
  }

  graficoClientes = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dados.labels,
      datasets: [{
        label: 'Total Comprado (R$)',
        data: dados.valores,
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return 'R$ ' + context.raw.toFixed(2);
            }
          }
        }
      }
    }
  });
}

function formatarMoeda(valor) {
  return 'R$ ' + (parseFloat(valor) || 0).toFixed(2).replace('.', ',');
}

function formatarData(dataString) {
  if (!dataString) return '--';
  const data = new Date(dataString + 'T12:00:00');
  return data.toLocaleDateString('pt-BR');
}

function formatarDataCurta(dataString) {
  if (!dataString) return '--';
  const data = new Date(dataString + 'T12:00:00');
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}

