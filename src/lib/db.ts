import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// For Turso/libSQL, we use the Prisma libSQL adapter
// We need to defer the actual client creation to avoid build-time evaluation
let _prisma: PrismaClient | undefined = undefined

export function getDb(): PrismaClient {
  if (!_prisma) {
    // These are imported dynamically to prevent build-time evaluation
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require('@prisma/adapter-libsql')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@libsql/client')

    const libsql = createClient({
      url: process.env.DATABASE_URL!,
      authToken: process.env.DATABASE_AUTH_TOKEN!,
    })

    const adapter = new PrismaLibSql(libsql)

    _prisma = new PrismaClient({
      adapter,
    })

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = _prisma
    }
  }

  return _prisma
}
