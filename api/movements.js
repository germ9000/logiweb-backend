import { connectSheet } from "./sheet.js";

const SPREADSHEET_ID = process.env.SHEET_ID;

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const sheets = await connectSheet();
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Movements!A2:F", // Lê o histórico
    });

    // Inverte para mostrar os mais recentes primeiro e pega os últimos 10
    const rows = (result.data.values || []).reverse().slice(0, 10);
    return res.status(200).json(rows);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
