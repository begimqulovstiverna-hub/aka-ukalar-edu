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

  // POST - reaction qo'shish yoki o'chirish
  if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ message: 'Reaction qo\'shish uchun tizimga kiring' })
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

      const { type } = req.body

      if (!type || !['👍', '❤️', '😂', '😮', '😢', '😡'].includes(type)) {
        return res.status(400).json({ message: 'Noto\'g\'ri reaction turi' })
      }

      // Reaction mavjudligini tekshirish
const existing = await prisma.groupReaction.findUnique({
  where: {
    postId_userId_type: {
      postId,
      userId: session.user.id,
      type
    }
  }
})
      if (existing) {
        // Reaction o'chirish
        await prisma.groupReaction.delete({
          where: {
            postId_userId_type: {
              postId,
              userId: session.user.id,
              type
            }
          }
        })
        return res.status(200).json({ message: 'Reaction o\'chirildi' })
      } else {
        // Reaction qo'shish
        const reaction = await prisma.groupReaction.create({
          data: {
            type,
            postId,
            userId: session.user.id
          }
        })
        return res.status(201).json(reaction)
      }
    } catch (error) {
      console.error('POST reaction error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
