import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0F1729]">
      <DashboardSidebar />

        <DashboardHeader />
        <main className="p-8 text-white">{children}</main>
      </div>
    
  )
}

