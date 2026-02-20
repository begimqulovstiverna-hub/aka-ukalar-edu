import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import formidable from 'formidable'
import cloudinary from 'cloudinary'
import fs from 'fs'

// Cloudinary sozlamalari (Vercel environment variable'lariga qo'shing)
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const config = {
  api: { bodyParser: false },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  const session = await getServerSession(req, res, authOptions)

  // Admin yoki creator ruxsati
  if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'creator')) {
    return res.status(403).json({ message: 'Ruxsat yo\'q' })
  }

  try {
    const form = formidable({})
    const [fields, files] = await form.parse(req)
    const file = files.image?.[0]

    if (!file) return res.status(400).json({ message: 'Rasm tanlanmagan' })

    // Cloudinary ga yuklash
    const result = await cloudinary.v2.uploader.upload(file.filepath, {
      folder: 'aka-ukalar/courses',
      public_id: `course-${Date.now()}`,
      overwrite: true,
    })

    // Vaqtinchalik faylni o'chirish
    fs.unlink(file.filepath, (err) => {
      if (err) console.error('Temp faylni o\'chirishda xatolik:', err)
    })

    return res.status(200).json({
      message: 'Rasm muvaffaqiyatli yuklandi',
      imageUrl: result.secure_url,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ message: 'Rasm yuklashda xatolik' })
  }
}
