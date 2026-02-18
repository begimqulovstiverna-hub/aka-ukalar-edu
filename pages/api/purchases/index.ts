import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'Ruxsat yo\'q' })
  }

  if (req.method === 'GET') {
    try {
      const { userId } = req.query

      if (userId !== session.user.id && session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Ruxsat yo\'q' })
      }

      const purchases = await prisma.purchase.findMany({
        where: { userId: userId as string },
        include: {
          course: {
            select: { id: true, title: true, price: true, image: true }
          },
          payment: true
        },
        orderBy: { createdAt: 'desc' }
      })

      return res.status(200).json(purchases)
    } catch (error) {
      console.error('GET purchases error:', error)
      return res.status(500).json({ message: 'Server xatoligi' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
