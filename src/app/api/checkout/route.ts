import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { template, text, fontFamily, textColor, imageUrl, cropData } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing image" }, { status: 400 });
    }

    // AQUI: Salvaríamos o pedido no Supabase com status "pending_payment"
    // const { data: order, error } = await supabase.from('orders').insert({ ... }).select().single();
    
    // Simulação do ID do pedido gerado
    const orderId = `order_${Math.random().toString(36).substring(7)}`;
    
    console.log(`[Checkout] Pedido ${orderId} salvo como pendente no banco de dados.`);
    
    // Substitua pelo seu link real de checkout da Kacto
    // Opcionalmente, você pode passar o orderId como parâmetro na URL para o Webhook identificar (ex: ?src=orderId)
    const kactoCheckoutUrl = `https://pay.kacto.co/checkout-placeholder?order_id=${orderId}`;

    return NextResponse.json({ url: kactoCheckoutUrl, orderId });
  } catch (error: any) {
    console.error("Checkout Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
