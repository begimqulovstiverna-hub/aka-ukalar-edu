import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Ruxsat yo\'q' })
  }

  try {
    // Uploads papkasini yaratish
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filename: (name, ext, part) => {
        return `course-${Date.now()}${ext}`
      }
    })

    const [fields, files] = await form.parse(req)
    const file = files.image?.[0]

    if (!file) {
      return res.status(400).json({ message: 'Rasm tanlanmagan' })
    }

    const imageUrl = `/uploads/${path.basename(file.filepath)}`

    return res.status(200).json({ 
      message: 'Rasm muvaffaqiyatli yuklandi',
      imageUrl 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ message: 'Rasm yuklashda xatolik' })
  }
}
