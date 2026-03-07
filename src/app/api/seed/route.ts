import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if profile already exists
    const existingProfile = await db.profile.findFirst();
    
    if (existingProfile) {
      return NextResponse.json({ message: 'Database already seeded', profile: existingProfile });
    }

    // Create default profile
    const profile = await db.profile.create({
      data: {
        name: 'Juan García',
        title: 'Desarrollador Full Stack',
        bio: 'Desarrollador apasionado con más de 5 años de experiencia creando aplicaciones web modernas y escalables. Especializado en React, Node.js y tecnologías cloud.',
        email: 'juan.garcia@email.com',
        phone: '+34 612 345 678',
        location: 'Madrid, España',
        linkedin: 'https://linkedin.com/in/juangarcia',
        github: 'https://github.com/juangarcia',
        twitter: 'https://twitter.com/juangarcia',
        website: 'https://juangarcia.dev',
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        accentColor: '#f59e0b',
        backgroundColor: '#ffffff',
      },
    });

    // Create sample projects
    await db.project.createMany({
      data: [
        {
          title: 'E-Commerce Platform',
          description: 'Plataforma de comercio electrónico completa con carrito de compras, pasarela de pagos y panel de administración.',
          url: 'https://github.com/juangarcia/ecommerce',
          technologies: 'React, Node.js, PostgreSQL, Stripe',
          date: '2024',
          order: 1,
        },
        {
          title: 'Task Management App',
          description: 'Aplicación de gestión de tareas con colaboración en tiempo real, notificaciones y estadísticas.',
          url: 'https://github.com/juangarcia/taskapp',
          technologies: 'Next.js, TypeScript, Prisma, Socket.io',
          date: '2023',
          order: 2,
        },
        {
          title: 'Portfolio Personal',
          description: 'Mi portafolio personal con editor integrado y exportación a PDF.',
          url: 'https://juangarcia.dev',
          technologies: 'Next.js, Tailwind CSS, Framer Motion',
          date: '2024',
          order: 3,
        },
      ],
    });

    // Create sample experience
    await db.experience.createMany({
      data: [
        {
          title: 'Senior Full Stack Developer',
          company: 'Tech Solutions Inc.',
          location: 'Madrid, España',
          startDate: '2022-01',
          endDate: 'Presente',
          description: 'Liderazgo del equipo de desarrollo, arquitectura de aplicaciones empresariales, implementación de CI/CD.',
          type: 'work',
          order: 1,
        },
        {
          title: 'Full Stack Developer',
          company: 'StartUp Hub',
          location: 'Barcelona, España',
          startDate: '2019-06',
          endDate: '2021-12',
          description: 'Desarrollo de aplicaciones web con React y Node.js, integración con APIs externas.',
          type: 'work',
          order: 2,
        },
        {
          title: 'Ingeniería en Sistemas Computacionales',
          company: 'Universidad Politécnica',
          location: 'Madrid, España',
          startDate: '2014',
          endDate: '2019',
          description: 'Graduado con honores. Especialización en desarrollo de software.',
          type: 'education',
          order: 3,
        },
      ],
    });

    // Create sample skills
    await db.skill.createMany({
      data: [
        { name: 'React', level: 95, icon: 'code', category: 'Frontend', order: 1 },
        { name: 'TypeScript', level: 90, icon: 'file-code', category: 'Frontend', order: 2 },
        { name: 'Next.js', level: 88, icon: 'layers', category: 'Frontend', order: 3 },
        { name: 'Node.js', level: 85, icon: 'server', category: 'Backend', order: 4 },
        { name: 'PostgreSQL', level: 80, icon: 'database', category: 'Backend', order: 5 },
        { name: 'Docker', level: 75, icon: 'container', category: 'DevOps', order: 6 },
        { name: 'AWS', level: 70, icon: 'cloud', category: 'DevOps', order: 7 },
        { name: 'Git', level: 90, icon: 'git-branch', category: 'Tools', order: 8 },
      ],
    });

    // Create sample certificates
    await db.certificate.createMany({
      data: [
        {
          title: 'AWS Certified Developer',
          institution: 'Amazon Web Services',
          date: '2023',
          type: 'Certificación Profesional',
          order: 1,
        },
        {
          title: 'React Advanced Patterns',
          institution: 'Frontend Masters',
          date: '2023',
          type: 'Curso Online',
          order: 2,
        },
        {
          title: 'Node.js Professional',
          institution: 'OpenJS Foundation',
          date: '2022',
          type: 'Certificación Profesional',
          order: 3,
        },
      ],
    });

    // Create sample social links
    await db.socialLink.createMany({
      data: [
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/juangarcia', icon: 'linkedin', order: 1 },
        { platform: 'GitHub', url: 'https://github.com/juangarcia', icon: 'github', order: 2 },
        { platform: 'Twitter', url: 'https://twitter.com/juangarcia', icon: 'twitter', order: 3 },
      ],
    });

    return NextResponse.json({ 
      message: 'Database seeded successfully', 
      profile 
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
