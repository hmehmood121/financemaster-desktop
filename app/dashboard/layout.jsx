import { DashboardSidebar } from "@/components/layout/sidebar"

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1">{children}</div>
    </div>
  )
}

