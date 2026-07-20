import { useQuery } from '@tanstack/react-query'
import { reportService } from '@/services/adminService'
import { toast } from 'sonner'

export function useReport(period: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', period, from, to],
    queryFn: () => reportService.get(period, from, to),
  })
}

export function useExportReport() {
  return async (period: string, format: 'pdf' | 'csv' | 'excel', from?: string, to?: string) => {
    try {
      const blob = await reportService.export(period, format, from, to)
      const ext = format === 'excel' ? 'xlsx' : format
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${period}.${ext}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed')
    }
  }
}
