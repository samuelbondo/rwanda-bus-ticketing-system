import { useRef, useState } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { uploadService } from '@/services/uploadService'
import { clsx } from 'clsx'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  folder: 'buses' | 'avatars' | 'general'
  label?: string
  className?: string
  shape?: 'square' | 'circle'
}

export default function ImageUpload({
  value,
  onChange,
  folder,
  label = 'Upload image',
  className,
  shape = 'square',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('Only image files allowed'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Max file size is 5 MB'); return }
    setError('')
    setUploading(true)
    try {
      const url = await uploadService.uploadImage(file, folder)
      onChange(url)
    } catch {
      setError('Upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </p>
      )}

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={clsx(
          'relative flex cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed transition-colors',
          shape === 'circle' ? 'rounded-full' : 'rounded-xl',
          uploading
            ? 'border-primary-300 bg-primary-50 dark:bg-primary-900/10'
            : 'border-gray-200 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-600',
          shape === 'circle' ? 'h-20 w-20' : 'h-36 w-full'
        )}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="preview"
              className={clsx(
                'h-full w-full object-cover',
                shape === 'circle' ? 'rounded-full' : 'rounded-xl'
              )}
            />
            {/* Remove button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange('') }}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            <p className="text-xs text-primary-600">Uploading…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            {shape === 'circle'
              ? <ImageIcon className="h-6 w-6 text-gray-300" />
              : <Upload className="h-6 w-6 text-gray-300" />
            }
            {shape !== 'circle' && (
              <p className="text-xs text-gray-400">Click or drag to upload · Max 5 MB</p>
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}
