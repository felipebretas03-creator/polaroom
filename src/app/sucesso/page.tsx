import Header from "@/components/shared/Header"
import Footer from "@/components/shared/Footer"
import { CheckCircle2, Package, ArrowRight, Camera } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: 'Pedido Confirmado | Polaroom',
  description: 'Obrigado por sua compra na Polaroom.',
}

export default function SucessoPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-32 pb-20 flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-premium p-8 md:p-12 text-center border border-border relative overflow-hidden">
          
          {/* Fundo decorativo sutil */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/5 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">
              Pedido Recebido!
            </h1>
            
            <p className="text-muted-foreground mb-8 text-lg">
              Muito obrigado por eternizar suas memórias com a gente. 
              Seu pedido já está no nosso sistema e aguardando a confirmação do pagamento.
            </p>

            <div className="bg-muted/30 rounded-2xl p-6 text-left mb-8 space-y-4">
              <h3 className="font-semibold text-primary flex items-center gap-2">
                <Package className="w-5 h-5 text-accent" /> 
                Próximos Passos
              </h3>
              
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 font-medium text-xs text-primary">1</div>
                  <span>Assim que o seu banco confirmar o Pix ou o Cartão, o status do pedido mudará para pago.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 font-medium text-xs text-primary">2</div>
                  <span>Você poderá baixar o seu <strong>PDF em alta resolução</strong> diretamente pelo seu Painel de Usuário.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 font-medium text-xs text-primary">3</div>
                  <span>Se você pediu a opção <strong>Impressa</strong>, nós iniciaremos a produção e o envio para a sua casa.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto px-8">
                <Link href="/dashboard">
                  Ir para meus Pedidos <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-8 bg-white">
                <Link href="/">
                  Voltar ao Início
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
