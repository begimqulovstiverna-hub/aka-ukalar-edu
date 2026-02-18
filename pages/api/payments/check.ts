import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: 'Tizimga kiring' })
  }

  const { paymentId } = req.query

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId as string }
    })

    return res.status(200).json({
      status: payment?.status || 'not_found'
    })
  } catch (error) {
    console.error('Check payment error:', error)
    return res.status(500).json({ message: 'Server xatoligi' })
  }
}
