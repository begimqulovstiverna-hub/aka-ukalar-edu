import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import formidable from 'formidable'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Supabase admin client (service_role kaliti bilan)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Vercelga qo'shish kerak
)

export const config = {
  api: { bodyParser: false },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)

  // Admin yoki creator ruxsati
  if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'creator')) {
    return res.status(403).json({ message: 'Ruxsat yo\'q' })
  }

  try {
    const form = formidable({})
    const [fields, files] = await form.parse(req)
    const file = files.image?.[0]

    if (!file) {
      return res.status(400).json({ message: 'Rasm tanlanmagan' })
    }

    // Faylni o'qish
    const fileContent = fs.readFileSync(file.filepath)

    // Fayl nomi va yo'li
    const fileName = `courses/${Date.now()}-${file.originalFilename}`
    
    // Supabase Storage ga yuklash
    const { data, error } = await supabaseAdmin.storage
      .from('images') // bucket nomi
      .upload(fileName, fileContent, {
        contentType: file.mimetype || 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      })

    // Vaqtinchalik faylni o'chirish
    fs.unlink(file.filepath, (err) => {
      if (err) console.error('Temp faylni o\'chirishda xatolik:', err)
    })

    if (error) {
      console.error('Supabase upload error:', error)
      return res.status(500).json({ message: 'Rasm yuklashda xatolik' })
    }

    // Rasmning public URL'ini olish
    const { data: urlData } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(fileName)

    return res.status(200).json({
      message: 'Rasm muvaffaqiyatli yuklandi',
      imageUrl: urlData.publicUrl,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ message: 'Rasm yuklashda xatolik' })
  }
}
