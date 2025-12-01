// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()
// export default prisma

import { PrismaClient } from '@prisma/client'

// For development (prevents multiple instances during hot reloading)
const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prisma = globalForPrisma.prisma || new PrismaClient()
export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma