import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const models = Object.keys(prisma).filter(k => !k.startsWith('_'))
  return res.status(200).json({ 
    models,
    hasSchedule: models.includes('schedule')
  })
}
