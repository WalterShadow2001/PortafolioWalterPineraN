import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export function getDb(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const tursoUrl = process.env.TURSO_URL
    const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

    if (!tursoUrl) {
      throw new Error('TURSO_URL environment variable is not set')
    }
    if (!tursoAuthToken) {
      throw new Error('TURSO_AUTH_TOKEN environment variable is not set')
    }

    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: tursoAuthToken,
    })

    globalForPrisma.prisma = new PrismaClient({
      adapter,
    })
  }

  return globalForPrisma.prisma
}
