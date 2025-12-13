import { connectSheet } from './sheet.js';

const SPREADSHEET_ID = process.env.SHEET_ID;

export async function handler(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const sheets = await connectSheet();

    // LISTAR USUÁRIOS
    if (event.httpMethod === "GET") {
        try {
            const result = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: "Users!A2:D",
            });

            const rows = result.data.values || [];
            const users = rows.map((row, index) => ({
                id: index + 2,
                email: row[0] || '',
                nome: row[2] || '',
                role: row[3] || 'comum'
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(users)
            };
        } catch (e) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: e.message })
            };
        }
    }

    // CRIAR USUÁRIO
    if (event.httpMethod === "POST") {
        try {
            const { email, senha, nome, role } = JSON.parse(event.body || '{}');
            
            if (!email || !senha || !nome) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "Email, senha e nome são obrigatórios" })
                };
            }

            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: "Users!A2",
                valueInputOption: "RAW",
                requestBody: {
                    values: [[email, senha, nome, role || "comum"]],
                },
            });

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({ ok: true })
            };
        } catch (e) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: e.message })
            };
        }
    }

    // DELETAR USUÁRIO
    if (event.httpMethod === "DELETE") {
        try {
            const { linha } = JSON.parse(event.body || '{}');
            
            await sheets.spreadsheets.values.clear({
                spreadsheetId: SPREADSHEET_ID,
                range: `Users!A${linha}:D${linha}`,
            });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ ok: true })
            };
        } catch (e) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: e.message })
            };
        }
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: "Method not allowed" })
    };
}
