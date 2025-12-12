import { connectSheet } from "./sheet";

const SPREADSHEET_ID = process.env.SHEET_ID;

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { email, senha } = req.body;

  const sheets = await connectSheet();

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Users!A2:C"
  });

  const users = result.data.values || [];

  const user = users.find(u => u[0] === email && u[1] === senha);

  if (!user) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  return res.status(200).json({
    ok: true,
    nome: user[2] || "Usuário"
  });
}
