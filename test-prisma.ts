import { prisma } from './lib/prisma'

async function test() {
  console.log('Modellar:', Object.keys(prisma).filter(k => !k.startsWith('_')).join(', '))
  await prisma.$disconnect()
}

test()

