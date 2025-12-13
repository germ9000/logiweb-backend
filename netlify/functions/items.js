import { connectSheet } from './sheet.js';

const SPREADSHEET_ID = process.env.SHEET_ID;

async function verificarItemExistente(sheets, id, codigoBarras = '') {
    try {
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "Items!A2:H",
        });

        const rows = result.data.values || [];
        const porId = rows.findIndex(row => row[0] === id);
        const porCodigo = codigoBarras ? 
            rows.findIndex(row => row[7] && row[7] === codigoBarras) : -1;
        
        return {
            existe: porId !== -1 || porCodigo !== -1,
            linhaId: porId,
            linhaCodigo: porCodigo,
            item: porId !== -1 ? rows[porId] : (porCodigo !== -1 ? rows[porCodigo] : null)
        };
    } catch (error) {
        console.error("Erro ao verificar item:", error);
        return { existe: false, linhaId: -1, linhaCodigo: -1, item: null };
    }
}

async function registrarMovimentacao(sheets, dados) {
  try {
    const movimento = [
      new Date().toISOString(),
      dados.tipo,
      dados.id,
      dados.nome,
      dados.quantidade,
      dados.motivo || (dados.tipo === 'entrada' ? 'Entrada manual' : 'Saída manual'),
      dados.usuario || 'Sistema'
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Movements!A2",
      valueInputOption: "RAW",
      requestBody: {
        values: [movimento],
      },
    });
  } catch (error) {
    console.error("Erro ao registrar movimentação:", error);
  }
}

export async function handler(event, context) {
  // GET - Listar itens
  if (event.httpMethod === "GET") {
    try {
      const sheets = await connectSheet();
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Items!A2:G",
      });
      
      const items = result.data.values || [];
      return {
        statusCode: 200,
        body: JSON.stringify(items)
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }
  }

  // POST - Entrada/Saída
  if (event.httpMethod === "POST") {
    const sheets = await connectSheet();
    const body = JSON.parse(event.body || '{}');

    // SAÍDA
    if (body.action === 'saida') {
      try {
        const readResult = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: "Items!A2:G",
        });

        const rows = readResult.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === body.id);

        if (rowIndex === -1) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: "Item não encontrado" })
          };
        }

        const currentQty = parseInt(rows[rowIndex][3]) || 0;
        const outputQty = parseInt(body.quantidade) || 0;

        if (isNaN(outputQty) || outputQty <= 0) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: "Quantidade inválida" })
          };
        }

        if (currentQty < outputQty) {
          return {
            statusCode: 400,
            body: JSON.stringify({ 
              error: `Estoque insuficiente. Disponível: ${currentQty}` 
            })
          };
        }

        const newQty = currentQty - outputQty;
        
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Items!D${rowIndex + 2}`,
          valueInputOption: "RAW",
          requestBody: { values: [[newQty]] }
        });

        await registrarMovimentacao(sheets, {
          tipo: 'saida',
          id: body.id,
          nome: rows[rowIndex][1] || body.nome,
          quantidade: outputQty,
          motivo: body.motivo || 'Saída manual',
          usuario: body.usuario || 'Usuário'
        });

        return {
          statusCode: 200,
          body: JSON.stringify({ 
            ok: true, 
            newQty,
            message: "Saída registrada com sucesso!"
          })
        };

      } catch (error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: error.message })
        };
      }
    }

    // ENTRADA
    if (body.action === 'entrada') {
      try {
        const verificado = await verificarItemExistente(sheets, body.id, body.codigoBarras);
        let mensagem = "";
        
        if (verificado.existe) {
            const linha = verificado.linhaId !== -1 ? verificado.linhaId : verificado.linhaCodigo;
            const currentQty = parseInt(verificado.item[3]) || 0;
            const newQty = currentQty + parseInt(body.quantidade);
            
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `Items!D${linha + 2}`,
                valueInputOption: "RAW",
                requestBody: { values: [[newQty]] }
            });
            
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `Items!G${linha + 2}`,
                valueInputOption: "RAW",
                requestBody: { values: [[new Date().toISOString()]] }
            });
            
            if (body.codigoBarras && !verificado.item[7]) {
                await sheets.spreadsheets.values.update({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `Items!H${linha + 2}`,
                    valueInputOption: "RAW",
                    requestBody: { values: [[body.codigoBarras]] }
                });
            }
            
            mensagem = "Estoque atualizado com sucesso!";
        } else {
            const newItem = [
                body.id,
                body.nome,
                body.categoria || 'Geral',
                parseInt(body.quantidade) || 0,
                body.local || 'Geral',
                body.status || 'OK',
                new Date().toISOString(),
                body.codigoBarras || ''
            ];

            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: "Items!A2",
                valueInputOption: "RAW",
                requestBody: {
                    values: [newItem],
                },
            });
            
            mensagem = "Item criado com sucesso!";
        }

        await registrarMovimentacao(sheets, {
            tipo: 'entrada',
            id: body.id,
            nome: body.nome,
            quantidade: body.quantidade,
            motivo: 'Entrada manual',
            usuario: body.usuario || 'Usuário'
        });

        return {
          statusCode: 200,
          body: JSON.stringify({ 
            ok: true, 
            message: mensagem,
            atualizado: verificado.existe
          })
        };

      } catch (error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: error.message })
        };
      }
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Ação não especificada (use 'entrada' ou 'saida')" })
    };
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: "Method not allowed" })
  };
}
