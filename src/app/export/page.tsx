"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { fabric } from "fabric"
import { jsPDF } from "jspdf"
import { Loader2, Download, CheckCircle, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

function ExportContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  
  const [status, setStatus] = useState("Iniciando exportação...")
  const [progress, setProgress] = useState(0)
  const [isDone, setIsDone] = useState(false)
  const [error, setError] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!orderId) {
      setError("ID do pedido não encontrado.")
      return
    }

    const generatePDF = async () => {
      try {
        setStatus("Buscando dados do pedido...")
        let order = null;
        const { data: directData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()

        if (directData) {
          order = directData;
        } else {
          // Fallback para admin (fura o bloqueio do RLS)
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
            const res = await fetch(`/api/admin/orders?email=${session?.user?.email}`);
            const adminData = await res.json();
            order = adminData.orders?.find((o: any) => o.id === orderId);
          }
        }

        if (!order) throw new Error("Pedido não encontrado.")

        setStatus("Buscando catálogo de molduras...")
        const { data: dbTemplates, error: templatesError } = await supabase.from('templates').select('*')
        if (templatesError) throw new Error("Erro ao buscar molduras.")
        const templates = dbTemplates || []
        
        const isGrande = order.size === 'grande'
        // Resolução 300 DPI (Pixels)
        const canvasWidth = isGrande ? 826 : 661
        const canvasHeight = isGrande ? 1181 : 803
        
        // Medidas reais em milímetros para o PDF
        const pdfWidthMm = isGrande ? 70 : 56
        const pdfHeightMm = isGrande ? 100 : 68

        // O layout precisa ser escalado proporcionalmente da nossa base de 400px (usada no editor)
        const scaleFactor = canvasWidth / 400

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: [pdfWidthMm, pdfHeightMm]
        })

        // Instanciar um canvas oculto
        const canvas = new fabric.Canvas(canvasRef.current, {
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor: '#ffffff'
        })

        const images = order.images || []
        
        for (let i = 0; i < images.length; i++) {
          const imgData = images[i]
          setStatus(`Processando imagem ${i + 1} de ${images.length}...`)
          setProgress(Math.round(((i) / images.length) * 100))
          
          canvas.clear()
          canvas.backgroundColor = '#ffffff'

          // Descobrir o layout e o frame
          const currentTemplateObj = templates.find((t:any) => t.id === imgData.templateId) || templates[0]
          if (!currentTemplateObj) throw new Error("Moldura não encontrada no catálogo.")
          
          const frameUrl = isGrande ? currentTemplateObj.grande_url : currentTemplateObj.mini_url
          const textColor = currentTemplateObj.text_color

          // Layout base em proporção 400px
          let photoArea = isGrande 
            ? { x: 0, y: 0, width: 400, height: 500 }
            : { x: 0, y: 0, width: 400, height: 430 }
          
          let textArea = isGrande 
            ? { x: 20, y: 470, width: 360 }
            : { x: 20, y: 400, width: 360 }

          // Escalar layout para 300 DPI
          photoArea = {
            x: photoArea.x * scaleFactor,
            y: photoArea.y * scaleFactor,
            width: photoArea.width * scaleFactor,
            height: photoArea.height * scaleFactor
          }
          textArea = {
            x: textArea.x * scaleFactor,
            y: textArea.y * scaleFactor,
            width: textArea.width * scaleFactor
          }

          // 1. Carregar a foto original do usuário no fundo
          await new Promise<void>((resolve) => {
            fabric.Image.fromURL(imgData.url, (img) => {
              // Calcular cover (corte perfeito) para a photoArea
              let scale = Math.max(
                photoArea.width / (img.width || 1),
                photoArea.height / (img.height || 1)
              )
              
              let left = photoArea.x;
              let top = photoArea.y;

              // Apply cropData if it exists
              if (imgData.cropData && imgData.cropData.left !== undefined) {
                 scale = imgData.cropData.scaleX * scaleFactor;
                 left = imgData.cropData.left * scaleFactor;
                 top = imgData.cropData.top * scaleFactor;
              } else {
                 // Center it if no crop data
                 left = photoArea.x + (photoArea.width - (img.width || 1) * scale) / 2;
                 top = photoArea.y + (photoArea.height - (img.height || 1) * scale) / 2;
              }
              
              img.set({
                left: left,
                top: top,
                scaleX: scale,
                scaleY: scale,
              })

              // Mascarar a imagem para não vazar da photoArea
              img.clipPath = new fabric.Rect({
                left: photoArea.x,
                top: photoArea.y,
                width: photoArea.width,
                height: photoArea.height,
                absolutePositioned: true
              })
              
              canvas.add(img)
              canvas.sendToBack(img)
              resolve()
            }, { crossOrigin: 'anonymous' })
          })

          // 2. Adicionar o Frame (a moldura) por cima
          await new Promise<void>((resolve) => {
            fabric.Image.fromURL(frameUrl, (frame) => {
              frame.set({
                originX: 'left',
                originY: 'top',
                left: 0,
                top: 0,
                scaleX: canvasWidth / (frame.width || 1),
                scaleY: canvasHeight / (frame.height || 1),
              })
              canvas.add(frame)
              resolve()
            }, { crossOrigin: 'anonymous' })
          })

          // 3. Adicionar o texto (se existir)
          if (imgData.text) {
             const family = order.font_family === 'sans' ? 'var(--font-poppins)' : order.font_family === 'serif' ? 'var(--font-playfair)' : order.font_family || 'var(--font-poppins)';
             const textObj = new fabric.Textbox(imgData.text, {
                left: textArea.x,
                top: textArea.y,
                width: textArea.width,
                fontFamily: family,
                fontSize: (order.font_size || 24) * scaleFactor, // Escalar a fonte também
                fill: textColor,
                textAlign: 'center',
                originX: 'left',
                backgroundColor: "rgba(255, 255, 255, 0.85)"
              })
              canvas.add(textObj)
              canvas.bringToFront(textObj)
          }

          canvas.renderAll()

          // Adicionar a página no PDF
          const dataUrl = canvas.toDataURL({ format: 'jpeg', quality: 1.0 })
          
          if (i > 0) {
            pdf.addPage([pdfWidthMm, pdfHeightMm])
          }
          
          pdf.setPage(i + 1)
          pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidthMm, pdfHeightMm)
        }

        setProgress(100)
        setStatus("PDF gerado com sucesso!")
        
        // Baixar PDF
        pdf.save(`Pedido_${orderId.split('-')[0]}.pdf`)
        setIsDone(true)

      } catch (err: any) {
        console.error(err)
        setError(err.message)
      }
    }

    generatePDF()
  }, [orderId])

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-premium text-center"
      >
        {/* Canvas Oculto para processamento */}
        <div style={{ display: 'none' }}>
          <canvas ref={canvasRef} />
        </div>

        {error ? (
          <div>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-serif font-bold text-red-500 mb-2">Ops, algo deu errado</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.close()} variant="outline" className="w-full">
              Fechar Janela
            </Button>
          </div>
        ) : isDone ? (
          <div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-2xl font-serif font-bold text-green-500 mb-2">Download Concluído!</h2>
            <p className="text-muted-foreground mb-6">
              O arquivo PDF com suas polaroids em alta resolução já deve estar no seu computador.
            </p>
            <Button onClick={() => window.close()} variant="outline" className="w-full">
              Fechar Janela
            </Button>
          </div>
        ) : (
          <div>
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-serif font-bold mb-2">Gerando Polaroids HD</h2>
            <p className="text-muted-foreground mb-8">{status}</p>
            
            <div className="w-full bg-muted rounded-full h-3 mb-2 overflow-hidden">
              <motion.div 
                className="bg-primary h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm font-medium text-right text-muted-foreground">{progress}%</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function ExportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <ExportContent />
    </Suspense>
  )
}
