import { NextResponse } from 'next/server';

const ASAAS_API_URL = 'https://api.asaas.com/v3';
const ASAAS_API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmJjN2ZhMzg4LWJhMGQtNDVmOC04NWQ1LTI3NDVmNWJmYWRhNDo6JGFhY2hfMzgyMmJmYjYtZmQ3Zi00NGYwLTlkYWEtOTJkMDhkYmI0NzY4';

export async function POST(req: Request) {
  try {
    if (!ASAAS_API_KEY) {
      return NextResponse.json({ error: 'ASAAS_API_KEY não configurada no servidor.' }, { status: 500 });
    }

    const body = await req.json();
    const { customerName, customerEmail, customerCpf, grandesCount = 0, minisCount = 0, deliveryMethod = 'digital', orderId } = body;

    if (!customerName || !customerCpf || (grandesCount === 0 && minisCount === 0)) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando.' }, { status: 400 });
    }

    // 1. Calculate price securely on the backend
    let totalPrice = 0;
    
    if (deliveryMethod === 'printed') {
      const kitsGrande = Math.max(0, Math.ceil(grandesCount / 8));
      const kitsMini = Math.max(0, Math.ceil(minisCount / 12));
      const totalKits = kitsGrande + kitsMini;
      const printedBasePrice = 19.90;
      const extraKitPrice = 3.00;
      const shippingFee = 15.90;
      
      const printedPrice = totalKits > 0 ? printedBasePrice + Math.max(0, totalKits - 3) * extraKitPrice : 0;
      totalPrice = printedPrice > 0 ? printedPrice + shippingFee : 0;
    } else {
      // Digital pricing
      const requiredGrande = 8;
      const requiredMini = 12;
      const baseGrande = 7.50;
      const baseMini = 5.00;
      const extraGrandePrice = 0.75;
      const extraMiniPrice = 0.50;

      if (grandesCount > 0) {
          const extraGrandes = Math.max(0, grandesCount - requiredGrande);
          totalPrice += baseGrande + (extraGrandes * extraGrandePrice);
      }
      if (minisCount > 0) {
          const extraMinis = Math.max(0, minisCount - requiredMini);
          totalPrice += baseMini + (extraMinis * extraMiniPrice);
      }
    }

    // 2. Create or find customer in Asaas
    const customerRes = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
      },
      body: JSON.stringify({
        name: customerName,
        email: customerEmail,
        cpfCnpj: customerCpf.replace(/\D/g, '') // Remove non-numeric chars
      })
    });

    const customerData = await customerRes.json();
    if (!customerRes.ok) {
      console.error("Asaas Customer Error:", customerData);
      return NextResponse.json({ error: 'Erro ao cadastrar cliente no Asaas', details: customerData }, { status: 400 });
    }

    const asaasCustomerId = customerData.id;

    // 3. Create the payment
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1); // Vence amanhã

    const paymentRes = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
      },
      body: JSON.stringify({
        customer: asaasCustomerId,
        billingType: 'UNDEFINED',
        value: totalPrice,
        dueDate: dueDate.toISOString().split('T')[0],
        description: `Pedido #${orderId} - Entrega: ${deliveryMethod === 'printed' ? 'Impresso' : 'Digital'} (${grandesCount} Grandes, ${minisCount} Minis)`,
        externalReference: orderId
      })
    });

    const paymentData = await paymentRes.json();
    
    if (!paymentRes.ok) {
      console.error("Asaas Payment Error:", paymentData);
      return NextResponse.json({ error: 'Erro ao gerar cobrança no Asaas', details: paymentData }, { status: 400 });
    }

    // Retorna a URL da fatura (que contém o QR Code do Pix e opção de cartão/boleto se configurado no Asaas)
    return NextResponse.json({ 
      success: true, 
      invoiceUrl: paymentData.invoiceUrl,
      paymentId: paymentData.id
    });

  } catch (error: any) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
