"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        // Supabase often logs the user in immediately on signup if email confirmation is disabled,
        // or throws an error. If we get here, it succeeded.
      }
      if (email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (err: any) {
      if (err.message === "Invalid login credentials") {
        setError("Email ou senha incorretos.")
      } else if (err.message === "User already registered") {
        setError("Este email já está cadastrado. Faça login.")
      } else {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-premium p-8 relative overflow-hidden"
      >
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-3xl font-bold text-primary mb-2 block">
            Polaroid
          </Link>
          <h1 className="text-xl font-medium">
            {isLogin ? "Acesse sua conta" : "Crie sua conta"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLogin 
              ? "Para visualizar e salvar seus pedidos." 
              : "Guarde suas memórias com segurança."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Seu e-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              className="w-full px-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-muted/30"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              className="w-full px-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-muted/30"
            />
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-sm p-3 bg-red-50 rounded-lg overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isLogin ? "Entrar" : "Criar Conta"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? (
            <p>
              Ainda não tem uma conta?{" "}
              <button 
                onClick={() => { setIsLogin(false); setError(""); }} 
                className="text-primary font-medium hover:underline"
              >
                Criar agora
              </button>
            </p>
          ) : (
            <p>
              Já possui uma conta?{" "}
              <button 
                onClick={() => { setIsLogin(true); setError(""); }} 
                className="text-primary font-medium hover:underline"
              >
                Fazer login
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
