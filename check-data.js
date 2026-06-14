const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://portafolio-production-shadowwolfsubs.aws-us-east-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODE0MTMzNjcsImlkIjoiMDE5ZWM0ODItYWQwMS03OTQxLWE5MTMtM2RhZWEyMjQzYTdlIiwicmlkIjoiODJkZjIxMjYtNzkyMi00OTVjLTllYWYtNzQwZWJiZTI3NzBjIn0.9osX6sQ2ZSEeEqKZ4gdSIrgMoBWw138lRtgbKfCnvpmDDGt4XpwM3wqZSl3jzyJhzguOgTZF9ZH2S57WLD8FBQ',
});

async function main() {
  const profileCount = await client.execute('SELECT COUNT(*) as count FROM Profile');
  const projectCount = await client.execute('SELECT COUNT(*) as count FROM Project');
  const skillCount = await client.execute('SELECT COUNT(*) as count FROM Skill');
  const experienceCount = await client.execute('SELECT COUNT(*) as count FROM Experience');
  const certificateCount = await client.execute('SELECT COUNT(*) as count FROM Certificate');
  const socialCount = await client.execute('SELECT COUNT(*) as count FROM SocialLink');

  console.log('Data in Turso:');
  console.log('  Profiles:', profileCount.rows[0].count);
  console.log('  Projects:', projectCount.rows[0].count);
  console.log('  Skills:', skillCount.rows[0].count);
  console.log('  Experiences:', experienceCount.rows[0].count);
  console.log('  Certificates:', certificateCount.rows[0].count);
  console.log('  Social Links:', socialCount.rows[0].count);

  if (parseInt(profileCount.rows[0].count) > 0) {
    const profile = await client.execute('SELECT * FROM Profile LIMIT 1');
    console.log('\nProfile data:', JSON.stringify(profile.rows[0], null, 2));
  }
}

main().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
