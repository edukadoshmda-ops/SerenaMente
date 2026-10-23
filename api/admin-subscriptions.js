import fs from 'fs';
import path from 'path';

// Carregar .env se não estiver no process.env (compatível com dev e Vercel)
function getAsaasApiKey() {
  if (process.env.ASAAS_API_KEY) return process.env.ASAAS_API_KEY;
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        if (line.startsWith('ASAAS_API_KEY=')) {
          return line.trim().split('=', 2)[1];
        }
      }
    }
  } catch (e) {
    // ignorar
  }
  return null;
}

export default async function handler(req, res) {
  // Configuração CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const asaasApiKey = getAsaasApiKey();
  if (!asaasApiKey) {
    return res.status(500).json({ error: 'ASAAS_API_KEY não configurada no servidor' });
  }

  const asaasHeaders = {
    'Content-Type': 'application/json',
    'access_token': asaasApiKey,
    'User-Agent': 'SerenaMente-Root-Dashboard'
  };

  // =========================================================================
  // GET: LISTAR COBRANÇAS, ASSINATURAS, CLIENTES E MÉTRICAS
  // =========================================================================
  if (req.method === 'GET') {
    try {
      // 1. Buscar Cobranças do Asaas
      const paymentsRes = await fetch('https://api.asaas.com/v3/payments?limit=100&order=desc', {
        headers: asaasHeaders
      });
      const paymentsData = await paymentsRes.json();
      const rawPayments = paymentsData.data || [];

      // 2. Buscar Clientes do Asaas
      const customersRes = await fetch('https://api.asaas.com/v3/customers?limit=100', {
        headers: asaasHeaders
      });
      const customersData = await customersRes.json();
      const rawCustomers = customersData.data || [];

      // Mapa de clientes para cruzamento rápido por ID
      const customerMap = {};
      rawCustomers.forEach(c => {
        customerMap[c.id] = c;
      });

      // 3. Buscar Assinaturas do Asaas
      const subsRes = await fetch('https://api.asaas.com/v3/subscriptions?limit=100', {
        headers: asaasHeaders
      });
      const subsData = await subsRes.json();
      const rawSubscriptions = subsData.data || [];

      // 4. Mapear e Enriquecer Pagamentos com Dados do Cliente
      const enrichedPayments = rawPayments.map(p => {
        const customer = customerMap[p.customer] || {};
        
        // Identificar Plano com base no valor ou descrição
        let planName = 'Plano Mensal';
        const val = Number(p.value) || 0;
        const desc = (p.description || '').toLowerCase();

        if (val === 9.9 || val === 19.9 || desc.includes('mensal')) {
          planName = 'Plano Mensal (R$ 9,90)';
        } else if (val === 97 || desc.includes('anual')) {
          planName = 'Plano Anual (R$ 97,00)';
        } else if (val === 147 || desc.includes('vitalício') || desc.includes('vitalicio')) {
          planName = 'Plano Vitalício (R$ 147,00)';
        } else if (val > 0 && val < 50) {
          planName = 'Apoio SerenaMente';
        } else {
          planName = p.description || 'Assinatura SerenaMente';
        }

        return {
          id: p.id,
          customer: p.customer,
          customerName: customer.name || 'Cliente SerenaMente',
          customerEmail: customer.email || '—',
          customerPhone: customer.mobilePhone || customer.phone || '—',
          customerCpfCnpj: customer.cpfCnpj || '—',
          value: p.value,
          netValue: p.netValue,
          status: p.status, // RECEIVED, CONFIRMED, PENDING, OVERDUE, REFUNDED
          billingType: p.billingType, // PIX, CREDIT_CARD, BOLETO
          dueDate: p.dueDate,
          paymentDate: p.paymentDate || p.clientPaymentDate || null,
          invoiceUrl: p.invoiceUrl,
          bankSlipUrl: p.bankSlipUrl,
          transactionReceiptUrl: p.transactionReceiptUrl,
          description: p.description,
          planName,
          dateCreated: p.dateCreated
        };
      });

      // 5. Calcular Métricas para o Dashboard
      let totalReceived = 0;
      let totalPending = 0;
      let totalOverdue = 0;
      let countReceived = 0;
      let countPending = 0;
      let countOverdue = 0;

      enrichedPayments.forEach(p => {
        const val = Number(p.value) || 0;
        if (p.status === 'RECEIVED' || p.status === 'CONFIRMED') {
          totalReceived += val;
          countReceived += 1;
        } else if (p.status === 'PENDING') {
          totalPending += val;
          countPending += 1;
        } else if (p.status === 'OVERDUE') {
          totalOverdue += val;
          countOverdue += 1;
        }
      });

      // Estimativa MRR (Mensalidades ativas)
      const mrrEstimate = countReceived * 9.90;

      return res.status(200).json({
        success: true,
        metrics: {
          totalReceived,
          totalPending,
          totalOverdue,
          countReceived,
          countPending,
          countOverdue,
          totalSubscribers: rawCustomers.length,
          mrrEstimate
        },
        payments: enrichedPayments,
        subscriptions: rawSubscriptions,
        customers: rawCustomers
      });

    } catch (err) {
      console.error('Erro ao buscar dados no Asaas:', err);
      return res.status(500).json({ error: 'Erro ao consultar API do Asaas', details: err.message });
    }
  }

  // =========================================================================
  // POST: AÇÕES ADMINISTRATIVAS (CONFIRMAR, CRIAR, DELETAR, OBTER PIX)
  // =========================================================================
  if (req.method === 'POST') {
    try {
      const { action, paymentId, customerData, chargeData } = req.body;

      // 1. Obter QR Code PIX de uma cobrança
      if (action === 'get_pix_qr' && paymentId) {
        const pixRes = await fetch(`https://api.asaas.com/v3/payments/${paymentId}/pixQrCode`, {
          headers: asaasHeaders
        });
        const pixData = await pixRes.json();
        return res.status(200).json({ success: true, pix: pixData });
      }

      // 2. Confirmar Pagamento Manualmente no Asaas (recebido em dinheiro/pix direto)
      if (action === 'confirm_payment' && paymentId) {
        const today = new Date().toISOString().split('T')[0];
        const confirmRes = await fetch(`https://api.asaas.com/v3/payments/${paymentId}/receiveInCash`, {
          method: 'POST',
          headers: asaasHeaders,
          body: JSON.stringify({
            paymentDate: today,
            value: chargeData?.value
          })
        });
        const confirmData = await confirmRes.json();
        return res.status(200).json({ success: true, result: confirmData });
      }

      // 3. Excluir / Cancelar Cobrança
      if (action === 'delete_payment' && paymentId) {
        const delRes = await fetch(`https://api.asaas.com/v3/payments/${paymentId}`, {
          method: 'DELETE',
          headers: asaasHeaders
        });
        const delData = await delRes.json();
        return res.status(200).json({ success: true, result: delData });
      }

      // 4. Criar Nova Cobrança no Asaas
      if (action === 'create_payment') {
        const { name, email, cpfCnpj, phone, value, description, billingType } = chargeData || {};
        
        // Criar ou localizar cliente
        const custRes = await fetch('https://api.asaas.com/v3/customers', {
          method: 'POST',
          headers: asaasHeaders,
          body: JSON.stringify({
            name: name || 'Assinante SerenaMente',
            email: email || 'cliente@serenamente.app',
            cpfCnpj: (cpfCnpj || '').replace(/\D/g, '') || undefined,
            mobilePhone: (phone || '').replace(/\D/g, '') || undefined
          })
        });
        const custJson = await custRes.json();
        const customerId = custJson.id;

        if (!customerId) {
          return res.status(400).json({ error: 'Falha ao registrar cliente no Asaas', details: custJson });
        }

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3);

        const newPayRes = await fetch('https://api.asaas.com/v3/payments', {
          method: 'POST',
          headers: asaasHeaders,
          body: JSON.stringify({
            customer: customerId,
            billingType: billingType || 'PIX',
            value: Number(value) || 9.90,
            dueDate: dueDate.toISOString().split('T')[0],
            description: description || 'Plano Mensal SerenaMente - R$ 9,90',
            postalService: false
          })
        });

        const newPayJson = await newPayRes.json();
        return res.status(200).json({ success: true, payment: newPayJson });
      }

      return res.status(400).json({ error: 'Ação não reconhecida' });

    } catch (err) {
      console.error('Erro na ação administrativa:', err);
      return res.status(500).json({ error: 'Erro ao processar ação administrativa', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
