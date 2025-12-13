import { google } from "googleapis";

export default function handler(req, res) {
  return res.status(200).json({ ok: true });
}

export async function connectSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  return sheets;
}
/**
 * API DE INTEGRAÇÃO COM GOOGLE SHEETS
 * ===================================
 * 
 * Funções para ler, escrever e atualizar dados no Google Sheets
 */
 
class GoogleSheetsAPI {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.API.BASE_URL;
    this.spreadsheetId = config.GOOGLE_SHEETS.SPREADSHEET_ID;
    this.apiKey = config.GOOGLE_SHEETS.API_KEY;
  }
 
  /**
   * Lê dados de uma aba específica
   * @param {string} sheetName - Nome da aba
   * @param {string} range - Intervalo (ex: "A1:Z100")
   * @returns {Promise<Array>} Dados da planilha
   */
  async readSheet(sheetName, range = 'A:Z') {
    try {
      const fullRange = `${sheetName}!${range}`;
      const url = `${this.baseUrl}/${this.spreadsheetId}/values/${encodeURIComponent(fullRange)}?key=${this.apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Erro ao ler sheet: ${response.statusText}`);
      
      const data = await response.json();
      return this.formatData(data.values || []);
    } catch (error) {
      console.error('Erro ao ler Google Sheets:', error);
      throw error;
    }
  }
 
  /**
   * Formata dados brutos em objetos
   * @param {Array} rawData - Dados brutos da API
   * @returns {Array} Dados formatados
   */
  formatData(rawData) {
    if (rawData.length === 0) return [];
    
    const headers = rawData[0];
    return rawData.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  }
 
  /**
   * Busca itens por ID
   * @param {string} itemId - ID do item
   * @returns {Promise<Object>} Dados do item
   */
  async getItemById(itemId) {
    try {
      const items = await this.readSheet(this.config.GOOGLE_SHEETS.SHEETS.ITEMS);
      return items.find(item => item['ID'] === itemId || item['id'] === itemId);
    } catch (error) {
      console.error('Erro ao buscar item:', error);
      throw error;
    }
  }
 
  /**
   * Busca movimentações por período
   * @param {string} startDate - Data inicial (YYYY-MM-DD)
   * @param {string} endDate - Data final (YYYY-MM-DD)
   * @returns {Promise<Array>} Movimentações no período
   */
  async getMovementsByDateRange(startDate, endDate) {
    try {
      const movements = await this.readSheet(this.config.GOOGLE_SHEETS.SHEETS.MOVEMENTS);
      
      return movements.filter(mov => {
        const movDate = new Date(mov['Data'] || mov['data']);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return movDate >= start && movDate <= end;
      });
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      throw error;
    }
  }
 
  /**
   * Busca usuários
   * @returns {Promise<Array>} Lista de usuários
   */
  async getUsers() {
    try {
      return await this.readSheet(this.config.GOOGLE_SHEETS.SHEETS.USERS);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }
 
  /**
   * Busca categorias
   * @returns {Promise<Array>} Lista de categorias
   */
  async getCategories() {
    try {
      return await this.readSheet(this.config.GOOGLE_SHEETS.SHEETS.CATEGORIES);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  }
 
  /**
   * Busca todos os itens
   * @returns {Promise<Array>} Lista de itens
   */
  async getItems() {
    try {
      return await this.readSheet(this.config.GOOGLE_SHEETS.SHEETS.ITEMS);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      throw error;
    }
  }
 
  /**
   * Busca todas as movimentações
   * @returns {Promise<Array>} Lista de movimentações
   */
  async getMovements() {
    try {
      return await this.readSheet(this.config.GOOGLE_SHEETS.SHEETS.MOVEMENTS);
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      throw error;
    }
  }
 
  /**
   * Calcula estoque atual de um item
   * @param {string} itemId - ID do item
   * @returns {Promise<number>} Quantidade em estoque
   */
  async getItemStock(itemId) {
    try {
      const item = await this.getItemById(itemId);
      if (!item) return 0;
      
      const quantity = item['Quantidade'] || item['quantidade'] || 0;
      return parseInt(quantity) || 0;
    } catch (error) {
      console.error('Erro ao calcular estoque:', error);
      throw error;
    }
  }
 
  /**
   * Busca histórico de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Array>} Movimentações do usuário
   */
  async getUserHistory(userId) {
    try {
      const movements = await this.getMovements();
      return movements.filter(mov => 
        mov['Usuário'] === userId || 
        mov['usuario'] === userId ||
        mov['User'] === userId
      );
    } catch (error) {
      console.error('Erro ao buscar histórico do usuário:', error);
      throw error;
    }
  }
 
  /**
   * Busca log de acesso
   * @returns {Promise<Array>} Log de acessos
   */
  async getAccessLog() {
    try {
      return await this.readSheet(this.config.GOOGLE_SHEETS.SHEETS.ACCESS_LOG);
    } catch (error) {
      console.error('Erro ao buscar log de acesso:', error);
      throw error;
    }
  }
 
  /**
   * Calcula previsão de estoque
   * @param {string} itemId - ID do item
   * @param {number} days - Número de dias para previsão
   * @returns {Promise<Object>} Previsão de estoque
   */
  async getStockForecast(itemId, days = 30) {
    try {
      const item = await this.getItemById(itemId);
      const movements = await this.getMovements();
      
      const itemMovements = movements.filter(mov => 
        mov['ID Item'] === itemId || mov['id_item'] === itemId
      );
 
      const currentStock = await this.getItemStock(itemId);
      const avgDailyMovement = itemMovements.length > 0 
        ? itemMovements.length / days 
        : 0;
 
      return {
        itemId,
        currentStock,
        avgDailyMovement,
        forecastedStock: Math.max(0, currentStock - (avgDailyMovement * days)),
        daysUntilStockout: avgDailyMovement > 0 
          ? Math.ceil(currentStock / avgDailyMovement) 
          : Infinity
      };
    } catch (error) {
      console.error('Erro ao calcular previsão:', error);
      throw error;
    }
  }
}
 
// Inicializar API globalmente
let sheetsAPI = null;
 
function initializeAPI(config) {
  sheetsAPI = new GoogleSheetsAPI(config);
  return sheetsAPI;
}
 
function getAPI() {
  if (!sheetsAPI) {
    throw new Error('API não inicializada. Chame initializeAPI(config) primeiro.');
  }
  return sheetsAPI;
}
 
// Exportar para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GoogleSheetsAPI, initializeAPI, getAPI };
}
