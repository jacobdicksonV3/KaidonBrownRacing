import { useState, useRef } from 'react'

import { Upload, X, Loader2, GripVertical } from 'lucide-react'

import { Input } from 'src/components/ui/input'

export interface ProductImageItem {
  key: string
  url: string
  position: number
  attributeValue: string
}

interface MultiImageUploadProps {
  images: ProductImageItem[]
  onChange: (images: ProductImageItem[]) => void
  attributeValues?: string[]
}

const MultiImageUpload = ({ images, onChange, attributeValues }: MultiImageUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dropIdx, setDropIdx] = useState<number | null>(null)
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
      const newImage: ProductImageItem = {
        key: crypto.randomUUID(),
        url: data.url,
        position: images.length,
        attributeValue: '',
      }
      onChange([...images, newImage])
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    // If it's a reorder drag, handle that
    if (dragIdx !== null && dropIdx !== null && dragIdx !== dropIdx) {
      const reordered = [...images]
      const [moved] = reordered.splice(dragIdx, 1)
      reordered.splice(dropIdx, 0, moved)
      onChange(reordered.map((img, i) => ({ ...img, position: i })))
      setDragIdx(null)
      setDropIdx(null)
      return
    }

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) uploadFile(file)
  }

  const removeImage = (key: string) => {
    const filtered = images.filter((img) => img.key !== key)
    onChange(filtered.map((img, i) => ({ ...img, position: i })))
  }

  const updateAttributeValue = (key: string, value: string) => {
    onChange(images.map((img) => (img.key === key ? { ...img, attributeValue: value } : img)))
  }

  const handleReorderDragStart = (e: React.DragEvent, idx: number) => {
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleReorderDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    setDropIdx(idx)
  }

  const handleReorderDragEnd = () => {
    if (dragIdx !== null && dropIdx !== null && dragIdx !== dropIdx) {
      const reordered = [...images]
      const [moved] = reordered.splice(dragIdx, 1)
      reordered.splice(dropIdx, 0, moved)
      onChange(reordered.map((img, i) => ({ ...img, position: i })))
    }
    setDragIdx(null)
    setDropIdx(null)
  }

  return (
    <div className="mt-1 space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, idx) => (
            <div
              key={img.key}
              draggable
              onDragStart={(e) => handleReorderDragStart(e, idx)}
              onDragOver={(e) => handleReorderDragOver(e, idx)}
              onDragEnd={handleReorderDragEnd}
              className={`group relative rounded-lg border transition-all ${
                dragIdx === idx
                  ? 'border-racing-red opacity-50'
                  : dropIdx === idx && dragIdx !== null
                    ? 'border-gold'
                    : 'border-white/10'
              }`}
            >
              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={img.url}
                  alt={`Product ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(img.key)}
                  className="absolute top-1 right-1 rounded-full bg-black/80 p-1 text-white/60 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="absolute top-1 left-1 cursor-grab rounded bg-black/60 p-0.5 text-white/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <GripVertical className="h-3.5 w-3.5" />
                </div>
                {idx === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-gold/90 px-1.5 py-0.5 text-[10px] font-bold text-black">
                    MAIN
                  </span>
                )}
              </div>
              {attributeValues && attributeValues.length > 0 && (
                <div className="p-2">
                  <select
                    value={img.attributeValue}
                    onChange={(e) => updateAttributeValue(img.key, e.target.value)}
                    className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70 focus:border-racing-red focus:outline-none"
                  >
                    <option value="">No attribute</option>
                    {attributeValues.map((val) => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
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
            <Loader2 className="mb-2 h-6 w-6 animate-spin text-white/30" />
            <p className="text-sm text-white/40">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="mb-2 h-5 w-5 text-white/30" />
            <p className="text-sm text-white/50">
              <span className="font-medium text-racing-red">Click to upload</span> or drag and drop
            </p>
            <p className="mt-1 text-xs text-white/30">PNG, JPG, WebP up to 10MB</p>
          </>
        )}
      </div>

      {images.length > 1 && (
        <p className="text-xs text-white/30">Drag images to reorder. First image is the main product photo.</p>
      )}
    </div>
  )
}

export default MultiImageUpload
