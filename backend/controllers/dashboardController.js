const db = require('../config/database');

exports.getDashboard = async (req, res) => {
    try {
        const hoje = new Date().toISOString().split('T')[0];
        const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString().split('T')[0];
        
        // Produção do dia
        const producaoHoje = await db.query(
            `SELECT COALESCE(SUM(massa_produzida), 0) as massa,
                    COALESCE(SUM(recheio_produzido), 0) as recheio
             FROM producoes WHERE data = $1`,
            [hoje]
        );
        
        // Estoque atual
        const estoque = await db.query(
            `SELECT p.nome, e.quantidade, e.estoque_minimo,
                    CASE WHEN e.quantidade <= e.estoque_minimo THEN 'baixo' ELSE 'ok' END as status
             FROM estoque e
             JOIN produtos p ON p.id = e.produto_id
             WHERE p.ativo = true
             ORDER BY e.quantidade ASC`
        );
        
        // Faturamento hoje
        const faturamentoHoje = await db.query(
            `SELECT COALESCE(SUM(valor_total), 0) as total,
                    COALESCE(SUM(valor_pago), 0) as recebido,
                    COUNT(*) as vendas
             FROM saidas WHERE data = $1`,
            [hoje]
        );
        
        // Faturamento do mês
        const faturamentoMes = await db.query(
            `SELECT COALESCE(SUM(valor_total), 0) as total,
                    COALESCE(SUM(valor_pago), 0) as recebido
             FROM saidas WHERE data >= $1`,
            [inicioMes]
        );
        
        // Top produtos vendidos
        const topProdutos = await db.query(
            `SELECT p.nome, SUM(si.quantidade) as quantidade,
                    SUM(si.quantidade * si.valor_unitario) as faturamento
             FROM saida_itens si
             JOIN produtos p ON p.id = si.produto_id
             JOIN saidas s ON s.id = si.saida_id
             WHERE s.data >= $1
             GROUP BY p.id, p.nome
             ORDER BY faturamento DESC
             LIMIT 5`,
            [inicioMes]
        );
        
        // Total de produtos ativos
        const totalProdutos = await db.query(
            `SELECT COUNT(*) as total FROM produtos WHERE ativo = true`
        );
        
        // Vendas pendentes
        const pendentes = await db.query(
            `SELECT COALESCE(SUM(valor_total - valor_pago), 0) as total_pendente,
                    COUNT(*) as quantidade
             FROM saidas WHERE pago = false`
        );
        
        res.json({
            producaoHoje: producaoHoje.rows[0],
            estoque: estoque.rows,
            faturamentoHoje: faturamentoHoje.rows[0],
            faturamentoMes: faturamentoMes.rows[0],
            topProdutos: topProdutos.rows,
            totalProdutos: parseInt(totalProdutos.rows[0].total),
            pendentes: pendentes.rows[0]
        });
        
    } catch (error) {
        console.error('Erro no dashboard:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.getEstatisticasAvancadas = async (req, res) => {
    try {
        const { dias = 30 } = req.query;
        
        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - parseInt(dias));
        const dataInicioStr = dataInicio.toISOString().split('T')[0];
        const hoje = new Date().toISOString().split('T')[0];
        
        // Vendas por dia
        const vendasPorDia = await db.query(
            `SELECT data, SUM(valor_total) as total, COUNT(*) as quantidade
             FROM saidas
             WHERE data >= $1 AND data <= $2
             GROUP BY data
             ORDER BY data`,
            [dataInicioStr, hoje]
        );
        
        // Vendas por forma de pagamento
        const vendasPorForma = await db.query(
            `SELECT forma_pagamento, SUM(valor_total) as total, COUNT(*) as quantidade
             FROM saidas
             WHERE data >= $1 AND data <= $2 AND pago = true
             GROUP BY forma_pagamento`,
            [dataInicioStr, hoje]
        );
        
        // Valor do estoque
        const valorEstoque = await db.query(
            `SELECT SUM(e.quantidade * p.valor_unitario) as valor_total
             FROM estoque e
             JOIN produtos p ON p.id = e.produto_id
             WHERE p.ativo = true`
        );
        
        // Produção do período
        const producaoPeriodo = await db.query(
            `SELECT SUM(massa_produzida) as massa_total, SUM(recheio_produzido) as recheio_total
             FROM producoes
             WHERE data >= $1 AND data <= $2`,
            [dataInicioStr, hoje]
        );
        
        res.json({
            vendasPorDia: vendasPorDia.rows,
            vendasPorForma: vendasPorForma.rows,
            valorEstoque: parseFloat(valorEstoque.rows[0].valor_total || 0),
            producaoPeriodo: producaoPeriodo.rows[0]
        });
        
    } catch (error) {
        console.error('Erro nas estatísticas avançadas:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

