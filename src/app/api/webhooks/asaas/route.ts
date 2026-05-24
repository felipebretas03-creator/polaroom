import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos a Service Role Key se disponível para ignorar as regras de RLS (já que é o servidor rodando),
// senão usamos a Anon Key como fallback.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // O Asaas envia o tipo de evento
    const event = body.event;
    
    // PAYMENT_RECEIVED = Pix pago ou Cartão aprovado na hora
    // PAYMENT_CONFIRMED = Compensação de boleto ou confirmação tardia de cartão
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      const payment = body.payment;
      
      if (!payment || !payment.externalReference) {
        return NextResponse.json({ error: 'Missing payment or externalReference' }, { status: 400 });
      }

      // O externalReference é o nosso ID do pedido no Supabase
      const orderId = payment.externalReference;

      // Atualiza o status do pedido para 'paid'
      const { data, error } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', orderId);

      if (error) {
        console.error('Supabase update error:', error);
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
      }

      console.log(`✅ Pedido ${orderId} atualizado para 'paid' via Webhook Asaas.`);
      return NextResponse.json({ received: true, orderId, status: 'updated' });
    }

    // Ignora outros eventos (vencimento, criação de cobrança, etc)
    return NextResponse.json({ received: true, ignored: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
