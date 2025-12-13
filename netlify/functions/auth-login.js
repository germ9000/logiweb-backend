import { connectSheet } from './sheet.js';

const SPREADSHEET_ID = process.env.SHEET_ID;

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const { email, senha } = JSON.parse(event.body || '{}');
  const sheets = await connectSheet();

  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Users!A2:D",
    });

    const users = result.data.values || [];
    const user = users.find((u) => u[0] === email && u[1] === senha);

    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Credenciais inválidas" })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        email: user[0],
        nome: user[2],
        role: user[3] || 'comum',
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
