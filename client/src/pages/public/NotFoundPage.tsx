import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-7xl font-bold text-primary-600">404</p>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Page not found</h1>
      <p className="text-gray-500">The page you're looking for doesn't exist.</p>
      <Button onClick={() => navigate('/')}>Go home</Button>
    </div>
  )
}
