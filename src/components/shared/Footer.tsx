import Link from "next/link"
import { Camera, Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <img src="/logo-branco.png" alt="Logo" className="h-10 w-auto" />
            </Link>
            <p className="text-primary-foreground/70 max-w-sm mb-6">
              Transforme suas memórias em artes digitais incríveis com nosso sistema automatizado de fotos polaroid.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-sm bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition-colors">
                Instagram
              </a>
              <a href="#" className="text-sm bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition-colors">
                Twitter
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Produto</h3>
            <ul className="space-y-3">
              <li><Link href="#templates" className="text-primary-foreground/70 hover:text-white transition-colors">Templates</Link></li>
              <li><Link href="#precos" className="text-primary-foreground/70 hover:text-white transition-colors">Preços</Link></li>
              <li><Link href="#como-funciona" className="text-primary-foreground/70 hover:text-white transition-colors">Como Funciona</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Suporte</h3>
            <ul className="space-y-3">
              <li><Link href="/faq" className="text-primary-foreground/70 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/termos" className="text-primary-foreground/70 hover:text-white transition-colors">Termos de Uso</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col items-center justify-center text-sm text-primary-foreground/50 text-center">
          <p>
            © {new Date().getFullYear()} Polaroom. Todos os direitos reservados. &bull; Desenvolvido por <a href="https://www.instagram.com/thepixeloo/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline underline-offset-2">The Pixeloo</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
