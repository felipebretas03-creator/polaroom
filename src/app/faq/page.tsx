"use client"

import Header from "@/components/shared/Header"
import Footer from "@/components/shared/Footer"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Plus, Minus } from "lucide-react"

const faqs = [
  {
    question: "Como funciona o Polaroom?",
    answer: "Você escolhe as suas fotos favoritas, seleciona as molduras (como a Clássica, Praia, Infantil, etc.), ajusta o enquadramento diretamente no nosso site e gera a sua arte digital. Depois, você recebe um arquivo em PDF de alta qualidade pronto para você mesmo imprimir onde quiser."
  },
  {
    question: "Qual é o tamanho das fotos geradas?",
    answer: "Nossas artes são geradas no tamanho exato de 7x10 cm por polaroid, perfeitamente organizadas em um arquivo PDF tamanho A4. Isso facilita muito na hora de imprimir em casa ou em uma gráfica rápida, garantindo o tamanho ideal para guardar ou presentear."
  },
  {
    question: "Posso editar ou ajustar a foto antes de gerar o PDF?",
    answer: "Sim! Nosso editor interativo permite que você arraste a foto, dê zoom e ajuste o recorte exato dentro da moldura que você escolheu. O PDF gerado vai refletir com precisão a edição fina que você fizer na tela."
  },
  {
    question: "Quais são as opções e formatos de molduras?",
    answer: "Temos uma variedade de molduras além da branca clássica, incluindo temas como Coração, Flor, Praia e opções Infantis. Estamos sempre atualizando nosso catálogo com novos designs criativos para suas artes."
  },
  {
    question: "Como recebo o meu arquivo?",
    answer: "Assim que você finalizar a montagem, basta acessar seus pedidos no Dashboard e clicar em 'Baixar PDF'. O arquivo será gerado e baixado instantaneamente no seu navegador, sem custo de frete ou espera de entrega!"
  }
]

const FAQItem = ({ faq, isOpen, onClick }: { faq: typeof faqs[0], isOpen: boolean, onClick: () => void }) => {
  return (
    <div className="border-b border-black/10 last:border-0">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between py-6 text-left focus:outline-none group"
      >
        <span className="font-serif text-xl font-medium text-foreground group-hover:text-primary transition-colors">
          {faq.question}
        </span>
        <div className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
          {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-muted-foreground leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-serif text-5xl font-bold text-foreground mb-6"
            >
              Perguntas Frequentes
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground"
            >
              Tudo o que você precisa saber sobre a criação das suas artes digitais em PDF e como funciona o Polaroom.
            </motion.p>
          </div>

          {/* FAQ Accordion */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 sm:p-10 shadow-premium border border-black/5"
          >
            <div className="flex flex-col">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  faq={faq}
                  isOpen={openIndex === index}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                />
              ))}
            </div>
          </motion.div>
          
          {/* Contact CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 text-center"
          >
            <p className="text-muted-foreground mb-4">Ainda tem alguma dúvida?</p>
            <a 
              href="https://www.instagram.com/thepixeloo/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 py-3 font-medium shadow-premium hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-1"
            >
              Fale com a gente no Instagram
            </a>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
