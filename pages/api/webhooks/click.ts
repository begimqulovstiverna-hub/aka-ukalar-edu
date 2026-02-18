import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { payment_id, status, amount } = req.body

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: payment_id }
    })

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    // Click to'lov holatini tekshirish
    if (status === 'paid' && payment.status === 'pending') {
      // To'lovni tasdiqlash
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment_id },
          data: { 
            status: 'paid',
            paidAt: new Date()
          }
        }),
        prisma.purchase.create({
          data: {
            userId: payment.userId,
            courseId: payment.courseId,
            paymentId: payment.id
          }
        })
      ])
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Click webhook error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}
