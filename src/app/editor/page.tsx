"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Header from "@/components/shared/Header"
import { Upload, SlidersHorizontal, Image as ImageIcon, Type, Download, CreditCard, Loader2, CheckCircle, Truck, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const FabricCanvas = dynamic(() => import("@/components/editor/FabricCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-[400px] h-[480px] bg-white rounded-md flex items-center justify-center shadow-premium">
      <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
    </div>
  )
})

interface PolaroidImage {
  id: string;
  url: string;
  file?: File;
  text: string;
  templateId: string;
  cropData: any | null;
  size: "grande" | "mini";
}

export default function EditorPage() {
  const [images, setImages] = useState<PolaroidImage[]>([])
  const [fontFamily, setFontFamily] = useState("serif")
  const [fontSize, setFontSize] = useState(24)
  const [templateVariant, setTemplateVariant] = useState("")
  
  const [deliveryMethod, setDeliveryMethod] = useState<"digital" | "printed">("digital")
  const [uploadSize, setUploadSize] = useState<"grande" | "mini">("grande")

  const [isUploading, setIsUploading] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerCpf, setCustomerCpf] = useState("")

  const [shippingCep, setShippingCep] = useState("")
  const [shippingStreet, setShippingStreet] = useState("")
  const [shippingNumber, setShippingNumber] = useState("")
  const [shippingNeighborhood, setShippingNeighborhood] = useState("")
  const [shippingCity, setShippingCity] = useState("")
  const [shippingState, setShippingState] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const [templates, setTemplates] = useState<any[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)

  useEffect(() => {
    async function fetchTemplates() {
      const { data } = await supabase.from('templates').select('*').order('created_at', { ascending: true })
      if (data && data.length > 0) {
        setTemplates(data)
        setTemplateVariant(data[0].id)
      }
      setIsLoadingTemplates(false)
    }
    fetchTemplates()
  }, [])

  const layoutGrande = {
    width: 400,
    height: 571,
    photoArea: { x: 0, y: 0, width: 400, height: 500 },
    textArea: { x: 20, y: 470, width: 360 }
  };

  const layoutMini = {
    width: 400,
    height: 485,
    photoArea: { x: 0, y: 0, width: 400, height: 430 },
    textArea: { x: 20, y: 400, width: 360 }
  };

  const grandesCount = images.filter(i => i.size === 'grande').length;
  const minisCount = images.filter(i => i.size === 'mini').length;

  let totalPrice = 0;
  let printedPrice = 0;
  const shippingFee = 15.90;

  if (deliveryMethod === 'printed') {
    const kitsGrande = Math.max(0, Math.ceil(grandesCount / 8));
    const kitsMini = Math.max(0, Math.ceil(minisCount / 12));
    const totalKits = kitsGrande + kitsMini;
    
    if (totalKits > 0) {
       printedPrice = 19.90 + Math.max(0, totalKits - 3) * 3.00;
       totalPrice = printedPrice + shippingFee;
    }
  } else {
    if (grandesCount > 0) {
      const extraGrandes = Math.max(0, grandesCount - 8);
      totalPrice += 7.50 + (extraGrandes * 0.75);
    }
    if (minisCount > 0) {
      const extraMinis = Math.max(0, minisCount - 12);
      totalPrice += 5.00 + (extraMinis * 0.50);
    }
  }

  const handleUploadClick = (size: "grande" | "mini") => {
    setUploadSize(size);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const files = Array.from(e.target.files);
    
    const newImages: PolaroidImage[] = files.map((file, i) => ({
      id: `img_${Date.now()}_${i}`,
      url: URL.createObjectURL(file),
      file,
      text: "",
      templateId: templateVariant,
      cropData: null,
      size: uploadSize
    }));

    setImages(prev => [...prev, ...newImages]);
    setIsUploading(false);
  }

  const handleTextChange = (id: string, newText: string) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, text: newText } : img));
  }

  const handleImageTemplateChange = (id: string, newTemplateId: string) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, templateId: newTemplateId } : img));
  }

  const handleGlobalTemplateChange = (tmplId: string) => {
    setTemplateVariant(tmplId);
    setImages(prev => prev.map(img => ({ ...img, templateId: tmplId })));
  }

  const handleCheckout = async () => {
    if (images.length === 0) return;
    setIsCheckingOut(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Você precisa fazer login ou criar uma conta antes de finalizar o pedido!");
        window.open("/login", "_blank");
        setIsCheckingOut(false);
        return;
      }

      const user = session.user;
      
      const uploadedImages = [];
      
      for (const img of images) {
        if (!img.file) continue;
        
        const fileExt = img.file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('polaroids')
          .upload(fileName, img.file);
          
        if (error) throw new Error("Erro ao enviar foto: " + error.message);
        
        const { data: publicUrlData } = supabase.storage
          .from('polaroids')
          .getPublicUrl(fileName);
          
        uploadedImages.push({
          url: publicUrlData.publicUrl,
          text: img.text,
          templateId: img.templateId,
          cropData: img.cropData,
          size: img.size
        });
      }

      const shippingAddress = deliveryMethod === 'printed' ? {
        cep: shippingCep,
        street: shippingStreet,
        number: shippingNumber,
        neighborhood: shippingNeighborhood,
        city: shippingCity,
        state: shippingState
      } : null;

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          images: uploadedImages,
          font_family: fontFamily,
          font_size: fontSize,
          status: 'pending_payment',
          delivery_method: deliveryMethod,
          shipping_address: shippingAddress,
          grandes_count: grandesCount,
          minis_count: minisCount,
          size: grandesCount > 0 ? 'grande' : 'mini'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const response = await fetch('/api/checkout/asaas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerCpf,
          grandesCount,
          minisCount,
          deliveryMethod,
          orderId: orderData?.id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        const errorDetails = result.details ? JSON.stringify(result.details) : result.error;
        throw new Error("Erro Asaas: " + errorDetails);
      }
      
      setIsCheckingOut(false);
      setCheckoutUrl(result.invoiceUrl);
      window.location.href = result.invoiceUrl;

    } catch (error: any) {
      alert("Ocorreu um erro: " + error.message);
      setIsCheckingOut(false);
    }
  }
  
  const canCheckout = images.length > 0 && customerName && customerEmail && customerCpf && 
    (deliveryMethod === 'digital' || (shippingCep && shippingStreet && shippingNumber && shippingNeighborhood && shippingCity && shippingState));

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20 flex flex-col-reverse md:flex-row md:h-[calc(100vh)]">
        {/* Left Sidebar - Controls */}
        <div className="w-full md:w-80 bg-white border-r border-black/5 p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h2 className="font-serif text-2xl font-bold mb-1 text-primary">Personalizar</h2>
            <p className="text-sm text-muted-foreground mb-6">Deixe as polaroids com a sua cara.</p>
          </div>
          
          <div className="space-y-6">
            {/* Delivery Method */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-sm">Método de Entrega</h3>
              </div>
              <select 
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value as "digital" | "printed")}
                className="w-full px-3 py-3 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm"
              >
                <option value="digital">Somente Digital (Baixar PDF)</option>
                <option value="printed">Receber Impresso em Casa</option>
              </select>
            </div>

            {/* Template Selection */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-sm">Template Padrão</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {isLoadingTemplates ? (
                  <div className="col-span-2 text-center py-4 text-muted-foreground text-sm">Carregando molduras...</div>
                ) : templates.map((tmpl) => (
                  <button 
                    key={tmpl.id}
                    onClick={() => handleGlobalTemplateChange(tmpl.id)}
                    className={`border-2 rounded-lg p-2 flex flex-col items-center gap-2 transition-colors ${templateVariant === tmpl.id ? "border-primary bg-primary/5" : "border-transparent hover:border-black/10 hover:bg-muted"}`}
                  >
                    <div className="w-full aspect-[4/5] bg-muted rounded-sm border border-black/10 relative overflow-hidden flex items-center justify-center">
                       <img src={tmpl.grande_url} alt={tmpl.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-medium">{tmpl.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Type className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-sm">Fonte do Texto</h3>
              </div>
              <div className="flex flex-col gap-2">
                <select 
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-3 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm"
                  style={{ fontFamily: fontFamily === 'sans' ? 'var(--font-poppins)' : fontFamily === 'serif' ? 'var(--font-playfair)' : fontFamily }}
                >
                  <option value="sans" className="font-sans">Poppins (Clássica)</option>
                  <option value="serif" className="font-serif">Playfair (Elegante)</option>
                  <option value="'Bigtimes'" style={{ fontFamily: "'Bigtimes'" }}>Bigtimes</option>
                  <option value="'Diamond Dreams'" style={{ fontFamily: "'Diamond Dreams'" }}>Diamond Dreams</option>
                  <option value="'Malline'" style={{ fontFamily: "'Malline'" }}>Malline</option>
                  <option value="'Study Daily'" style={{ fontFamily: "'Study Daily'" }}>Study Daily</option>
                  <option value="'The Storyline'" style={{ fontFamily: "'The Storyline'" }}>The Storyline</option>
                </select>
              </div>

              <div className="flex items-center gap-2 mb-3 mt-4">
                <Type className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-sm">Tamanho da Fonte</h3>
              </div>
              <div className="flex flex-col gap-2">
                <select 
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full px-3 py-3 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm"
                >
                  <option value={16}>Pequena (16px)</option>
                  <option value={20}>Média (20px)</option>
                  <option value={24}>Padrão (24px)</option>
                  <option value={28}>Grande (28px)</option>
                  <option value={32}>Extra Grande (32px)</option>
                </select>
              </div>
            </div>

            {/* Customer Details */}
            <div className="pt-4 border-t border-black/5 mt-2">
              <h3 className="font-medium text-sm mb-3">Seus Dados</h3>
              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder="Seu Nome Completo" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input 
                  type="email" 
                  placeholder="Seu E-mail" 
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input 
                  type="text" 
                  placeholder="CPF (Apenas números)" 
                  value={customerCpf}
                  onChange={(e) => setCustomerCpf(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {deliveryMethod === 'printed' && (
              <div className="pt-4 border-t border-black/5 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h3 className="font-medium text-sm">Endereço de Entrega</h3>
                </div>
                <div className="flex flex-col gap-3">
                  <input type="text" placeholder="CEP" value={shippingCep} onChange={(e) => setShippingCep(e.target.value)} className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <input type="text" placeholder="Rua" value={shippingStreet} onChange={(e) => setShippingStreet(e.target.value)} className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <div className="flex gap-2">
                    <input type="text" placeholder="Número" value={shippingNumber} onChange={(e) => setShippingNumber(e.target.value)} className="w-1/3 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input type="text" placeholder="Bairro" value={shippingNeighborhood} onChange={(e) => setShippingNeighborhood(e.target.value)} className="w-2/3 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Cidade" value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} className="w-2/3 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input type="text" placeholder="UF" maxLength={2} value={shippingState} onChange={(e) => setShippingState(e.target.value.toUpperCase())} className="w-1/3 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary uppercase" />
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="pt-4 border-t border-black/5 mt-2 bg-muted/30 p-3 rounded-lg">
              <div className="text-sm font-medium mb-3">Resumo do Pedido</div>
              
              {grandesCount > 0 && (
                <div className="flex justify-between text-sm mb-2 text-muted-foreground">
                  <span>{grandesCount}x Polaroids Grandes</span>
                  {deliveryMethod === 'digital' && <span>R$ {((grandesCount > 8 ? 7.50 + ((grandesCount - 8) * 0.75) : 7.50)).toFixed(2).replace('.', ',')}</span>}
                </div>
              )}
              {minisCount > 0 && (
                <div className="flex justify-between text-sm mb-2 text-muted-foreground">
                  <span>{minisCount}x Polaroids Minis</span>
                  {deliveryMethod === 'digital' && <span>R$ {((minisCount > 12 ? 5.00 + ((minisCount - 12) * 0.50) : 5.00)).toFixed(2).replace('.', ',')}</span>}
                </div>
              )}

              {deliveryMethod === 'printed' && (
                <>
                  <div className="flex justify-between text-sm mb-2 text-muted-foreground border-t border-black/5 pt-2">
                    <span>Custo de Impressão</span>
                    <span>R$ {printedPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2 text-muted-foreground">
                    <span>Frete</span>
                    <span>R$ {shippingFee.toFixed(2).replace('.', ',')}</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-black/10">
                <span>Total</span>
                <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
            
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleCheckout} 
              disabled={images.length === 0 || isCheckingOut || isUploading || !canCheckout}
            >
              {isCheckingOut ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              Finalizar Pedido
            </Button>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative bg-muted/30 p-8 overflow-y-auto">
          <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          {images.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-2xl border-2 border-dashed border-primary/20 p-12 flex flex-col items-center justify-center text-center transition-colors"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
                    <h3 className="text-xl font-medium mb-2">Processando fotos...</h3>
                    <p className="text-muted-foreground text-sm">Analisando e cortando automaticamente.</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Envie suas fotos</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      Você pode misturar polaroids Grandes (7x10cm) e Minis (5,6x6,8cm) no mesmo pedido. Selecione o tamanho que deseja enviar agora.
                    </p>
                    <div className="flex gap-4">
                      <Button onClick={() => handleUploadClick("grande")}>+ Grandes</Button>
                      <Button variant="secondary" onClick={() => handleUploadClick("mini")}>+ Minis</Button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-bold">Suas Polaroids</h2>
                  <p className="text-muted-foreground">{grandesCount} Grandes, {minisCount} Minis</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setImages([])} className="flex-1 sm:flex-none">
                    Refazer Tudo
                  </Button>
                  <Button onClick={() => handleUploadClick("grande")} className="flex-1 sm:flex-none">
                    + Grandes
                  </Button>
                  <Button variant="secondary" onClick={() => handleUploadClick("mini")} className="flex-1 sm:flex-none">
                    + Minis
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 pb-12">
                {images.map((img, index) => {
                  const imgTemplateObj = templates.find(t => t.id === img.templateId) || templates[0];
                  if (!imgTemplateObj) return null;
                  
                  const imgFrameUrl = img.size === "grande" ? imgTemplateObj.grande_url : imgTemplateObj.mini_url;
                  const currentLayout = img.size === "grande" ? layoutGrande : layoutMini;

                  const imgTemplate = {
                    frameUrl: imgFrameUrl,
                    textColor: imgTemplateObj.text_color,
                    ...currentLayout
                  };

                  return (
                  <motion.div 
                    key={img.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col items-center"
                  >
                    <div className="shadow-premium relative mb-4 w-full flex justify-center">
                      <FabricCanvas 
                        imageUrl={img.url}
                        text={img.text}
                        fontFamily={fontFamily}
                        textColor={imgTemplate.textColor}
                        template={imgTemplate}
                        cropData={img.cropData}
                        fontSize={fontSize}
                        onCropChange={(data) => {
                          setImages(prev => prev.map(i => i.id === img.id ? { ...i, cropData: data } : i))
                        }}
                      />
                    </div>
                    <div className="w-[80%] max-w-[250px] mt-2">
                      <div className="text-xs text-center mb-1 text-muted-foreground font-medium uppercase tracking-wider">
                         {img.size === "grande" ? "Tamanho Grande" : "Tamanho Mini"}
                      </div>
                      <select 
                        value={img.templateId}
                        onChange={(e) => handleImageTemplateChange(img.id, e.target.value)}
                        className="w-full px-3 py-2 mb-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm"
                      >
                        {templates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <textarea 
                        value={img.text}
                        onChange={(e) => handleTextChange(img.id, e.target.value)}
                        placeholder="Escreva a legenda..."
                        maxLength={200}
                        rows={2}
                        className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm text-center resize-none"
                      />
                    </div>
                  </motion.div>
                )})}
              </div>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {checkoutUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-2">Tudo Certo!</h3>
              <p className="text-muted-foreground mb-8 text-sm">
                Suas polaroids foram salvas com sucesso. Clique abaixo para realizar o pagamento.
              </p>
              <div className="w-full space-y-3">
                <Button 
                  className="w-full text-base py-6" 
                  onClick={() => window.location.href = checkoutUrl}
                >
                  Ir para o Pagamento
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground"
                  onClick={() => setCheckoutUrl(null)}
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
