# Lista de Correções - Projeto Controle de Salgados

## Status: Concluído

### Frontend HTML - Acessibilidade

- [x] 1. clientes.html - Adicionar aria-label no navbar-toggler e btn-close ✓
- [x] 2. vendas.html - Adicionar aria-labels e placeholders descritivos ✓
- [x] 3. dashboard.html - Adicionar aria-label no navbar-toggler ✓
- [x] 4. produtos.html - Adicionar aria-label no navbar-toggler e verificar inputs ✓
- [x] 5. producao.html - Adicionar aria-label no navbar-toggler e verificar inputs ✓
- [x] 6. relatorios.html - Adicionar aria-label e atributos em inputs ✓

### Backend Next.js (salgados-app)

- [x] 7. tsconfig.json - Atualizar target para es2020 e adicionar forceConsistentCasingInFileNames ✓
- [x] 8. Verificar Tailwind CSS - Configuração correta (erros são falsos positivos do VSCode)

---

## Correções Realizadas

### Frontend HTML

- **clientes.html**: Adicionado `aria-label="Abrir menu de navegação"` no navbar-toggler e `aria-label="Fechar"` nos botões btn-close
- **dashboard.html**: Adicionado `aria-label="Abrir menu de navegação"` no navbar-toggler
- **produtos.html**: Adicionado `aria-label` no navbar-toggler, btn-close e todos os inputs do formulário
- **producao.html**: Adicionado `aria-label` no navbar-toggler e todos os inputs/selects do formulário
- **relatorios.html**: Adicionado `aria-label` no navbar-toggler, selects e inputs dos filtros
- **vendas.html**: Adicionado `aria-label` no navbar-toggler, filtros e btn-close do modal

### Backend Next.js

- **tsconfig.json**:
  - Alterado `"target": "es5"` para `"target": "es2020"`
  - Adicionado `"ignoreDeprecations": "6.0"`
  - Adicionado `"forceConsistentCasingInFileNames": true`

### Observações

- Os erros de Tailwind CSS em globals.css são falsos positivos do VSCode - as diretivas @tailwind são processadas corretamente pelo PostCSS em tempo de build
- Os estilos inline em relatorios.html foram mantidos pois são necessários para os gradientes específicos de cada card (não impacta a funcionalidade)
