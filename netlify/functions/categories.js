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

    // LISTAR CATEGORIAS
    if (event.httpMethod === "GET") {
        try {
            const result = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: "Categories!A2:C",
            });

            const rows = result.data.values || [];
            const categories = rows.map((row, index) => ({
                id: index + 2,
                nome: row[0] || "",
                descricao: row[1] || "",
                dataCriacao: row[2] || "",
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(categories)
            };
        } catch (e) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: e.message })
            };
        }
    }

    // CRIAR CATEGORIA
    if (event.httpMethod === "POST") {
        try {
            const { nome, descricao } = JSON.parse(event.body || '{}');

            if (!nome) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "Nome da categoria é obrigatório" })
                };
            }

            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: "Categories!A2",
                valueInputOption: "RAW",
                requestBody: {
                    values: [[nome, descricao || "", new Date().toISOString()]],
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

    // DELETAR CATEGORIA
    if (event.httpMethod === "DELETE") {
        try {
            const { linha } = JSON.parse(event.body || '{}');

            await sheets.spreadsheets.values.clear({
                spreadsheetId: SPREADSHEET_ID,
                range: `Categories!A${linha}:C${linha}`,
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
