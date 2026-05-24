"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Download, Clock, Image as ImageIcon } from "lucide-react"
import Header from "@/components/shared/Header"
import Footer from "@/components/shared/Footer"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push("/login")
        return
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Error fetching orders:", error)
      } else {
        setOrders(data || [])
      }
      setIsLoading(false)
    }

    fetchOrders()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Carregando seus pedidos...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-serif text-4xl font-bold mb-4">Minhas Polaroids</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Acompanhe seus pedidos e baixe suas memórias em alta resolução prontas para impressão.
          </p>
        </motion.div>

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-muted/20 rounded-2xl border border-dashed border-border">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhum pedido ainda</h3>
            <p className="text-muted-foreground mb-6">Crie seu primeiro kit de polaroids!</p>
            <Button onClick={() => router.push("/editor")}>
              Criar Polaroids
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {orders.map((order, i) => {
              // Pegar a primeira imagem para servir de capa
              const coverImage = order.images && order.images.length > 0 ? order.images[0] : null;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-border"
                >
                  <div className="aspect-square bg-muted rounded-xl mb-6 relative overflow-hidden flex flex-col items-center justify-center p-4">
                    <div className="w-full bg-white p-2 pb-6 shadow-md transform rotate-2">
                      <div className="aspect-square relative overflow-hidden bg-zinc-200">
                        {coverImage ? (
                          <img 
                            src={coverImage.url} 
                            alt={coverImage.text || "Foto do kit"}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-muted-foreground/30 absolute inset-0 m-auto" />
                        )}
                      </div>
                      <div className="text-center mt-3 font-serif truncate px-2 text-sm">
                        {coverImage?.text || "Sem legenda"}
                      </div>
                    </div>
                    {/* Badge de quantidade */}
                    <div className="absolute bottom-4 right-4 bg-black/80 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                      {order.images?.length || 0} fotos
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Pedido {order.id.split('-')[0]}</p>
                      <p className="text-sm font-medium">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'paid' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status === 'paid' ? 'Pronto' : 'Pendente'}
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    variant={order.status === 'paid' ? 'default' : 'outline'}
                    disabled={order.status !== 'paid'}
                    onClick={() => {
                       if (order.status === 'paid') {
                          // Redirecionar para a tela de exportação que vai processar o PDF
                          window.open('/export?id=' + order.id, '_blank')
                       } else {
                          // Se estiver pendente, poderia redirecionar pro Kacto novamente
                          alert("Aguardando confirmação do pagamento.");
                       }
                    }}
                  >
                    {order.status === 'paid' ? (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Baixar em Alta Resolução
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Aguardando Pagamento
                      </>
                    )}
                  </Button>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
