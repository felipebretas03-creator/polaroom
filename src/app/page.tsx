"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Header from "@/components/shared/Header"
import Footer from "@/components/shared/Footer"
import { Sparkles, Image as ImageIcon, Wand2, Truck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Abstract background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="absolute top-40 -right-40 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex flex-col gap-6"
            >
              <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium w-fit">
                <Sparkles className="w-4 h-4" />
                <span>Transforme fotos em emoções</span>
              </motion.div>
              
              <motion.h1 variants={fadeIn} className="font-serif text-5xl md:text-7xl font-bold leading-tight text-primary">
                Suas memórias, <br/>
                <span className="italic text-accent">eternizadas.</span>
              </motion.h1>
              
              <motion.p variants={fadeIn} className="text-lg md:text-xl text-muted-foreground max-w-xl">
                Envie suas fotos e deixe nosso sistema criar polaroids perfeitas, com enquadramento inteligente e design premium. Receba impressas na sua casa ou baixe o arquivo digital na hora!
              </motion.p>
              
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/editor">
                  <Button size="lg" className="w-full sm:w-auto shadow-premium text-lg">
                    Criar minhas Polaroids
                  </Button>
                </Link>
                <Link href="#templates">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg">
                    Ver Templates
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              className="relative mx-auto w-full max-w-md lg:max-w-none"
            >
              <div className="relative aspect-[4/5] w-full max-w-sm mx-auto shadow-premium rounded-sm bg-white p-4 rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="aspect-square bg-muted w-full mb-4 overflow-hidden rounded-sm relative">
                  <Image src="/casal.png" alt="Summer '26" fill className="object-cover" />
                </div>
                <div className="font-serif text-2xl text-center text-primary/80 mb-2">Summer '26</div>
              </div>
              
              <div className="absolute -bottom-10 -left-10 aspect-[4/5] w-64 shadow-premium rounded-sm bg-white p-3 -rotate-6 hidden md:block">
                 <div className="aspect-square bg-muted w-full mb-3 overflow-hidden rounded-sm relative">
                  <Image src="/paris-photo.png" alt="Paris" fill className="object-cover" />
                </div>
                <div className="font-serif text-xl text-center text-primary/80">Paris</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">Como funciona</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Em apenas três passos suas fotos ganham vida com a ajuda da nossa ferramenta de corte inteligente.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform duration-300">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Envie suas fotos</h3>
              <p className="text-muted-foreground">Faça o upload de suas fotos.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform duration-300">
                <Wand2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Enquadramento Mágico</h3>
              <p className="text-muted-foreground">Nosso sistema analisa cada foto e realiza o corte (crop) e centralização perfeita automaticamente.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 text-green-500 group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Escolha como receber</h3>
              <p className="text-muted-foreground">Baixe o PDF em alta resolução na mesma hora ou escolha receber as polaroids já impressas, no conforto da sua casa!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Preview */}
      <section id="templates" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-4xl font-bold text-primary mb-4">Estilos Premium</h2>
              <p className="text-muted-foreground text-lg max-w-xl">Escolha o template que mais combina com a sua vibe. Do clássico ao moderno.</p>
            </div>
            <Link href="/editor" className="hidden md:block">
              <Button variant="ghost">Ver todos os estilos &rarr;</Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {[
              { label: "Clássico", img: "/molduras/normal 7x10 cm.png" },
              { label: "Coração", img: "/molduras/coração 7x10 cm.png" },
              { label: "Flor", img: "/molduras/flor 7x10 cm.png" },
              { label: "Praia", img: "/molduras/praia 7x10 cm.png" },
              { label: "Infantil", img: "/molduras/infantil 7x10 cm.png" },
              { label: "Infantil 02", img: "/molduras/infantil 02 7x10 cm.png" },
            ].map((style, i) => (
              <motion.div 
                key={style.label}
                whileHover={{ y: -10 }}
                className="bg-white p-3 sm:p-4 shadow-sm rounded-xl cursor-pointer hover:shadow-premium transition-all duration-300 border border-black/5"
              >
                <div className="aspect-[4/5] bg-muted w-full mb-3 sm:mb-4 rounded-sm overflow-hidden relative border border-black/5 flex items-center justify-center">
                  <Image src={style.img} alt={style.label} fill className="object-cover" />
                </div>
                <div className="font-medium text-center text-xs sm:text-sm">{style.label}</div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 md:hidden flex justify-center">
             <Link href="/editor">
              <Button variant="outline">Ver todos os estilos</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="font-serif text-5xl font-bold mb-6">Pronto para reviver seus melhores momentos?</h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">Não deixe suas fotos esquecidas no rolo da câmera. Transforme-as em polaroids incríveis hoje mesmo.</p>
          <Link href="/editor">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-12 h-16 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-shadow">
              Começar a criar
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
