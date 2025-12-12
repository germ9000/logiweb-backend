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
