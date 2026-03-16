import { useState, useRef } from 'react'

import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'

import { Button } from 'src/components/ui/button'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
}

const ImageUpload = ({ value, onChange }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    setUploading(true)
    try {
      const res = await fetch(
        `/api/uploadImage?filename=${encodeURIComponent(file.name)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()
      onChange(data.url)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) uploadFile(file)
  }

  if (value) {
    return (
      <div className="relative mt-1 inline-block">
        <img
          src={value}
          alt="Product"
          className="h-40 w-40 rounded-lg border border-white/10 object-cover"
        />
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute -top-2 -right-2 rounded-full bg-black/80 p-1 text-white/60 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="mt-1 max-w-[160px] truncate text-xs text-white/30">{value}</p>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`mt-1 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${
        dragOver
          ? 'border-racing-red bg-racing-red/5'
          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {uploading ? (
        <>
          <Loader2 className="mb-2 h-8 w-8 animate-spin text-white/30" />
          <p className="text-sm text-white/40">Uploading...</p>
        </>
      ) : (
        <>
          <div className="mb-3 rounded-full bg-white/5 p-3">
            <Upload className="h-5 w-5 text-white/30" />
          </div>
          <p className="text-sm text-white/50">
            <span className="font-medium text-racing-red">Click to upload</span> or drag and drop
          </p>
          <p className="mt-1 text-xs text-white/30">PNG, JPG, WebP up to 10MB</p>
        </>
      )}
    </div>
  )
}

export default ImageUpload
