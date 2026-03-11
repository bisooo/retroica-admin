import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DashboardShell } from "@/components/dashboard-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <TooltipProvider>
      <DashboardShell user={{ email: user.email }}>
        {children}
      </DashboardShell>
    </TooltipProvider>
  )
}
