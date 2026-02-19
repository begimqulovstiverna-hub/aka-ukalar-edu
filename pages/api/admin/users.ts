import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user?.role !== 'creator') {
    return res.status(403).json({ message: 'Ruxsat yo\'q' })
  }

  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      })
      return res.status(200).json(users)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  if (req.method === 'PUT') {
    const { userId, role } = req.body
    if (!userId || !role) {
      return res.status(400).json({ message: 'userId va role talab qilinadi' })
    }
    if (userId === session.user.id) {
      return res.status(400).json({ message: 'O\'z rolingizni o\'zgartira olmaysiz' })
    }

    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { role }
      })
      return res.status(200).json(updated)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
