import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID noto\'g\'ri' })
  }

  // DELETE - commentni o'chirish
  if (req.method === 'DELETE') {
    if (!session) {
      return res.status(401).json({ message: 'O\'chirish uchun tizimga kiring' })
    }

    try {
      const comment = await prisma.comment.findUnique({ where: { id } })
      
      if (!comment) {
        return res.status(404).json({ message: 'Comment topilmadi' })
      }

      if (comment.userId !== session.user.id && session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Siz faqat o\'z commentingizni o\'chira olasiz' })
      }

      await prisma.comment.delete({ where: { id } })
      return res.status(200).json({ message: 'Comment o\'chirildi' })
    } catch (error) {
      console.error('DELETE error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  // PUT - commentni tahrirlash
  if (req.method === 'PUT') {
    if (!session) {
      return res.status(401).json({ message: 'Tahrirlash uchun tizimga kiring' })
    }

    const { content } = req.body

    try {
      const comment = await prisma.comment.findUnique({ where: { id } })
      
      if (!comment) {
        return res.status(404).json({ message: 'Comment topilmadi' })
      }

      if (comment.userId !== session.user.id && session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Siz faqat o\'z commentingizni tahrirlay olasiz' })
      }

      const updatedComment = await prisma.comment.update({
        where: { id },
        data: { content },
        include: {
          user: { select: { name: true } }
        }
      })

      return res.status(200).json(updatedComment)
    } catch (error) {
      console.error('PUT error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
