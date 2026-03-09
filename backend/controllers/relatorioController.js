const db = require('../config/database');

exports.getRelatorioVendas = async (req, res) => {
    const { data_inicio, data_fim, destino_id } = req.query;
    
    try {
        let query = `
            SELECT s.data, s.destino_id, d.nome as destino_nome, 
                   s.forma_pagamento, s.valor_total, s.valor_pago, s.pago
            FROM saidas s
            LEFT JOIN destinos d ON d.id = s.destino_id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 0;
        
        if (data_inicio) {
            paramCount++;
            query += ` AND s.data >= $${paramCount}`;
            params.push(data_inicio);
        }
        
        if (data_fim) {
            paramCount++;
            query += ` AND s.data <= $${paramCount}`;
            params.push(data_fim);
        }
        
        if (destino_id) {
            paramCount++;
            query += ` AND s.destino_id = $${paramCount}`;
            params.push(destino_id);
        }
        
        query += ` ORDER BY s.data DESC`;
        
        const result = await db.query(query, params);
        
        // Calcular totais
        const totalGeral = result.rows.reduce((acc, r) => acc + parseFloat(r.valor_total || 0), 0);
        const totalRecebido = result.rows.reduce((acc, r) => acc + parseFloat(r.valor_pago || 0), 0);
        
        res.json({
            vendas: result.rows,
            total_geral: totalGeral,
            total_recebido: totalRecebido,
            total_pendente: totalGeral - totalRecebido
        });
    } catch (error) {
        console.error('Erro no relatório de vendas:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.getRelatorioProducao = async (req, res) => {
    const { data_inicio, data_fim } = req.query;
    
    try {
        let query = `
            SELECT p.data, p.massa_produzida, p.recheio_produzido, 
                   p.sobra_massa, p.sobra_recheio, p.observacao,
                   u.nome as responsavel_nome
            FROM producoes p
            LEFT JOIN usuarios u ON u.id = p.responsavel_id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 0;
        
        if (data_inicio) {
            paramCount++;
            query += ` AND p.data >= $${paramCount}`;
            params.push(data_inicio);
        }
        
        if (data_fim) {
            paramCount++;
            query += ` AND p.data <= $${paramCount}`;
            params.push(data_fim);
        }
        
        query += ` ORDER BY p.data DESC`;
        
        const result = await db.query(query, params);
        
        // Calcular totais
        const totalMassa = result.rows.reduce((acc, r) => acc + parseFloat(r.massa_produzida || 0), 0);
        const totalRecheio = result.rows.reduce((acc, r) => acc + parseFloat(r.recheio_produzido || 0), 0);
        
        // Buscar itens de cada produção
        for (let producao of result.rows) {
            const itensResult = await db.query(
                `SELECT pi.quantidade, pr.nome as produto_nome
                 FROM producao_itens pi
                 JOIN produtos pr ON pr.id = pi.produto_id
                 WHERE pi.producao_id = $1`,
                [producao.id]
            );
            producao.itens = itensResult.rows;
        }
        
        res.json({
            producoes: result.rows,
            total_massas: totalMassa,
            total_recheios: totalRecheio
        });
    } catch (error) {
        console.error('Erro no relatório de produção:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.getRelatorioProdutos = async (req, res) => {
    const { data_inicio, data_fim } = req.query;
    
    try {
        let query = `
            SELECT pr.nome,
                   SUM(si.quantidade) as quantidade_vendida,
                   SUM(si.quantidade * si.valor_unitario) as total_vendido,
                   COUNT(DISTINCT s.id) as numero_vendas
            FROM saida_itens si
            JOIN produtos pr ON pr.id = si.produto_id
            JOIN saidas s ON s.id = si.saida_id
            WHERE s.pago = true
        `;
        
        const params = [];
        let paramCount = 0;
        
        if (data_inicio) {
            paramCount++;
            query += ` AND s.data >= $${paramCount}`;
            params.push(data_inicio);
        }
        
        if (data_fim) {
            paramCount++;
            query += ` AND s.data <= $${paramCount}`;
            params.push(data_fim);
        }
        
        query += ` GROUP BY pr.id, pr.nome ORDER BY total_vendido DESC`;
        
        const result = await db.query(query, params);
        
        const totalGeral = result.rows.reduce((acc, r) => acc + parseFloat(r.total_vendido || 0), 0);
        
        res.json({
            produtos: result.rows,
            total_geral: totalGeral
        });
    } catch (error) {
        console.error('Erro no relatório de produtos:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.getGraficoVendas = async (req, res) => {
    const { dias = 30 } = req.query;
    
    try {
        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - parseInt(dias));
        const dataInicioStr = dataInicio.toISOString().split('T')[0];
        const hoje = new Date().toISOString().split('T')[0];
        
        const result = await db.query(
            `SELECT data, SUM(valor_total) as total
             FROM saidas
             WHERE data >= $1 AND data <= $2
             GROUP BY data
             ORDER BY data`,
            [dataInicioStr, hoje]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Erro no gráfico de vendas:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

