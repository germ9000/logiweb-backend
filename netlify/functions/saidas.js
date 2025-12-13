import { connectSheet } from './sheet.js';

const SPREADSHEET_ID = process.env.SHEET_ID;

export async function handler(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod === "POST") {
        const sheets = await connectSheet();
        const body = JSON.parse(event.body || '{}');

        try {
            // 1. Ler todos os itens
            const readResult = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: "Items!A2:G",
            });

            const rows = readResult.data.values || [];
            const rowIndex = rows.findIndex(r => r[0] === body.id);

            if (rowIndex === -1) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: "Item não encontrado" })
                };
            }

            const currentQty = parseInt(rows[rowIndex][3]) || 0;
            const outputQty = parseInt(body.quantidade) || 0;

            // Validações
            if (isNaN(outputQty) || outputQty <= 0) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "Quantidade inválida" })
                };
            }

            if (currentQty < outputQty) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ 
                        error: `Estoque insuficiente. Disponível: ${currentQty}` 
                    })
                };
            }

            // 2. Atualizar estoque
            const newQty = currentQty - outputQty;
            
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `Items!D${rowIndex + 2}`,
                valueInputOption: "RAW",
                requestBody: { values: [[newQty]] }
            });

            // 3. Registrar movimentação
            const movimento = [
                new Date().toISOString(),
                'saida',
                body.id,
                rows[rowIndex][1] || body.nome,
                outputQty,
                body.motivo || 'Saída manual',
                body.usuario || 'Usuário'
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
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    ok: true, 
                    newQty,
                    message: "Saída registrada com sucesso!"
                })
            };

        } catch (error) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: error.message })
            };
        }
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: "Method not allowed" })
    };
}
