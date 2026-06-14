const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://portafolio-production-shadowwolfsubs.aws-us-east-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODE0MTMzNjcsImlkIjoiMDE5ZWM0ODItYWQwMS03OTQxLWE5MTMtM2RhZWEyMjQzYTdlIiwicmlkIjoiODJkZjIxMjYtNzkyMi00OTVjLTllYWYtNzQwZWJiZTI3NzBjIn0.9osX6sQ2ZSEeEqKZ4gdSIrgMoBWw138lRtgbKfCnvpmDDGt4XpwM3wqZSl3jzyJhzguOgTZF9ZH2S57WLD8FBQ',
});

async function main() {
  // Check existing tables
  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('Existing tables:', tables.rows.map(r => r.name));

  // Create Profile table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS Profile (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)) || '-' || hex(randomblob(4)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      name TEXT NOT NULL DEFAULT 'Tu Nombre',
      title TEXT NOT NULL DEFAULT 'Desarrollador Full Stack',
      photo TEXT,
      bio TEXT DEFAULT 'Apasionado por la tecnología y el desarrollo de software.',
      email TEXT DEFAULT 'tu@email.com',
      phone TEXT DEFAULT '+1 234 567 890',
      location TEXT DEFAULT 'Ciudad, País',
      website TEXT,
      primaryColor TEXT NOT NULL DEFAULT '#3b82f6',
      secondaryColor TEXT NOT NULL DEFAULT '#1e40af',
      accentColor TEXT NOT NULL DEFAULT '#f59e0b',
      backgroundColor TEXT NOT NULL DEFAULT '#ffffff',
      textColor TEXT NOT NULL DEFAULT '#1f2937',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Profile table created');

  // Create SocialLink table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS SocialLink (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)) || '-' || hex(randomblob(4)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT NOT NULL,
      profileId TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profileId) REFERENCES Profile(id) ON DELETE CASCADE
    )
  `);
  console.log('SocialLink table created');

  // Create Project table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS Project (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)) || '-' || hex(randomblob(4)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      title TEXT NOT NULL,
      description TEXT,
      url TEXT,
      technologies TEXT,
      images TEXT,
      startDate TEXT,
      endDate TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      "order" INTEGER NOT NULL DEFAULT 0,
      profileId TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profileId) REFERENCES Profile(id) ON DELETE CASCADE
    )
  `);
  console.log('Project table created');

  // Create Certificate table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS Certificate (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)) || '-' || hex(randomblob(4)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      title TEXT NOT NULL,
      institution TEXT,
      issueDate TEXT,
      fileData TEXT,
      fileType TEXT,
      description TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      profileId TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profileId) REFERENCES Profile(id) ON DELETE CASCADE
    )
  `);
  console.log('Certificate table created');

  // Create Experience table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS Experience (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)) || '-' || hex(randomblob(4)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT,
      startDate TEXT NOT NULL,
      endDate TEXT,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'work',
      "order" INTEGER NOT NULL DEFAULT 0,
      profileId TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profileId) REFERENCES Profile(id) ON DELETE CASCADE
    )
  `);
  console.log('Experience table created');

  // Create Skill table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS Skill (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)) || '-' || hex(randomblob(4)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
      name TEXT NOT NULL,
      level INTEGER NOT NULL DEFAULT 80,
      icon TEXT,
      category TEXT NOT NULL DEFAULT 'General',
      "order" INTEGER NOT NULL DEFAULT 0,
      profileId TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profileId) REFERENCES Profile(id) ON DELETE CASCADE
    )
  `);
  console.log('Skill table created');

  // Create indexes for foreign keys
  await client.execute('CREATE INDEX IF NOT EXISTS SocialLink_profileId_idx ON SocialLink(profileId)');
  await client.execute('CREATE INDEX IF NOT EXISTS Project_profileId_idx ON Project(profileId)');
  await client.execute('CREATE INDEX IF NOT EXISTS Certificate_profileId_idx ON Certificate(profileId)');
  await client.execute('CREATE INDEX IF NOT EXISTS Experience_profileId_idx ON Experience(profileId)');
  await client.execute('CREATE INDEX IF NOT EXISTS Skill_profileId_idx ON Skill(profileId)');
  console.log('Indexes created');

  // Verify
  const finalTables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('Final tables:', finalTables.rows.map(r => r.name));
}

main().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
