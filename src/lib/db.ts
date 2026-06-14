import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Dynamic imports to avoid build-time evaluation issues
  const { PrismaLibSql } = require('@prisma/adapter-libsql')
  const { createClient } = require('@libsql/client')

  const libsql = createClient({
    url: process.env.DATABASE_URL ?? 'libsql://localhost:8080',
    authToken: process.env.DATABASE_AUTH_TOKEN ?? '',
  })

  const adapter = new PrismaLibSql(libsql)

  return new PrismaClient({
    adapter,
  })
}

export function getDb(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

// For backwards compatibility - lazy getter
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const actualDb = getDb()
    const value = (actualDb as any)[prop]
    if (typeof value === 'function') {
      return value.bind(actualDb)
    }
    return value
  }
})
