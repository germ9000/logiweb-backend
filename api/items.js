import { connectSheet } from "./sheet.js";

const SPREADSHEET_ID = process.env.SHEET_ID;

export default async function handler(req, res) {
  const sheets = await connectSheet();

  // GET: Listar Itens
  if (req.method === "GET") {
    try {
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Items!A2:G",
      });
      return res.status(200).json(result.data.values || []);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // POST: Movimentação (Entrada ou Saída)
  if (req.method === "POST") {
    const { action, id, nome, categoria, quantidade, local, status, motivo } = req.body;
    const qty = parseInt(quantidade);
    const dataHora = new Date().toLocaleString("pt-BR");

    try {
      // 1. Ler Estoque Atual
      const readResult = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Items!A2:G",
      });
      const rows = readResult.data.values || [];
      const rowIndex = rows.findIndex((r) => r[0] === id);

      // LÓGICA DE ATUALIZAÇÃO
      if (action === "saida") {
        if (rowIndex === -1) return res.status(404).json({ error: "Item não encontrado" });
        
        const currentQty = parseInt(rows[rowIndex][3] || 0);
        if (currentQty < qty) return res.status(400).json({ error: "Estoque insuficiente" });

        // Atualiza Quantidade
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Items!D${rowIndex + 2}`,
          valueInputOption: "RAW",
          requestBody: { values: [[currentQty - qty]] },
        });

      } else if (action === "entrada") {
        if (rowIndex !== -1) {
          // Item existe: Soma estoque
          const currentQty = parseInt(rows[rowIndex][3] || 0);
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Items!D${rowIndex + 2}`,
            valueInputOption: "RAW",
            requestBody: { values: [[currentQty + qty]] },
          });
        } else {
          // Item novo: Cria linha
          await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "Items!A2",
            valueInputOption: "RAW",
            requestBody: { values: [[id, nome, categoria, qty, local, status, dataHora]] },
          });
        }
      }

      // 2. REGISTRAR NO HISTÓRICO (Aba Movements)
      // Colunas: Tipo | ItemID | Quantidade | Data | Usuario | Motivo
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "Movements!A2",
        valueInputOption: "RAW",
        requestBody: {
          values: [[action.toUpperCase(), id, qty, dataHora, "Admin", motivo || "-"]],
        },
      });

      return res.status(200).json({ ok: true });

    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
}
