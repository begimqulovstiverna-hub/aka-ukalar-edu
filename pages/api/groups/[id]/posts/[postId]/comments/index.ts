import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const { id, postId } = req.query

  if (!id || typeof id !== 'string' || !postId || typeof postId !== 'string') {
    return res.status(400).json({ message: 'ID noto\'g\'ri' })
  }

  // POST - yangi comment yozish
  if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ message: 'Comment yozish uchun tizimga kiring' })
    }

    try {
      // A'zolikni tekshirish
      const member = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: id,
            userId: session.user.id
          }
        }
      })

      if (!member) {
        return res.status(403).json({ message: 'Siz guruh a\'zosi emassiz' })
      }

      const { content, parentId } = req.body

      if (!content) {
        return res.status(400).json({ message: 'Comment matni majburiy' })
      }

      const comment = await prisma.groupComment.create({
        data: {
          content,
          postId,
          userId: session.user.id
        },
        include: {
          user: {
            select: { id: true, name: true, image: true, role: true }
          }
        }
      })

      return res.status(201).json(comment)
    } catch (error) {
      console.error('POST comment error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
