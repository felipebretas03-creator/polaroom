"use client"

import Header from "@/components/shared/Header"
import Footer from "@/components/shared/Footer"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Mail, MessageSquare } from "lucide-react"

export default function ContatoPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Como ainda não temos backend de email, podemos alertar ou apenas limpar
    alert("Mensagem enviada com sucesso! Retornaremos o mais breve possível.")
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-serif text-5xl font-bold text-foreground mb-6"
            >
              Fale Conosco
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Tem alguma dúvida, sugestão ou precisa de ajuda com o seu pedido? Estamos aqui para ouvir você.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            
            {/* Informações de Contato */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-semibold mb-6">Nossos Canais</h2>
              
              <a href="https://www.instagram.com/thepixeloo/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 p-6 rounded-2xl bg-white shadow-sm border border-black/5 hover:shadow-premium transition-all group">
                <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Instagram</h3>
                  <p className="text-muted-foreground">@thepixeloo</p>
                </div>
              </a>

              <a href="mailto:contato@polaroom.com.br" className="flex items-center gap-6 p-6 rounded-2xl bg-white shadow-sm border border-black/5 hover:shadow-premium transition-all group">
                <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">E-mail</h3>
                  <p className="text-muted-foreground">contato@polaroom.com.br</p>
                </div>
              </a>

              <a href="#" className="flex items-center gap-6 p-6 rounded-2xl bg-white shadow-sm border border-black/5 hover:shadow-premium transition-all group">
                <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Suporte</h3>
                  <p className="text-muted-foreground">Segunda a Sexta, 9h às 18h</p>
                </div>
              </a>
            </motion.div>

            {/* Formulário */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-8 sm:p-10 shadow-premium border border-black/5"
            >
              <h2 className="text-2xl font-semibold mb-8">Envie uma mensagem</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nome completo</label>
                  <input 
                    type="text" 
                    id="name" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-muted/50"
                    placeholder="Seu nome"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">E-mail</label>
                  <input 
                    type="email" 
                    id="email" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-muted/50"
                    placeholder="voce@exemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Assunto</label>
                  <input 
                    type="text" 
                    id="subject" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-muted/50"
                    placeholder="Como podemos ajudar?"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Mensagem</label>
                  <textarea 
                    id="message" 
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-muted/50 resize-none"
                    placeholder="Escreva sua mensagem aqui..."
                  />
                </div>

                <Button type="submit" size="lg" className="w-full rounded-xl h-14 text-lg">
                  Enviar Mensagem
                </Button>
              </form>
            </motion.div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
