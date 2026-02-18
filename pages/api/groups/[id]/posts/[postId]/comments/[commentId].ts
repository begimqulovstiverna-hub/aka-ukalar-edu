import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const { id, postId, commentId } = req.query

  if (!id || typeof id !== 'string' || !postId || typeof postId !== 'string' || !commentId || typeof commentId !== 'string') {
    return res.status(400).json({ message: 'ID noto\'g\'ri' })
  }

  // DELETE - commentni o'chirish
  if (req.method === 'DELETE') {
    if (!session) {
      return res.status(401).json({ message: 'Ruxsat yo\'q' })
    }

    try {
      // Comment muallifi yoki adminligini tekshirish
      const comment = await prisma.groupComment.findUnique({
        where: { id: commentId }
      })

      if (!comment) {
        return res.status(404).json({ message: 'Comment topilmadi' })
      }

      const member = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: id,
            userId: session.user.id
          }
        }
      })

      const isAuthor = comment.userId === session.user.id
      const isAdmin = member?.role === 'admin' || session.user.role === 'admin'

      if (!isAuthor && !isAdmin) {
        return res.status(403).json({ message: 'Siz bu commentni o\'chira olmaysiz' })
      }

      await prisma.groupComment.delete({
        where: { id: commentId }
      })

      return res.status(200).json({ message: 'Comment o\'chirildi' })
    } catch (error) {
      console.error('DELETE comment error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
