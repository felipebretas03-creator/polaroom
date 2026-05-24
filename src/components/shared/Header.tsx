"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Camera, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            </motion.div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-medium">
            <Link href="/#como-funciona" className="text-muted-foreground hover:text-primary transition-colors">Como Funciona</Link>
            <Link href="/#templates" className="text-muted-foreground hover:text-primary transition-colors">Templates</Link>
            <Link href="/editor" className="text-muted-foreground hover:text-primary transition-colors">Criar Agora</Link>
          </nav>

          {/* Desktop Auth/Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm font-medium text-muted-foreground mr-2">
                  Olá, {user.user_metadata?.first_name || user.email.split('@')[0]}
                </span>
                <Link href="/dashboard">
                  <Button variant="ghost" className="font-medium text-muted-foreground hover:text-foreground">
                    Meus Pedidos
                  </Button>
                </Link>
                <Button variant="outline" className="rounded-full px-6" onClick={handleLogout}>
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="font-medium text-muted-foreground hover:text-foreground">
                    Entrar
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="shadow-premium rounded-full px-6">
                    Começar
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-primary p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass absolute top-20 left-0 right-0 border-t border-white/20 p-4"
        >
          <div className="flex flex-col gap-4">
            <Link href="#como-funciona" onClick={() => setIsOpen(false)} className="px-4 py-2 hover:bg-white/50 rounded-lg">Como Funciona</Link>
            <Link href="#templates" onClick={() => setIsOpen(false)} className="px-4 py-2 hover:bg-white/50 rounded-lg">Templates</Link>
            <Link href="/editor" onClick={() => setIsOpen(false)}>
              <Button className="w-full">Criar Agora</Button>
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="px-4 py-2 hover:bg-white/50 rounded-lg">Meus Pedidos</Link>
                <Button variant="outline" className="w-full" onClick={() => { setIsOpen(false); handleLogout(); }}>Sair</Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)} className="px-4 py-2 hover:bg-white/50 rounded-lg">Entrar</Link>
                <Link href="/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Começar</Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </header>
  )
}
