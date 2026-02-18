import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const { id, postId } = req.query

  if (!id || typeof id !== 'string' || !postId || typeof postId !== 'string') {
    return res.status(400).json({ message: 'ID noto\'g\'ri' })
  }

  // DELETE - postni o'chirish
  if (req.method === 'DELETE') {
    if (!session) {
      return res.status(401).json({ message: 'Ruxsat yo\'q' })
    }

    try {
      // Post muallifi yoki adminligini tekshirish
      const post = await prisma.groupPost.findUnique({
        where: { id: postId },
        include: { group: true }
      })

      if (!post) {
        return res.status(404).json({ message: 'Post topilmadi' })
      }

      const member = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: id,
            userId: session.user.id
          }
        }
      })

      const isAuthor = post.userId === session.user.id
      const isAdmin = member?.role === 'admin' || session.user.role === 'admin'

      if (!isAuthor && !isAdmin) {
        return res.status(403).json({ message: 'Siz bu postni o\'chira olmaysiz' })
      }

      await prisma.groupPost.delete({
        where: { id: postId }
      })

      return res.status(200).json({ message: 'Post o\'chirildi' })
    } catch (error) {
      console.error('DELETE post error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
