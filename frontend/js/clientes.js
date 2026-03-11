// frontend/js/clientes.js

let modalCliente;
let clienteParaExcluir = null;

document.addEventListener('DOMContentLoaded', function () {
  checkAuth();
  inicializarModal();
  carregarCategorias();
  carregarClientes();
});

function inicializarModal() {
  modalCliente = new bootstrap.Modal(document.getElementById('modalCliente'));

  // Máscaras
  document.getElementById('telefone').addEventListener('input', function (e) {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length <= 10) {
      valor = valor.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    e.target.value = valor;
  });

  document.getElementById('cpf_cnpj').addEventListener('input', function (e) {
    let valor = e.target.value.replace(/\D/g, '');
    const tipo = document.getElementById('tipo_pessoa').value;

    if (tipo === 'fisica') {
      if (valor.length > 11) valor = valor.substring(0, 11);
      valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      if (valor.length > 14) valor = valor.substring(0, 14);
      valor = valor.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    e.target.value = valor;
  });

  // Troca formato CPF/CNPJ ao mudar tipo de pessoa
  document.getElementById('tipo_pessoa').addEventListener('change', function () {
    document.getElementById('cpf_cnpj').value = '';
  });
}

async function carregarCategorias() {
  try {
    const categorias = await api.get('/destinos/categorias');
    const select = document.getElementById('categoria_id');

    categorias.forEach(cat => {
      select.innerHTML += `<option value="${cat.id}">${cat.nome}</option>`;
    });
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
}

async function carregarClientes() {
  try {
    const clientes = await api.get('/destinos');
    console.log('Clientes carregados:', clientes);

    const tbody = document.getElementById('clientes-list');

    if (!clientes || clientes.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <i class="bi bi-info-circle"></i> Nenhum cliente cadastrado
                    </td>
                </tr>
            `;
      return;
    }

    tbody.innerHTML = clientes.map(cliente => `
            <tr>
                <td>${cliente.id}</td>
                <td>${cliente.nome || '--'}</td>
                <td>${cliente.telefone || '--'}</td>
                <td>${cliente.email || '--'}</td>
                <td>
                    <span class="badge" style="background-color: ${cliente.categoria_cor || '#6c757d'}">
                        ${cliente.categoria_nome || '--'}
                    </span>
                </td>
                <td>${cliente.cpf_cnpj || '--'}</td>
                <td>
                    <span class="badge ${cliente.ativo ? 'bg-success' : 'bg-danger'}">
                        ${cliente.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="editarCliente(${cliente.id})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmarExclusao(${cliente.id})" title="Excluir">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
    alert('Erro ao carregar clientes: ' + error.message);
  }
}

function novoCliente() {
  document.getElementById('modal-titulo').textContent = 'Novo Cliente';
  document.getElementById('form-cliente').reset();
  document.getElementById('cliente-id').value = '';
  modalCliente.show();
}

async function editarCliente(id) {
  try {
    const cliente = await api.get(`/destinos/${id}`);

    document.getElementById('modal-titulo').textContent = 'Editar Cliente';
    document.getElementById('cliente-id').value = cliente.id;
    document.getElementById('nome').value = cliente.nome || '';
    document.getElementById('categoria_id').value = cliente.categoria_id || '';
    document.getElementById('tipo_pessoa').value = cliente.tipo_pessoa || 'fisica';
    document.getElementById('cpf_cnpj').value = cliente.cpf_cnpj || '';
    document.getElementById('telefone').value = cliente.telefone || '';
    document.getElementById('email').value = cliente.email || '';
    document.getElementById('endereco').value = cliente.endereco || '';
    document.getElementById('contato').value = cliente.contato || '';
    document.getElementById('observacao').value = cliente.observacao || '';

    modalCliente.show();

  } catch (error) {
    console.error('Erro ao carregar cliente:', error);
    alert('Erro ao carregar cliente: ' + error.message);
  }
}

async function salvarCliente() {
  try {
    const dados = {
      nome: document.getElementById('nome').value,
      categoria_id: parseInt(document.getElementById('categoria_id').value) || null,
      tipo_pessoa: document.getElementById('tipo_pessoa').value,
      cpf_cnpj: document.getElementById('cpf_cnpj').value.replace(/\D/g, '') || null,
      telefone: document.getElementById('telefone').value,
      email: document.getElementById('email').value || null,
      endereco: document.getElementById('endereco').value || null,
      contato: document.getElementById('contato').value || null,
      observacao: document.getElementById('observacao').value || null,
      ativo: 1
    };

    // Validações
    if (!dados.nome) {
      alert('Nome é obrigatório');
      return;
    }
    if (!dados.telefone) {
      alert('Telefone é obrigatório');
      return;
    }

    const id = document.getElementById('cliente-id').value;

    if (id) {
      await api.put(`/destinos/${id}`, dados);
      alert('Cliente atualizado com sucesso!');
    } else {
      await api.post('/destinos', dados);
      alert('Cliente cadastrado com sucesso!');
    }

    modalCliente.hide();
    carregarClientes();

  } catch (error) {
    console.error('Erro ao salvar cliente:', error);
    alert('Erro ao salvar cliente: ' + error.message);
  }
}

function confirmarExclusao(id) {
  clienteParaExcluir = id;
  const modal = new bootstrap.Modal(document.getElementById('modalConfirmar'));
  modal.show();
}

document.getElementById('confirmar-exclusao').addEventListener('click', async function () {
  if (!clienteParaExcluir) return;

  try {
    await api.delete(`/destinos/${clienteParaExcluir}`);
    alert('Cliente excluído com sucesso!');
    bootstrap.Modal.getInstance(document.getElementById('modalConfirmar')).hide();
    carregarClientes();
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    alert('Erro ao excluir cliente: ' + error.message);
  } finally {
    clienteParaExcluir = null;
  }
});

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}

