const { prisma } = require('./lib/prisma')
console.log('Modellar:', Object.keys(prisma).filter(k => !k.startsWith('_')).join(', '))
