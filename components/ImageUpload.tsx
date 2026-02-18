import { useState } from 'react'
import { motion } from 'framer-motion'

interface ImageUploadProps {
  currentImage?: string
  onImageUploaded: (imageUrl: string) => void
}

export default function ImageUpload({ currentImage, onImageUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImage || '')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview ko'rsatish
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Rasmni yuklash
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (res.ok) {
        onImageUploaded(data.url)
      } else {
        alert('Rasm yuklashda xatolik')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Rasm yuklashda xatolik')
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.div 
      style={styles.container}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={styles.input}
        id="image-upload"
        disabled={uploading}
      />
      <label htmlFor="image-upload" style={styles.label}>
        {preview ? (
          <img src={preview} alt="Preview" style={styles.preview} />
        ) : (
          <div style={styles.placeholder}>
            {uploading ? (
              <motion.div 
                style={styles.spinner}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                ⭕
              </motion.div>
            ) : (
              <>
                <span style={styles.plusIcon}>+</span>
                <span style={styles.uploadText}>Rasm yuklash</span>
              </>
            )}
          </div>
        )}
      </label>
    </motion.div>
  )
}

const styles = {
  container: {
    position: 'relative' as const,
    width: '150px',
    height: '150px',
    cursor: 'pointer'
  },
  input: {
    display: 'none'
  },
  label: {
    display: 'block',
    width: '100%',
    height: '100%',
    cursor: 'pointer'
  },
  preview: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: '4px solid #fff',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  },
  placeholder: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    border: '4px solid rgba(255,255,255,0.5)'
  },
  plusIcon: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '0.25rem'
  },
  uploadText: {
    fontSize: '0.8rem',
    opacity: 0.9
  },
  spinner: {
    fontSize: '2rem'
  }
}
