import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("id");

    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    // AQUI: Buscaríamos o pedido no Supabase para verificar se o status é 'paid'.
    // const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
    
    // Se o pedido está pago, precisamos gerar a imagem HD.
    // Como estamos sem o banco de dados configurado, vamos retornar um redirect 
    // para a foto original (ou uma imagem compilada).
    
    console.log(`[Export] Gerando download em alta resolução para o pedido: ${orderId}`);

    // Em produção, você usaria o Node Canvas para renderizar a imagem HD no servidor e 
    // retornar o buffer da imagem como download (Content-Disposition: attachment).
    // Por enquanto, redirecionamos para a imagem mock.
    
    return NextResponse.redirect("https://images.unsplash.com/photo-1517841905240-472988babdf9?q=100&w=2000&auto=format");
  } catch (error: any) {
    console.error("Export Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
