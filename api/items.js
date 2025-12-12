// Função para registrar movimentação
async function registrarMovimentacao(sheets, dados) {
  try {
    const movimento = [
      new Date().toISOString(),
      dados.tipo,
      dados.id,
      dados.nome,
      dados.quantidade,
      dados.motivo || (dados.tipo === 'entrada' ? 'Entrada manual' : 'Saída manual'),
      dados.usuario || 'Sistema'
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Movements!A2",
      valueInputOption: "RAW",
      requestBody: {
        values: [movimento],
      },
    });
  } catch (error) {
    console.error("Erro ao registrar movimentação:", error);
  }
}
// No trecho de saída, após atualizar a quantidade
await registrarMovimentacao(sheets, {
  tipo: 'saida',
  id: body.id,
  nome: rows[rowIndex][1], // Nome do item
  quantidade: outputQty,
  motivo: body.motivo || 'Venda',
  usuario: 'Usuário atual' // Você pode pegar do localStorage
});
// No trecho de entrada
await registrarMovimentacao(sheets, {
  tipo: 'entrada',
  id: body.id,
  nome: body.nome,
  quantidade: body.quantidade,
  motivo: 'Entrada manual',
  usuario: 'Usuário atual'
});
