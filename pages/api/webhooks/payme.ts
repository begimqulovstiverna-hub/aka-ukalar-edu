import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id, state, amount, account } = req.body

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: account.payment_id }
    })

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    // Payme to'lov holatini tekshirish
    if (state === 2 && payment.status === 'pending') { // 2 = muvaffaqiyatli to'lov
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: account.payment_id },
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

    return res.status(200).json({ result: { success: true } })
  } catch (error) {
    console.error('Payme webhook error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}
