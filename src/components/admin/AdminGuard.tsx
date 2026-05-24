"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Not logged in
        router.push("/login?redirectTo=/admin")
        return
      }

      const userEmail = session.user.email
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL

      if (userEmail === adminEmail) {
        setIsAuthorized(true)
      } else {
        // Logged in but not admin
        router.push("/")
      }
    }

    checkAuth()
  }, [router])

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isAuthorized === true) {
    return <>{children}</>
  }

  return null
}
