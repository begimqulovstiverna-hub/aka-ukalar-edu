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

  // GET - bitta postni olish
  if (req.method === 'GET') {
    try {
      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          user: { select: { name: true, email: true, role: true } },
          course: { select: { title: true } },
          comments: {
            include: {
              user: { select: { name: true, role: true } }
            },
            orderBy: { createdAt: 'asc' }
          }
        }
      })

      if (!post) {
        return res.status(404).json({ message: 'Post topilmadi' })
      }

      return res.status(200).json(post)
    } catch (error) {
      console.error('GET error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  // PUT - postni tahrirlash
  if (req.method === 'PUT') {
    if (!session) {
      return res.status(401).json({ message: 'Tahrirlash uchun tizimga kiring' })
    }

    const { title, content } = req.body

    try {
      const post = await prisma.post.findUnique({ where: { id } })
      
      if (!post) {
        return res.status(404).json({ message: 'Post topilmadi' })
      }

      if (post.userId !== session.user.id && session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Siz faqat o\'z postingizni tahrirlay olasiz' })
      }

      const updatedPost = await prisma.post.update({
        where: { id },
        data: { title, content },
        include: {
          user: { select: { name: true } }
        }
      })

      return res.status(200).json(updatedPost)
    } catch (error) {
      console.error('PUT error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  // DELETE - postni o'chirish
  if (req.method === 'DELETE') {
    if (!session) {
      return res.status(401).json({ message: 'O\'chirish uchun tizimga kiring' })
    }

    try {
      const post = await prisma.post.findUnique({ where: { id } })
      
      if (!post) {
        return res.status(404).json({ message: 'Post topilmadi' })
      }

      if (post.userId !== session.user.id && session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Siz faqat o\'z postingizni o\'chira olasiz' })
      }

      await prisma.post.delete({ where: { id } })
      return res.status(200).json({ message: 'Post o\'chirildi' })
    } catch (error) {
      console.error('DELETE error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
