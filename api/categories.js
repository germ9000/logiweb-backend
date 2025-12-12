// api/categories.js

import { connectSheet } from "./sheet.js";

const SPREADSHEET_ID = process.env.SHEET_ID;

export default async function handler(req, res) {
    const sheets = await connectSheet();

    // LISTAR CATEGORIAS
    if (req.method === "GET") {
        try {
            const result = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: "Categories!A2:C", // Nome, Descrição, Data
            });

            const rows = result.data.values || [];
            const categories = rows.map((row, index) => ({
                id: index + 2,
                nome: row[0] || "",
                descricao: row[1] || "",
                dataCriacao: row[2] || "",
            }));

            return res.status(200).json(categories);
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    // CRIAR CATEGORIA
    if (req.method === "POST") {
        try {
            const { nome, descricao } = req.body;

            if (!nome) {
                return res.status(400).json({ error: "Nome da categoria é obrigatório" });
            }

            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: "Categories!A2",
                valueInputOption: "RAW",
                requestBody: {
                    values: [[nome, descricao || "", new Date().toISOString()]],
                },
            });

            return res.status(201).json({ ok: true });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    // DELETAR CATEGORIA
    if (req.method === "DELETE") {
        try {
            const { linha } = req.body;

            await sheets.spreadsheets.values.clear({
                spreadsheetId: SPREADSHEET_ID,
                range: `Categories!A${linha}:C${linha}`,
            });

            return res.status(200).json({ ok: true });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
