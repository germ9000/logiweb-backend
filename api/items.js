// api/items.js

import { connectSheet } from "./sheet.js";

const SPREADSHEET_ID = process.env.SHEET_ID;

// Função para registrar movimentação
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

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const sheets = await connectSheet();
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Items!A2:G",
      });
      
      const items = result.data.values || [];
      return res.status(200).json(items);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "POST") {
    const sheets = await connectSheet();
    const body = req.body;

    // ROTA DE SAÍDA
    if (body.action === 'saida') {
      try {
        // 1. Ler todos os itens
        const readResult = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: "Items!A2:G",
        });

        const rows = readResult.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === body.id);

        if (rowIndex === -1) {
          return res.status(404).json({ error: "Item não encontrado" });
        }

        const currentQty = parseInt(rows[rowIndex][3]) || 0;
        const outputQty = parseInt(body.quantidade) || 0;

        // Validações
        if (isNaN(outputQty) || outputQty <= 0) {
          return res.status(400).json({ error: "Quantidade inválida" });
        }

        if (currentQty < outputQty) {
          return res.status(400).json({ 
            error: `Estoque insuficiente. Disponível: ${currentQty}` 
          });
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
        await registrarMovimentacao(sheets, {
          tipo: 'saida',
          id: body.id,
          nome: rows[rowIndex][1] || body.nome,
          quantidade: outputQty,
          motivo: body.motivo || 'Saída manual',
          usuario: body.usuario || 'Usuário'
        });

        return res.status(200).json({ 
          ok: true, 
          newQty,
          message: "Saída registrada com sucesso!"
        });

      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }

    // ROTA DE ENTRADA (CÓDIGO EXISTENTE - ATUALIZADO)
    if (body.action === 'entrada') {
      try {
        // Verificar se item já existe
        const readResult = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: "Items!A2:G",
        });

        const rows = readResult.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === body.id);

        if (rowIndex === -1) {
          // Item novo - adicionar
          const newItem = [
            body.id,
            body.nome,
            body.categoria || 'Geral',
            parseInt(body.quantidade) || 0,
            body.local || 'Geral',
            body.status || 'OK',
            new Date().toISOString()
          ];

          await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "Items!A2",
            valueInputOption: "RAW",
            requestBody: {
              values: [newItem],
            },
          });
        } else {
          // Item existe - atualizar quantidade
          const currentQty = parseInt(rows[rowIndex][3]) || 0;
          const newQty = currentQty + parseInt(body.quantidade);
          
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Items!D${rowIndex + 2}`,
            valueInputOption: "RAW",
            requestBody: { values: [[newQty]] }
          });
        }

        // Registrar movimentação de entrada
        await registrarMovimentacao(sheets, {
          tipo: 'entrada',
          id: body.id,
          nome: body.nome,
          quantidade: body.quantidade,
          motivo: 'Entrada manual',
          usuario: body.usuario || 'Usuário'
        });

        return res.status(200).json({ ok: true, message: "Entrada registrada com sucesso!" });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }

    return res.status(400).json({ error: "Ação não especificada (use 'entrada' ou 'saida')" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}// Função para verificar se item já existe
async function verificarItemExistente(sheets, id, codigoBarras = '') {
    try {
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "Items!A2:H", // Incluindo coluna H (código de barras)
        });

        const rows = result.data.values || [];
        
        // Verificar por ID
        const porId = rows.findIndex(row => row[0] === id);
        
        // Verificar por código de barras (se fornecido)
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
}// ROTA DE ENTRADA
if (body.action === 'entrada') {
    try {
        // Verificar se item já existe
        const verificado = await verificarItemExistente(sheets, body.id, body.codigoBarras);
        
        if (verificado.existe) {
            // Item existe - atualizar quantidade
            const linha = verificado.linhaId !== -1 ? verificado.linhaId : verificado.linhaCodigo;
            const currentQty = parseInt(rows[linha][3]) || 0;
            const newQty = currentQty + parseInt(body.quantidade);
            
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `Items!D${linha + 2}`,
                valueInputOption: "RAW",
                requestBody: { values: [[newQty]] }
            });
            
            // Atualizar data de atualização
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `Items!G${linha + 2}`,
                valueInputOption: "RAW",
                requestBody: { values: [[new Date().toISOString()]] }
            });
            
            // Se tem código de barras novo e não tinha, atualizar
            if (body.codigoBarras && !rows[linha][7]) {
                await sheets.spreadsheets.values.update({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `Items!H${linha + 2}`,
                    valueInputOption: "RAW",
                    requestBody: { values: [[body.codigoBarras]] }
                });
            }
            
            mensagem = "Estoque atualizado com sucesso!";
        } else {
            // Item novo - adicionar
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

        // Registrar movimentação
        await registrarMovimentacao(sheets, {
            tipo: 'entrada',
            id: body.id,
            nome: body.nome,
            quantidade: body.quantidade,
            motivo: 'Entrada manual',
            usuario: body.usuario || 'Usuário'
        });

        return res.status(200).json({ 
            ok: true, 
            message: mensagem,
            atualizado: verificado.existe
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
