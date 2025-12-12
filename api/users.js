import { connectSheet } from "./sheet.js";

const SPREADSHEET_ID = process.env.SHEET_ID;

export default async function handler(req, res) {
  const sheets = await connectSheet();

  // LISTAR USUÁRIOS
  if (req.method === "GET") {
    try {
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Users!A2:D",
      });

      const rows = result.data.values || [];
      
      // Transforma array simples em objetos
      const users = rows.map((row, index) => ({
        id: index + 2, // Linha na planilha
        email: row[0] || '',
        nome: row[2] || '',
        role: row[3] || 'comum'
      }));

      return res.status(200).json(users);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // CRIAR USUÁRIO
  if (req.method === "POST") {
    try {
      const { email, senha, nome, role } = req.body;
      
      if (!email || !senha || !nome) {
        return res.status(400).json({ error: "Email, senha e nome são obrigatórios" });
      }

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "Users!A2",
        valueInputOption: "RAW",
        requestBody: {
          values: [[email, senha, nome, role || "comum"]],
        },
      });

      return res.status(201).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // DELETAR USUÁRIO
  if (req.method === "DELETE") {
    try {
      const { linha } = req.body; // Linha na planilha
      
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `Users!A${linha}:D${linha}`,
      });

      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
