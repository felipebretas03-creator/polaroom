import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // A Kacto geralmente envia algo como "status: 'paid'" e o ID da transação / referência do pedido.
    // Exemplo estrutural hipotético:
    const { status, reference_id, customer } = payload;

    if (status === "paid" || status === "approved") {
      console.log(`[Webhook Kacto] Pagamento aprovado para o pedido: ${reference_id}`);
      
      // AQUI: Atualizar o banco de dados Supabase
      // const { error } = await supabase.from('orders').update({ status: 'paid' }).eq('id', reference_id);

      // AQUI: Chamar uma função assíncrona para compilar o Fabric.js no backend usando Node Canvas 
      // ou liberar o download na área do cliente.
      
      return NextResponse.json({ message: "Pagamento processado com sucesso e arquivos liberados" });
    }

    return NextResponse.json({ message: "Status recebido, mas não aprovado" });
  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
