import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// For Turso/libSQL, we use the Prisma libSQL adapter
// We need to defer the actual client creation to avoid build-time evaluation
let _prisma: PrismaClient | undefined = undefined

export function getDb(): PrismaClient {
  if (!_prisma) {
    // Turso connection details
    const tursoUrl = process.env.TURSO_URL
    const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

    if (!tursoUrl) {
      throw new Error('TURSO_URL environment variable is not set')
    }
    if (!tursoAuthToken) {
      throw new Error('TURSO_AUTH_TOKEN environment variable is not set')
    }

    // These are imported dynamically to prevent build-time evaluation
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require('@prisma/adapter-libsql')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@libsql/client')

    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoAuthToken,
    })

    const adapter = new PrismaLibSql(libsql)

    // When using an adapter, Prisma 7 still reads DATABASE_URL from env for internal
    // validation. Setting DATABASE_URL to a valid SQLite URL satisfies this check.
    // The actual database connection is handled by the adapter.
    _prisma = new PrismaClient({
      adapter,
    })

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = _prisma
    }
  }

  return _prisma
}
