import { connectSheet } from './sheet.js';

const SPREADSHEET_ID = process.env.SHEET_ID;

export async function handler(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const sheets = await connectSheet();

    // LISTAR MOVIMENTAÇÕES
    if (event.httpMethod === "GET") {
        try {
            const result = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: "Movements!A2:G",
            });

            const rows = result.data.values || [];
            const movements = rows
                .map((row, index) => ({
                    id: `mov-${index + 2}`,
                    data: row[0] || new Date().toISOString(),
                    tipo: row[1] || 'saida',
                    itemId: row[2] || '',
                    nomeItem: row[3] || '',
                    quantidade: parseInt(row[4]) || 0,
                    motivo: row[5] || '',
                    usuario: row[6] || 'Sistema'
                }))
                .sort((a, b) => new Date(b.data) - new Date(a.data));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(movements)
            };
        } catch (e) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: e.message })
            };
        }
    }

    // REGISTRAR NOVA MOVIMENTAÇÃO
    if (event.httpMethod === "POST") {
        try {
            const { tipo, itemId, nomeItem, quantidade, motivo, usuario } = JSON.parse(event.body || '{}');
            
            const movimento = [
                new Date().toISOString(),
                tipo,
                itemId,
                nomeItem,
                quantidade,
                motivo || (tipo === 'entrada' ? 'Entrada manual' : 'Saída manual'),
                usuario || 'Sistema'
            ];

            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: "Movements!A2",
                valueInputOption: "RAW",
                requestBody: {
                    values: [movimento],
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

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: "Method not allowed" })
    };
}
