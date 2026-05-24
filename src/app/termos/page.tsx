import Header from "@/components/shared/Header"
import Footer from "@/components/shared/Footer"

export const metadata = {
  title: 'Termos de Uso | Polaroom',
  description: 'Termos de Uso e Política de Privacidade da Polaroom',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-8">Termos de Uso</h1>
        
        <div className="max-w-none text-muted-foreground">
          <p className="text-lg mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-3">1. Aceitação dos Termos</h2>
            <p className="leading-relaxed">Ao acessar e usar o site Polaroom, você concorda em cumprir e ficar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não poderá acessar o serviço.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-3">2. Uso do Serviço e Criação de Conteúdo</h2>
            <p className="leading-relaxed">O Polaroom oferece ferramentas para o enquadramento automático e geração de arquivos digitais (PDF) e impressos de fotos estilo polaroid. Você é o único responsável pelas imagens que envia. Não é permitido o envio de conteúdo ilegal, ofensivo, difamatório ou que infrinja direitos autorais.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-3">3. Compras e Pagamentos</h2>
            <p className="leading-relaxed">As compras podem ser feitas por cartão de crédito ou Pix, processadas por meio de plataformas parceiras de pagamento seguras (Asaas). O serviço digital é disponibilizado para download imediatamente após a confirmação do pagamento. Pedidos físicos serão produzidos e enviados para o endereço fornecido no ato da compra.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-3">4. Política de Reembolso e Trocas</h2>
            <p className="leading-relaxed">Por se tratar de um produto personalizado gerado sob demanda, não oferecemos reembolso para os arquivos digitais após a conclusão e liberação do PDF. Para produtos físicos, o reembolso ou troca só será aceito em caso de defeito de fabricação ou dano comprovado durante o transporte.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-3">5. Privacidade e Proteção de Dados</h2>
            <p className="leading-relaxed">Respeitamos a sua privacidade. Suas imagens originais enviadas são processadas e armazenadas temporariamente em servidores seguros (Supabase) apenas com o propósito de gerar as suas polaroids. Não vendemos ou compartilhamos os seus dados pessoais ou imagens com terceiros.</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-3">6. Propriedade Intelectual</h2>
            <p className="leading-relaxed">Os designs das molduras, tipografia e inteligência do sistema pertencem à Polaroom e nossos desenvolvedores. As fotos contidas no interior das molduras, enviadas por você, continuam sendo de sua total e exclusiva propriedade.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">7. Alterações nos Termos</h2>
            <p className="leading-relaxed">Reservamo-nos o direito, a nosso exclusivo critério, de modificar ou substituir estes Termos a qualquer momento. Quaisquer alterações entrarão em vigor imediatamente após a publicação no site.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
