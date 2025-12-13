// Este arquivo é só para garantir que a pasta functions existe
export async function handler(event, context) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      message: "API funcionando!",
      timestamp: new Date().toISOString()
    })
  };
}
