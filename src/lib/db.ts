import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient, type Client } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  tursoClient: Client | undefined
}

// Direct Turso client for fast reads (bypasses Prisma overhead)
export function getTursoClient(): Client {
  if (!globalForPrisma.tursoClient) {
    const tursoUrl = process.env.TURSO_URL
    const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

    if (!tursoUrl) {
      throw new Error('TURSO_URL environment variable is not set')
    }
    if (!tursoAuthToken) {
      throw new Error('TURSO_AUTH_TOKEN environment variable is not set')
    }

    globalForPrisma.tursoClient = createClient({
      url: tursoUrl,
      authToken: tursoAuthToken,
    })
  }

  return globalForPrisma.tursoClient
}

// Prisma client for writes (more complex operations)
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

// Fast portfolio data fetch using direct @libsql/client
export async function getPortfolioData() {
  const client = getTursoClient()

  // Get profile
  const profileResult = await client.execute('SELECT * FROM Profile LIMIT 1')
  if (profileResult.rows.length === 0) return null

  const p = profileResult.rows[0]

  // Get all related data in parallel
  const [socialLinks, projects, certificates, experiences, skills] = await Promise.all([
    client.execute('SELECT * FROM SocialLink WHERE profileId = ? ORDER BY createdAt ASC', [p.id as string]),
    client.execute('SELECT * FROM Project WHERE profileId = ? ORDER BY `order` ASC', [p.id as string]),
    client.execute('SELECT * FROM Certificate WHERE profileId = ? ORDER BY `order` ASC', [p.id as string]),
    client.execute('SELECT * FROM Experience WHERE profileId = ? ORDER BY `order` ASC', [p.id as string]),
    client.execute('SELECT * FROM Skill WHERE profileId = ? ORDER BY `order` ASC', [p.id as string]),
  ])

  return {
    id: p.id,
    name: p.name,
    title: p.title,
    photo: p.photo,
    bio: p.bio,
    email: p.email,
    phone: p.phone,
    location: p.location,
    website: p.website,
    primaryColor: p.primaryColor,
    secondaryColor: p.secondaryColor,
    accentColor: p.accentColor,
    backgroundColor: p.backgroundColor,
    textColor: p.textColor,
    theme: p.theme || 'default',
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    socialLinks: socialLinks.rows.map(row => ({
      id: row.id,
      platform: row.platform,
      url: row.url,
      icon: row.icon,
      profileId: row.profileId,
    })),
    projects: projects.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      url: row.url,
      technologies: row.technologies,
      images: row.images,
      startDate: row.startDate,
      endDate: row.endDate,
      featured: row.featured === 1 || row.featured === true,
      order: row.order,
      profileId: row.profileId,
    })),
    certificates: certificates.rows.map(row => ({
      id: row.id,
      title: row.title,
      institution: row.institution,
      issueDate: row.issueDate,
      fileData: row.fileData,
      fileType: row.fileType,
      description: row.description,
      order: row.order,
      profileId: row.profileId,
    })),
    experiences: experiences.rows.map(row => ({
      id: row.id,
      title: row.title,
      company: row.company,
      location: row.location,
      startDate: row.startDate,
      endDate: row.endDate,
      description: row.description,
      type: row.type,
      order: row.order,
      profileId: row.profileId,
    })),
    skills: skills.rows.map(row => ({
      id: row.id,
      name: row.name,
      level: row.level,
      icon: row.icon,
      category: row.category,
      order: row.order,
      profileId: row.profileId,
    })),
  }
}
