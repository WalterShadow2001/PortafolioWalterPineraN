# 🚀 Guía de Deployment - Portafolio CV

## 📋 Resumen del Proyecto

Tu portafolio CV incluye las siguientes características:

- ✅ **Modo Editor** con contraseña `2001` para editar todo el contenido
- ✅ **Perfil personal** con foto, nombre, título, biografía y datos de contacto
- ✅ **Experiencia y Educación** en línea de tiempo
- ✅ **Proyectos** con carrusel de imágenes y lightbox
- ✅ **Certificados** soportando PDF e imágenes con vista previa
- ✅ **Habilidades** organizadas por categoría con nivel de dominio
- ✅ **Selector de colores** para personalizar el diseño
- ✅ **Generación de PDF** con 4 plantillas diferentes
- ✅ **Selector de secciones** para el PDF

---

## 🌐 Opciones de Hosting Gratuito

### Opción 1: Vercel + Supabase (RECOMENDADA)

**Ventajas:**
- Vercel es el creador de Next.js, mejor rendimiento
- Supabase ofrece 500MB de base de datos PostgreSQL gratis
- Deployment automático desde GitHub
- Dominio gratis: `tu-proyecto.vercel.app`

#### Paso a Paso:

**1. Crear cuenta en Supabase (Base de datos)**
```
1. Ve a https://supabase.com
2. Crea una cuenta gratis
3. Crea un nuevo proyecto
4. Ve a Settings → Database
5. Copia la "Connection string" (URI)
   Formato: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**2. Preparar el código para Supabase**

Reemplaza el archivo `prisma/schema.prisma` con el contenido de `prisma/schema.supabase.prisma`

Crea un archivo `.env.production`:
```env
DATABASE_URL="tu-connection-string-de-supabase"
```

**3. Subir a GitHub**
```bash
# Inicializar git si no existe
git init

# Crear .gitignore
echo "node_modules/
.next/
.env.local
.env
*.log
db/" > .gitignore

# Agregar archivos
git add .

# Commit
git commit -m "Mi portafolio CV"

# Crear repositorio en GitHub y subir
# (Primero crea el repo en github.com)
git remote add origin https://github.com/tu-usuario/tu-repo.git
git branch -M main
git push -u origin main
```

**4. Deployment en Vercel**
```
1. Ve a https://vercel.com
2. Inicia sesión con GitHub
3. Click en "Add New Project"
4. Importa tu repositorio
5. En "Environment Variables", agrega:
   - DATABASE_URL = tu-connection-string-de-supabase
6. Click en "Deploy"
7. ¡Listo! Tu sitio estará en: https://tu-proyecto.vercel.app
```

**5. Sincronizar base de datos**
```bash
# En tu computadora local, con el .env de producción:
npx prisma db push
```

---

### Opción 2: Railway (Todo en uno)

**Ventajas:**
- Base de datos PostgreSQL incluida
- Deployment simple
- $5 de crédito gratis mensual

#### Paso a Paso:

```
1. Ve a https://railway.app
2. Inicia sesión con GitHub
3. Click en "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Selecciona tu repositorio
6. Agrega PostgreSQL:
   - Click en "Add Service" → "Database" → "PostgreSQL"
7. Variables de entorno se configuran automáticamente
8. Cambia el schema a PostgreSQL (usar schema.supabase.prisma)
9. Railway te dará una URL como: https://tu-app.up.railway.app
```

---

### Opción 3: Render + Neon

**Ventajas:**
- Render: Hosting web gratis
- Neon: Base de datos PostgreSQL serverless gratis

#### Paso a Paso:

**1. Crear base de datos en Neon**
```
1. Ve a https://neon.tech
2. Crea cuenta y proyecto
3. Copia la connection string
```

**2. Deploy en Render**
```
1. Ve a https://render.com
2. Conecta tu repositorio de GitHub
3. Selecciona "Web Service"
4. Configura:
   - Build Command: npm install && npx prisma generate && npm run build
   - Start Command: npm start
5. Agrega variable de entorno DATABASE_URL
```

---

### Opción 4: Netlify + Supabase

**Ventajas:**
- Netlify tiene excelente CDN
- Fácil configuración

#### Paso a Paso:

```
1. Ve a https://netlify.com
2. Arrastra tu carpeta del proyecto o conecta GitHub
3. Configura las variables de entorno
4. Necesitarás crear un archivo netlify.toml
```

---

## 🔧 Configuración Importante

### Cambiar la Contraseña del Editor

En el archivo `src/lib/contexts/auth-context.tsx`, cambia la línea:
```typescript
const CORRECT_PASSWORD = '2001';
```
Por tu nueva contraseña segura.

### Variables de Entorno para Producción

```env
# Para PostgreSQL (Supabase, Railway, Neon)
DATABASE_URL="postgresql://usuario:password@host:5432/database"

# Para SQLite (solo desarrollo local)
DATABASE_URL="file:./db/custom.db"
```

---

## 📱 Estructura del Proyecto

```
├── prisma/
│   ├── schema.prisma          # Schema para SQLite
│   └── schema.supabase.prisma # Schema para PostgreSQL
├── src/
│   ├── app/
│   │   ├── api/               # APIs del backend
│   │   └── page.tsx           # Página principal
│   ├── components/
│   │   ├── editor/            # Panel de edición
│   │   ├── portfolio/         # Secciones del CV
│   │   └── pdf/               # Generador de PDF
│   └── lib/
│       └── contexts/          # Estado global
└── public/                    # Archivos estáticos
```

---

## 🎨 Personalización

### Colores por Defecto

| Color | Valor | Uso |
|-------|-------|-----|
| Primary | #3b82f6 | Botones, títulos destacados |
| Secondary | #1e40af | Elementos secundarios |
| Accent | #f59e0b | Acentos y destacados |
| Background | #ffffff | Fondo de la página |
| Text | #1f2937 | Color del texto |

### Plantillas PDF Disponibles

1. **Clásico**: Diseño tradicional y profesional
2. **Moderno**: Barra lateral con degradado
3. **Creativo**: Diseño con gradientes y formas
4. **Minimalista**: Solo lo esencial

---

## ❓ Preguntas Frecuentes

**¿Puedo usar mi propio dominio?**
Sí, en Vercel puedes agregar un dominio personalizado gratis.

**¿Dónde se guardan las imágenes?**
Las imágenes se guardan como base64 en la base de datos. Para producción con muchas imágenes, considera usar un servicio como Cloudinary.

**¿La contraseña es segura?**
Es una autenticación básica del lado del cliente. Para producción seria, implementa autenticación robusta con NextAuth.js.

**¿Puedo exportar los datos?**
Sí, puedes acceder a `/api/portfolio` para ver todos tus datos en formato JSON.

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel/Railway
2. Verifica que DATABASE_URL esté configurada correctamente
3. Asegúrate de haber ejecutado `prisma db push` para crear las tablas

---

¡Buena suerte con tu portafolio! 🎉
