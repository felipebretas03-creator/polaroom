import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // O payload da Cakto geralmente envia o status e variáveis ocultas (como ref)
    // Precisaremos ajustar o campo dependendo da documentação exata deles, 
    // mas geralmente eles enviam o 'ref' ou 'metadata.ref' passado na URL de checkout.
    
    // Simulando leitura básica de webhook
    const status = body.status // ex: "approved", "paid", etc
    const orderId = body.ref || body.metadata?.ref || body.reference
    const transactionId = body.transaction_id || body.id

    if (status === 'approved' || status === 'paid' || status === 'completed') {
      if (orderId) {
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: 'paid',
            kacto_transaction_id: transactionId,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)
          
        if (error) {
          console.error("Webhook update error:", error)
          return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error("Webhook parse error:", err)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
}
