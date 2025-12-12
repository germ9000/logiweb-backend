// No seu bloco POST existente em api/items.js, adicione lógica para tipo de movimento
// Se o frontend enviar { action: 'saida', id: '...', qty: 5 }

if (req.method === "POST") {
    const body = req.body;

    // ROTA DE SAÍDA (ATUALIZAR ESTOQUE)
    if (body.action === 'saida') {
        // 1. Ler todos os itens para achar a linha correta
        const readResult = await sheets.spreadsheets.values.get({
             spreadsheetId: SPREADSHEET_ID,
             range: "Items!A2:G", 
        });
        const rows = readResult.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === body.id); // r[0] é o ID

        if (rowIndex === -1) return res.status(404).json({ error: "Item não encontrado" });

        const currentQty = parseInt(rows[rowIndex][3]); // Assumindo col 3 é Quantidade
        const outputQty = parseInt(body.quantidade);

        if (currentQty < outputQty) {
            return res.status(400).json({ error: "Estoque insuficiente" });
        }

        // 2. Atualizar a célula específica
        const newQty = currentQty - outputQty;
        // A planilha começa na linha 1, dados na 2. O array começa em 0.
        // Linha real = rowIndex + 2
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Items!D${rowIndex + 2}`, // Assumindo D é a coluna de Quantidade
            valueInputOption: "RAW",
            requestBody: { values: [[newQty]] }
        });

        return res.status(200).json({ ok: true, newQty });
    }

    // ... (Mantenha seu código de criar item novo aqui) ...
}
