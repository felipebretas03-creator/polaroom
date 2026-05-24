"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Upload, Loader2, Image as ImageIcon, Package, Settings, LogOut, CheckSquare, Search, Truck, FileText, Download } from "lucide-react"
import React from "react"

const ADMIN_EMAIL = "felipebretas03@gmail.com"

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState<any>(null)
  
  const [templates, setTemplates] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  
  const [isUploading, setIsUploading] = useState(false)
  const [uploadName, setUploadName] = useState("")
  const [uploadTextColor, setUploadTextColor] = useState("#000000")
  
  const [selectedFileGrande, setSelectedFileGrande] = useState<File | null>(null)
  const [selectedFileMini, setSelectedFileMini] = useState<File | null>(null)
  
  const fileInputGrandeRef = useRef<HTMLInputElement>(null)
  const fileInputMiniRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.email !== ADMIN_EMAIL) {
      router.push("/")
      return
    }
    setUser(session.user)
    fetchTemplates()
    
    // Fetch orders immediately to calculate dashboard metrics
    const fetchAllOrders = async () => {
      try {
        const res = await fetch(`/api/admin/orders?email=${session.user.email}`)
        const data = await res.json()
        if (data.orders) setOrders(data.orders)
      } catch (e) {
        console.error("Failed to fetch orders", e)
      }
    }
    fetchAllOrders()
    
    setLoading(false)
  }

  const fetchTemplates = async () => {
    const { data, error } = await supabase.from('templates').select('*').order('created_at', { ascending: false })
    if (data) setTemplates(data)
  }

  const fetchOrders = async () => {
    setIsLoadingOrders(true)
    try {
      const res = await fetch(`/api/admin/orders?email=${user?.email}`)
      const data = await res.json()
      if (data.orders) setOrders(data.orders)
    } catch (e) {
      console.error("Failed to fetch orders", e)
    }
    setIsLoadingOrders(false)
  }

  useEffect(() => {
    if (activeTab === 'pedidos' && orders.length === 0 && user) {
      fetchOrders()
    }
  }, [activeTab, user])

  const calculateOrderTotal = (order: any) => {
    let totalPrice = 0;
    const grandesCount = order.grandes_count || 0;
    const minisCount = order.minis_count || 0;
    
    if (order.delivery_method === 'printed') {
      const kitsGrande = Math.max(0, Math.ceil(grandesCount / 8));
      const kitsMini = Math.max(0, Math.ceil(minisCount / 12));
      const totalKits = kitsGrande + kitsMini;
      const printedPrice = totalKits > 0 ? 19.90 + Math.max(0, totalKits - 3) * 3.00 : 0;
      totalPrice = printedPrice > 0 ? printedPrice + 15.90 : 0;
    } else {
      const extraGrandes = Math.max(0, grandesCount - 8);
      if (grandesCount > 0) totalPrice += 7.50 + (extraGrandes * 0.75);
      
      const extraMinis = Math.max(0, minisCount - 12);
      if (minisCount > 0) totalPrice += 5.00 + (extraMinis * 0.50);
    }
    return totalPrice;
  }

  const totalVendido = orders
    .filter(o => o.status === 'paid' || o.status === 'shipped')
    .reduce((acc, order) => acc + calculateOrderTotal(order), 0);

  const totalPedidos = orders.filter(o => o.status === 'paid' || o.status === 'shipped').length;

  const faltaReceber = orders
    .filter(o => o.status === 'pending_payment')
    .reduce((acc, order) => acc + calculateOrderTotal(order), 0);


  const markAsShipped = async (orderId: string) => {
    const { error } = await supabase.from('orders').update({ status: 'shipped' }).eq('id', orderId)
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'shipped' } : o))
    } else {
      alert("Erro ao atualizar status.")
    }
  }

  const downloadOriginals = async (images: any[]) => {
    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      try {
        const response = await fetch(img.url)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `original_${i + 1}.jpg`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        await new Promise(res => setTimeout(res, 500))
      } catch (e) {
        console.error("Erro ao baixar imagem", e)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">Pago</span>
      case 'pending_payment': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-medium">Aguardando</span>
      case 'shipped': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">Enviado/Finalizado</span>
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">{status}</span>
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFileGrande || !selectedFileMini || !uploadName) {
      alert("Por favor, preencha todos os campos e selecione os dois arquivos PNG.")
      return
    }

    setIsUploading(true)
    try {
      // 1. Upload Grande
      const extGrande = selectedFileGrande.name.split('.').pop()
      const nameGrande = `${Date.now()}-grande-${Math.random().toString(36).substring(7)}.${extGrande}`
      const { error: errGrande } = await supabase.storage.from('molduras').upload(nameGrande, selectedFileGrande)
      if (errGrande) throw errGrande
      const { data: urlGrande } = supabase.storage.from('molduras').getPublicUrl(nameGrande)

      // 2. Upload Mini
      const extMini = selectedFileMini.name.split('.').pop()
      const nameMini = `${Date.now()}-mini-${Math.random().toString(36).substring(7)}.${extMini}`
      const { error: errMini } = await supabase.storage.from('molduras').upload(nameMini, selectedFileMini)
      if (errMini) throw errMini
      const { data: urlMini } = supabase.storage.from('molduras').getPublicUrl(nameMini)

      // 3. Insert into table
      const { error: insertError } = await supabase
        .from('templates')
        .insert({
          name: uploadName,
          grande_url: urlGrande.publicUrl,
          mini_url: urlMini.publicUrl,
          text_color: uploadTextColor
        })

      if (insertError) throw insertError

      // Reset form
      setUploadName("")
      setUploadTextColor("#000000")
      setSelectedFileGrande(null)
      setSelectedFileMini(null)
      if (fileInputGrandeRef.current) fileInputGrandeRef.current.value = ""
      if (fileInputMiniRef.current) fileInputMiniRef.current.value = ""
      
      fetchTemplates()
      alert("Moldura adicionada com sucesso!")
    } catch (error: any) {
      alert("Erro ao enviar moldura: " + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (template: any) => {
    if (!confirm(`Tem certeza que deseja deletar a moldura "${template.name}"?`)) return
    
    try {
      // Deletar a imagem grande do storage
      if (template.grande_url) {
        const fileName = template.grande_url.split('/').pop()
        if (fileName) await supabase.storage.from('molduras').remove([fileName])
      }
      
      // Deletar a imagem mini do storage
      if (template.mini_url) {
        const fileName = template.mini_url.split('/').pop()
        if (fileName) await supabase.storage.from('molduras').remove([fileName])
      }

      // Deletar do banco
      const { error } = await supabase.from('templates').delete().eq('id', template.id)
      if (error) throw error
      
      fetchTemplates()
    } catch (error: any) {
      alert("Erro ao deletar: " + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border hidden md:flex flex-col">
        <div className="p-6 border-b border-border flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <span className="font-serif text-2xl font-bold tracking-tight">Polaroom<span className="text-primary">Admin</span></span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-zinc-50'}`}
          >
            <Settings className="w-5 h-5" />
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('molduras')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${activeTab === 'molduras' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-zinc-50'}`}
          >
            <ImageIcon className="w-5 h-5" />
            Molduras
          </button>
          <button 
            onClick={() => setActiveTab('pedidos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${activeTab === 'pedidos' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-zinc-50'}`}
          >
            <Package className="w-5 h-5" />
            Pedidos
          </button>
        </nav>
        <div className="p-4 border-t border-border">
          <button 
            onClick={() => { supabase.auth.signOut(); router.push('/'); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg font-medium text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white border-b border-border h-16 flex items-center px-8 justify-between shrink-0">
          <h2 className="font-semibold text-lg capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
          </div>
        </header>

        <div className="p-8 flex-1">
          {activeTab === 'molduras' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
              {/* Formulário de Upload */}
              <div className="col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-border sticky top-8">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" /> Adicionar Nova
                  </h2>
                  
                  <form onSubmit={handleUpload} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700">Nome da Moldura</label>
                      <input 
                        type="text" 
                        required
                        value={uploadName}
                        onChange={e => setUploadName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 bg-zinc-50/50"
                        placeholder="Ex: Dia dos Pais"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700">Cor do Texto da Legenda</label>
                      <select 
                        value={uploadTextColor}
                        onChange={e => setUploadTextColor(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 bg-zinc-50/50"
                      >
                        <option value="#000000">Preto (Para fundos claros)</option>
                        <option value="#FFFFFF">Branco (Para fundos escuros)</option>
                      </select>
                    </div>

                    {/* Upload GRANDE */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700 flex items-center justify-between">
                        Arquivo PNG (Grande)
                        <span className="text-xs text-muted-foreground">7x10 cm</span>
                      </label>
                      <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center bg-zinc-50/50 hover:bg-zinc-100 transition-colors cursor-pointer relative overflow-hidden group">
                        <input 
                          type="file" 
                          accept="image/png"
                          required
                          ref={fileInputGrandeRef}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) setSelectedFileGrande(e.target.files[0])
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {selectedFileGrande ? (
                          <div className="text-center">
                            <ImageIcon className="w-6 h-6 text-primary mx-auto mb-1" />
                            <p className="text-xs font-medium text-primary line-clamp-1 px-2">{selectedFileGrande.name}</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="w-6 h-6 text-zinc-400 group-hover:text-primary transition-colors mx-auto mb-1" />
                            <p className="text-xs font-medium text-zinc-600">Clique ou arraste</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Upload MINI */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-zinc-700 flex items-center justify-between">
                        Arquivo PNG (Mini)
                        <span className="text-xs text-muted-foreground">5,6x6,8 cm</span>
                      </label>
                      <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center bg-zinc-50/50 hover:bg-zinc-100 transition-colors cursor-pointer relative overflow-hidden group">
                        <input 
                          type="file" 
                          accept="image/png"
                          required
                          ref={fileInputMiniRef}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) setSelectedFileMini(e.target.files[0])
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {selectedFileMini ? (
                          <div className="text-center">
                            <ImageIcon className="w-6 h-6 text-primary mx-auto mb-1" />
                            <p className="text-xs font-medium text-primary line-clamp-1 px-2">{selectedFileMini.name}</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="w-6 h-6 text-zinc-400 group-hover:text-primary transition-colors mx-auto mb-1" />
                            <p className="text-xs font-medium text-zinc-600">Clique ou arraste</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button type="submit" disabled={isUploading} className="w-full mt-2">
                      {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Moldura'}
                    </Button>
                  </form>
                </div>
              </div>

              {/* Lista de Molduras */}
              <div className="col-span-1 xl:col-span-2">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
                  <h2 className="text-lg font-semibold mb-6 flex items-center justify-between">
                    Catálogo Atual
                    <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-sm font-medium">{templates.length} ativas</span>
                  </h2>
                  
                  {templates.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-border rounded-xl bg-zinc-50/50">
                      <ImageIcon className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                      <p className="text-zinc-500 font-medium">Nenhuma moldura no banco de dados.</p>
                      <p className="text-sm text-zinc-400 mt-1">Adicione a sua primeira moldura no formulário ao lado.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {templates.map(template => (
                        <div key={template.id} className="group relative">
                          <div className="aspect-[4/5] w-full bg-zinc-100 rounded-xl overflow-hidden relative flex items-center justify-center border border-border/50">
                            {/* Usa a url grande como miniatura principal */}
                            <img src={template.grande_url} alt={template.name} className="object-contain w-full h-full drop-shadow-sm p-2" />
                            
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center backdrop-blur-sm gap-2">
                              <span className="text-white/80 text-xs font-medium px-2 py-1 bg-black/50 rounded-md">2 Tamanhos Ativos</span>
                              <button 
                                onClick={() => handleDelete(template)}
                                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110 mt-2"
                                title="Deletar moldura"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 text-center">
                            <p className="font-medium text-zinc-900 text-sm">{template.name}</p>
                            <div className="flex items-center justify-center gap-1.5 mt-1">
                              <div className="w-3 h-3 rounded-full border border-zinc-200" style={{ backgroundColor: template.text_color }} />
                              <span className="text-[10px] text-zinc-500 uppercase tracking-wide">{template.text_color === '#000000' ? 'Texto Preto' : 'Texto Branco'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pedidos' && (
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-black/5">
                <h3 className="font-semibold text-lg">Pedidos Recebidos</h3>
                <Button variant="outline" size="sm" onClick={fetchOrders} disabled={isLoadingOrders}>
                  {isLoadingOrders ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                  Atualizar
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4 font-medium">Pedido / ID</th>
                      <th className="px-6 py-4 font-medium">Data</th>
                      <th className="px-6 py-4 font-medium">Tipo</th>
                      <th className="px-6 py-4 font-medium">Fotos</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {isLoadingOrders ? (
                      <tr><td colSpan={6} className="px-6 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" /></td></tr>
                    ) : orders.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Nenhum pedido encontrado.</td></tr>
                    ) : (
                      orders.map((order) => (
                        <React.Fragment key={order.id}>
                          <tr className="hover:bg-muted/20 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs">{order.id.split('-')[0]}</td>
                            <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                            <td className="px-6 py-4">
                              {order.delivery_method === 'printed' ? (
                                <span className="flex items-center gap-1 text-primary font-medium"><Truck className="w-4 h-4"/> Impresso</span>
                              ) : (
                                <span className="flex items-center gap-1 text-muted-foreground"><Download className="w-4 h-4"/> Digital</span>
                              )}
                            </td>
                            <td className="px-6 py-4">{order.grandes_count || 0} Grandes<br/>{order.minis_count || 0} Minis</td>
                            <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                            <td className="px-6 py-4">
                              <Button variant="ghost" size="sm" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                                {expandedOrder === order.id ? "Fechar" : "Detalhes"}
                              </Button>
                            </td>
                          </tr>
                          {expandedOrder === order.id && (
                            <tr className="bg-primary/5 border-b border-black/5">
                              <td colSpan={6} className="px-6 py-6">
                                <div className="flex flex-col lg:flex-row gap-8">
                                  {order.delivery_method === 'printed' && order.shipping_address && (
                                    <div className="flex-1 bg-white p-4 rounded-lg border border-black/5">
                                      <h3 className="font-semibold mb-3 flex items-center gap-2"><Truck className="w-4 h-4 text-primary" /> Endereço</h3>
                                      <p className="text-sm text-muted-foreground mb-1"><strong>CEP:</strong> {order.shipping_address.cep}</p>
                                      <p className="text-sm text-muted-foreground mb-1"><strong>Rua:</strong> {order.shipping_address.street}, {order.shipping_address.number}</p>
                                      <p className="text-sm text-muted-foreground mb-1"><strong>Bairro:</strong> {order.shipping_address.neighborhood}</p>
                                      <p className="text-sm text-muted-foreground"><strong>Cidade:</strong> {order.shipping_address.city} - {order.shipping_address.state}</p>
                                    </div>
                                  )}
                                  <div className="flex-1 flex flex-col gap-3">
                                    <h3 className="font-semibold mb-1">Arquivos</h3>
                                    <div className="flex flex-wrap gap-2">
                                      <Button variant="outline" className="bg-white" onClick={() => window.open(`/export?id=${order.id}`, '_blank')}>
                                        <FileText className="w-4 h-4 mr-2" /> Baixar PDF Montado
                                      </Button>
                                      <Button variant="outline" className="bg-white" onClick={() => downloadOriginals(order.images || [])}>
                                        <ImageIcon className="w-4 h-4 mr-2" /> Baixar Originais
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex-1 flex flex-col gap-3">
                                    <h3 className="font-semibold mb-1">Controle</h3>
                                    {order.status === 'paid' ? (
                                      <Button onClick={() => markAsShipped(order.id)} className="w-fit">
                                        <CheckSquare className="w-4 h-4 mr-2" /> Marcar como Finalizado
                                      </Button>
                                    ) : order.status === 'shipped' ? (
                                      <div className="text-sm text-green-600 font-medium flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Finalizado</div>
                                    ) : (
                                      <div className="text-sm text-muted-foreground">Ainda não pago.</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-serif font-bold text-primary mb-2">Visão Geral</h3>
                <p className="text-muted-foreground text-sm">Acompanhe as métricas e o desempenho da sua loja.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Total Vendido</div>
                  <div className="text-3xl font-bold text-primary">R$ {totalVendido.toFixed(2).replace('.', ',')}</div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Pedidos Realizados</div>
                  <div className="text-3xl font-bold text-primary">{totalPedidos}</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Falta Receber (Pendentes)</div>
                  <div className="text-3xl font-bold text-orange-500">R$ {faltaReceber.toFixed(2).replace('.', ',')}</div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'config' && (
             <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
             <div className="p-12 text-center text-muted-foreground">
                Configurações gerais do sistema em construção.
             </div>
           </div>
          )}
        </div>
      </main>
    </div>
  )
}
