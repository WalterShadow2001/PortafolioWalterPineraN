import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let _prisma: PrismaClient | undefined = undefined

export function getDb(): PrismaClient {
  if (!_prisma) {
    const tursoUrl = process.env.TURSO_URL
    const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

    if (!tursoUrl) {
      throw new Error('TURSO_URL environment variable is not set')
    }
    if (!tursoAuthToken) {
      throw new Error('TURSO_AUTH_TOKEN environment variable is not set')
    }

    // In Prisma v6, PrismaLibSQL accepts a config object (not a pre-created client)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')

    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: tursoAuthToken,
    })

    _prisma = new PrismaClient({
      adapter,
    })

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = _prisma
    }
  }

  return _prisma
}
