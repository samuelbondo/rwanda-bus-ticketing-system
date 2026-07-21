import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface Props {
  onScan: (value: string) => void
  onError?: (err: string) => void
}

export default function QrScanner({ onScan, onError }: Props) {
  const divId = 'qr-reader'
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    const scanner = new Html5Qrcode(divId)
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (text) => { onScan(text) },
      (err) => { onError?.(err) }
    ).catch(() => {})

    return () => {
      scanner.isScanning && scanner.stop().catch(() => {})
    }
  }, [])

  return <div id={divId} className="w-full overflow-hidden rounded-xl" />
}
