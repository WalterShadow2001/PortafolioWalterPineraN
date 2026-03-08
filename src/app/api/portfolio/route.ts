import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener todos los datos del portafolio
export async function GET() {
  try {
    let profile = await prisma.profile.findFirst({
      include: {
        socialLinks: true,
        projects: { orderBy: { order: 'asc' } },
        certificates: { orderBy: { order: 'asc' } },
        experiences: { orderBy: { order: 'asc' } },
        skills: { orderBy: { order: 'asc' } },
      },
    });

    // Si no existe perfil, crear uno por defecto con datos de ejemplo
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          name: 'Juan Pérez',
          title: 'Desarrollador Full Stack',
          bio: 'Apasionado desarrollador con más de 5 años de experiencia creando aplicaciones web modernas y escalables. Me especializo en React, Node.js y bases de datos. Siempre buscando nuevos desafíos y oportunidades de aprendizaje.',
          email: 'juan.perez@email.com',
          phone: '+1 (555) 123-4567',
          location: 'Ciudad de México, México',
          website: 'https://juanperez.dev',
          primaryColor: '#3b82f6',
          secondaryColor: '#1e40af',
          accentColor: '#f59e0b',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          socialLinks: {
            create: [
              { platform: 'linkedin', url: 'https://linkedin.com/in/juanperez', icon: 'Linkedin' },
              { platform: 'github', url: 'https://github.com/juanperez', icon: 'Github' },
              { platform: 'twitter', url: 'https://twitter.com/juanperez', icon: 'Twitter' },
            ],
          },
          projects: {
            create: [
              {
                title: 'E-Commerce Platform',
                description: 'Plataforma de comercio electrónico completa con carrito de compras, pagos con Stripe, panel de administración y sistema de inventario.',
                technologies: 'React, Node.js, PostgreSQL, Stripe, Tailwind CSS',
                featured: true,
                order: 0,
              },
              {
                title: 'Task Management App',
                description: 'Aplicación de gestión de tareas con funcionalidades de arrastrar y soltar, colaboración en tiempo real y notificaciones.',
                technologies: 'Next.js, Socket.io, MongoDB, TypeScript',
                featured: true,
                order: 1,
              },
              {
                title: 'Portfolio Website',
                description: 'Sitio web portfolio personal con animaciones fluidas, modo oscuro y optimización SEO.',
                technologies: 'Next.js, Framer Motion, Tailwind CSS',
                featured: false,
                order: 2,
              },
            ],
          },
          certificates: {
            create: [
              { title: 'AWS Certified Developer', institution: 'Amazon Web Services', issueDate: '2023-06', order: 0 },
              { title: 'Meta Front-End Developer', institution: 'Meta (Coursera)', issueDate: '2023-01', order: 1 },
              { title: 'JavaScript Algorithms and Data Structures', institution: 'freeCodeCamp', issueDate: '2022-08', order: 2 },
            ],
          },
          experiences: {
            create: [
              {
                title: 'Senior Full Stack Developer',
                company: 'Tech Solutions Inc.',
                location: 'Ciudad de México',
                startDate: '2022-01',
                endDate: null,
                description: 'Liderazgo técnico de equipo de 5 desarrolladores. Arquitectura y desarrollo de aplicaciones empresariales escalables. Implementación de CI/CD y mejores prácticas de desarrollo.',
                type: 'work',
                order: 0,
              },
              {
                title: 'Full Stack Developer',
                company: 'Digital Agency',
                location: 'Guadalajara',
                startDate: '2020-03',
                endDate: '2021-12',
                description: 'Desarrollo de aplicaciones web para clientes diversos. Integración con APIs externas y sistemas de pago. Optimización de rendimiento y SEO.',
                type: 'work',
                order: 1,
              },
              {
                title: 'Ingeniería en Sistemas Computacionales',
                company: 'Universidad Nacional Autónoma de México',
                location: 'Ciudad de México',
                startDate: '2016-08',
                endDate: '2020-06',
                description: 'Especialización en desarrollo de software y bases de datos. Proyecto de titulación: Sistema de gestión empresarial con IA.',
                type: 'education',
                order: 2,
              },
            ],
          },
          skills: {
            create: [
              { name: 'React', level: 95, category: 'Frontend', order: 0 },
              { name: 'TypeScript', level: 90, category: 'Frontend', order: 1 },
              { name: 'Next.js', level: 92, category: 'Frontend', order: 2 },
              { name: 'Node.js', level: 88, category: 'Backend', order: 3 },
              { name: 'PostgreSQL', level: 85, category: 'Backend', order: 4 },
              { name: 'MongoDB', level: 82, category: 'Backend', order: 5 },
              { name: 'Docker', level: 78, category: 'DevOps', order: 6 },
              { name: 'AWS', level: 75, category: 'DevOps', order: 7 },
              { name: 'Git', level: 95, category: 'Herramientas', order: 8 },
              { name: 'Figma', level: 70, category: 'Herramientas', order: 9 },
            ],
          },
        },
        include: {
          socialLinks: true,
          projects: { orderBy: { order: 'asc' } },
          certificates: { orderBy: { order: 'asc' } },
          experiences: { orderBy: { order: 'asc' } },
          skills: { orderBy: { order: 'asc' } },
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Error fetching portfolio' }, { status: 500 });
  }
}

// PUT - Actualizar perfil completo
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { socialLinks, projects, certificates, experiences, skills, ...profileData } = data;

    let profile = await prisma.profile.findFirst();

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          ...profileData,
          name: profileData.name || 'Mi Nombre',
          title: profileData.title || 'Mi Título',
        },
      });
    } else {
      // Actualizar perfil
      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: {
          ...profileData,
          updatedAt: new Date(),
        },
      });
    }

    // Actualizar social links si se proporcionan
    if (socialLinks) {
      await prisma.socialLink.deleteMany({ where: { profileId: profile.id } });
      if (socialLinks.length > 0) {
        await prisma.socialLink.createMany({
          data: socialLinks.map((link: { platform: string; url: string; icon: string }) => ({
            ...link,
            profileId: profile.id,
          })),
        });
      }
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json({ error: 'Error updating portfolio' }, { status: 500 });
  }
}
