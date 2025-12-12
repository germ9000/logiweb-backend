// api/log-access.js

import { connectSheet } from "./sheet.js";

const SPREADSHEET_ID = process.env.SHEET_ID;

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { email, nome, role, action } = req.body;
        const sheets = await connectSheet();
        
        const logEntry = [
            new Date().toISOString(),
            email || 'Desconhecido',
            nome || 'Desconhecido',
            role || 'comum',
            action || 'login',
            req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Desconhecido',
            req.headers['user-agent'] || 'Desconhecido'
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "AccessLog!A2",
            valueInputOption: "RAW",
            requestBody: {
                values: [logEntry]
            }
        });

        return res.status(201).json({ ok: true });
    } catch (error) {
        console.error("Erro ao registrar acesso:", error);
        return res.status(500).json({ error: error.message });
    }
}
