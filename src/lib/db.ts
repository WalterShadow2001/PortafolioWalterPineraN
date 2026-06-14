import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const libsql = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  })

  const adapter = new PrismaLibSql(libsql)

  return new PrismaClient({
    adapter,
  })
}

// Only create the client if we have the required env vars
// During build time, env vars may not be available
export const db = globalForPrisma.prisma ?? (
  process.env.DATABASE_URL ? createPrismaClient() : (undefined as unknown as PrismaClient)
)

if (process.env.NODE_ENV !== 'production' && process.env.DATABASE_URL) globalForPrisma.prisma = db
