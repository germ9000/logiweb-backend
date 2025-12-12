// api/movements.js
import { connectSheet } from "./sheet.js";

const SPREADSHEET_ID = process.env.SHEET_ID;

export default async function handler(req, res) {
  const sheets = await connectSheet();

  // LISTAR MOVIMENTAÇÕES
  if (req.method === "GET") {
    try {
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Movements!A2:G", // Data, Tipo, Item, Nome, Qtd, Motivo, Usuário
      });

      const rows = result.data.values || [];
      
      // Ordenar por data (mais recente primeiro)
      const movements = rows
        .map((row, index) => ({
          id: `mov-${index + 2}`,
          data: row[0] || new Date().toISOString(),
          tipo: row[1] || 'saida',
          itemId: row[2] || '',
          nomeItem: row[3] || '',
          quantidade: parseInt(row[4]) || 0,
          motivo: row[5] || '',
          usuario: row[6] || 'Sistema'
        }))
        .sort((a, b) => new Date(b.data) - new Date(a.data));

      return res.status(200).json(movements);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // REGISTRAR NOVA MOVIMENTAÇÃO
  if (req.method === "POST") {
    try {
      const { tipo, itemId, nomeItem, quantidade, motivo, usuario } = req.body;
      
      const movimento = [
        new Date().toISOString(),
        tipo,
        itemId,
        nomeItem,
        quantidade,
        motivo || (tipo === 'entrada' ? 'Entrada manual' : 'Saída manual'),
        usuario || 'Sistema'
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "Movements!A2",
        valueInputOption: "RAW",
        requestBody: {
          values: [movimento],
        },
      });

      return res.status(201).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
