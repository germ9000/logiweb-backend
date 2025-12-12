import { connectSheet } from "./sheet.js";

const SPREADSHEET_ID = process.env.SHEET_ID;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, senha } = req.body;
  const sheets = await connectSheet();

  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Users!A2:D", // A: Email, B: Senha, C: Nome, D: Role
    });

    const users = result.data.values || [];
    // Comparação simples (em produção, use hash/bcrypt para senhas)
    const user = users.find((u) => u[0] === email && u[1] === senha);

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    return res.status(200).json({
      ok: true,
      email: user[0],
      nome: user[2],
      role: user[3] || 'comum', // Retorna 'admin' ou 'comum'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
