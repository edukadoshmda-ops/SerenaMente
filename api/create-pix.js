export default async function handler(req, res) {
  // Configuração CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const asaasApiKey = process.env.ASAAS_API_KEY;
  if (!asaasApiKey) {
    return res.status(500).json({ error: 'ASAAS_API_KEY não configurada no servidor' });
  }

  try {
    const { name, email, cpfCnpj, value, description } = req.body;

    const cleanCpf = (cpfCnpj || '').replace(/\D/g, '');
    const chargeValue = parseFloat(value) || 14.90;

    // 1. Criar ou Buscar Cliente no Asaas
    const customerPayload = {
      name: name || 'Apoiador SerenaMente',
      email: email || 'contato@serenamente.app',
      cpfCnpj: cleanCpf || '00000000000'
    };

    const customerRes = await fetch('https://api.asaas.com/v3/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': asaasApiKey
      },
      body: JSON.stringify(customerPayload)
    });

    const customerData = await customerRes.json();
    const customerId = customerData.id;

    if (!customerId) {
      return res.status(400).json({ error: 'Erro ao registrar cliente no Asaas', details: customerData });
    }

    // 2. Criar Cobrança PIX
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2); // Vence em 2 dias

    const paymentPayload = {
      customer: customerId,
      billingType: 'PIX',
      value: chargeValue,
      dueDate: dueDate.toISOString().split('T')[0],
      description: description || 'Apoio SerenaMente - Cuidado Emocional',
      postalService: false
    };

    const paymentRes = await fetch('https://api.asaas.com/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': asaasApiKey
      },
      body: JSON.stringify(paymentPayload)
    });

    const paymentData = await paymentRes.json();
    if (!paymentData.id) {
      return res.status(400).json({ error: 'Erro ao gerar cobrança', details: paymentData });
    }

    // 3. Obter QR Code e Chave Pix Copia e Cola
    const pixRes = await fetch(`https://api.asaas.com/v3/payments/${paymentData.id}/pixQrCode`, {
      headers: {
        'access_token': asaasApiKey
      }
    });

    const pixData = await pixRes.json();

    return res.status(200).json({
      paymentId: paymentData.id,
      value: paymentData.value,
      encodedImage: pixData.encodedImage, // Imagem Base64 do QR Code
      payload: pixData.payload,           // Código Pix Copia e Cola
      expirationDate: pixData.expirationDate
    });

  } catch (err) {
    console.error('Erro na rota Asaas PIX:', err);
    return res.status(500).json({ error: 'Erro interno ao processar Pix' });
  }
}
