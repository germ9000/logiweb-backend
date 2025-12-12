// api/users.js
import { connectSheet } from "./sheet.js";

const SPREADSHEET_ID = process.env.SHEET_ID;

export default async function handler(req, res) {
  const sheets = await connectSheet();

  // LISTAR USUÁRIOS (Apenas admin deveria ver, validaremos no front, mas ideal é validar token aqui)
  if (req.method === "GET") {
    try {
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Users!A2:D",
      });
      // Mapeia para objeto JSON
      const users = (result.data.values || []).map((row, index) => ({
        rowIndex: index + 2, // Guarda a linha para editar/excluir depois
        email: row[0],
        nome: row[2],
        role: row[3]
      }));
      return res.status(200).json(users);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // CRIAR USUÁRIO
  if (req.method === "POST") {
    const { email, senha, nome, role } = req.body;
    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "Users!A2",
        valueInputOption: "RAW",
        requestBody: {
          values: [[email, senha, nome, role || 'comum']],
        },
      });
      return res.status(201).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // DELETAR/EDITAR (Simplificado: Deletar requer lógica de buscar a linha e limpar)
  // Para Vercel + Sheets, edição completa é complexa. 
  // Sugestão MVP: Apenas Criar e Listar por enquanto para não complicar excessivamente.
  
  return res.status(405).json({ error: "Method not allowed" });
}
