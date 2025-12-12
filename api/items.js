import { connectSheet } from "./sheet.js";

export const config = {
  api: {
    bodyParser: true,
  },
};

const SPREADSHEET_ID = process.env.SHEET_ID;

export default async function handler(req, res) {
  try {
    const sheets = await connectSheet();

    if (req.method === "GET") {
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Items!A2:G",
      });

      const rows = result.data.values || [];
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const body = req.body;

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "Items!A2",
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              body.id,
              body.nome,
              body.categoria,
              body.quantidade,
              body.local,
              body.status,
              body.previsao,
            ],
          ],
        },
      });

      return res.status(201).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
