import { DashboardSidebar } from "@/components/layout/sidebar"
import { NewsletterSubscription } from "@/components/newsletter-subscription"

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col ml-64">
        <div className="flex-1">{children}</div>
        <NewsletterSubscription />
      </div>
    </div>
  )
}

