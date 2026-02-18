import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'
import fs from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'Ruxsat yo\'q' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return res.status(404).json({ message: 'Foydalanuvchi topilmadi' })
    }

    // Eski rasmni o'chirish
    if (user.image && user.image.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', user.image)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null }
    })

    return res.status(200).json({ message: 'Rasm muvaffaqiyatli o\'chirildi' })
  } catch (error) {
    console.error('Delete avatar error:', error)
    return res.status(500).json({ message: 'Server xatoligi' })
  }
}
