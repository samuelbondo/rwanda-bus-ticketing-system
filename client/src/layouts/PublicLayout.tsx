import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import AiChat from '@/components/ui/AiChat'
import MaintenanceBanner from '@/components/ui/MaintenanceBanner'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <MaintenanceBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <AiChat welcomeMessage="Hi! Looking to book a bus ticket? I can help you find schedules, check prices, and answer any questions." />
    </div>
  )
}
