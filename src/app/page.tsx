'use client';

import { useEffect, useState, useCallback } from 'react';
import { AuthProvider, useAuth } from '@/lib/contexts/auth-context';
import { DataProvider, useData } from '@/lib/contexts/data-context';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, ChevronUp, 
  Mail, Phone, MapPin, Calendar, ExternalLink, 
  Briefcase, GraduationCap, Award, Code, 
  Camera, X, Download, Eye, Edit2, Trash2, Plus,
  Linkedin, Github, Twitter, Globe, FileText, Image as ImageIcon, Save, Check,
  Facebook, Instagram, Youtube, Twitch, Dribbble, Figma, MessageCircle, Send, Music
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { EyeToggle } from '@/components/ui/eye-toggle';
import { themes, getTheme, getThemeLoadingColors } from '@/lib/themes';
import { PDFCanvasEditor } from '@/components/pdf/PDFCanvasEditor';
import { ThemeBackground } from '@/components/ui/theme-background';

// Icon map - todas las redes sociales disponibles
const socialIconMap: { [key: string]: typeof Linkedin } = {
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  tiktok: Music,
  twitch: Twitch,
  dribbble: Dribbble,
  figma: Figma,
  whatsapp: MessageCircle,
  telegram: Send,
  website: Globe,
};

// Lista de redes sociales para el editor
const socialPlatforms = [
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/tu-perfil' },
  { id: 'github', name: 'GitHub', icon: Github, placeholder: 'https://github.com/tu-usuario' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, placeholder: 'https://twitter.com/tu-usuario' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/tu-usuario' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/tu-pagina' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@tu-canal' },
  { id: 'tiktok', name: 'TikTok', icon: Music, placeholder: 'https://tiktok.com/@tu-usuario' },
  { id: 'twitch', name: 'Twitch', icon: Twitch, placeholder: 'https://twitch.tv/tu-canal' },
  { id: 'dribbble', name: 'Dribbble', icon: Dribbble, placeholder: 'https://dribbble.com/tu-usuario' },
  { id: 'figma', name: 'Figma', icon: Figma, placeholder: 'https://figma.com/@tu-usuario' },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, placeholder: 'https://wa.me/1234567890' },
  { id: 'telegram', name: 'Telegram', icon: Send, placeholder: 'https://t.me/tu-usuario' },
  { id: 'website', name: 'Sitio Web', icon: Globe, placeholder: 'https://tu-sitio.com' },
];

function PortfolioApp() {
  const { profile, loading, updateProfile, addProject, updateProject, deleteProject, 
          addCertificate, updateCertificate, deleteCertificate,
          addExperience, updateExperience, deleteExperience,
          addSkill, updateSkill, deleteSkill } = useData();
  const { isAuthenticated, login, logout, checking } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  
  // Edit modals state
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editingCertificate, setEditingCertificate] = useState<any>(null);
  const [editingExperience, setEditingExperience] = useState<any>(null);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  
  // Store theme to localStorage for loading screen
  useEffect(() => {
    if (profile?.theme) {
      try { localStorage.setItem('portfolio-theme', profile.theme); } catch {}
    }
  }, [profile?.theme]);

  // Apply theme colors
  useEffect(() => {
    if (profile) {
      document.documentElement.style.setProperty('--color-primary', profile.primaryColor);
      document.documentElement.style.setProperty('--color-secondary', profile.secondaryColor);
      document.documentElement.style.setProperty('--color-accent', profile.accentColor);
      document.documentElement.style.setProperty('--color-background', profile.backgroundColor);
      document.documentElement.style.setProperty('--color-text', profile.textColor);
    }
  }, [profile]);

  // Apply theme CSS
  useEffect(() => {
    if (profile) {
      const theme = getTheme(profile.theme || 'default');
      // Remove old theme style element
      const oldStyle = document.getElementById('theme-css');
      if (oldStyle) oldStyle.remove();
      // Add new theme CSS if exists
      if (theme.css) {
        const style = document.createElement('style');
        style.id = 'theme-css';
        style.textContent = theme.css;
        document.head.appendChild(style);
      }
      return () => {
        const el = document.getElementById('theme-css');
        if (el) el.remove();
      };
    }
  }, [profile?.theme]);

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'about', 'experience', 'projects', 'skills', 'certificates', 'contact'];
      const scrollPos = window.scrollY + 200;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      const success = await login(password);
      if (success) {
        setShowLogin(false);
        setPassword('');
        toast.success('Modo editor activado');
      } else {
        toast.error('Contraseña incorrecta');
      }
    } catch {
      toast.error('Error al iniciar sesión');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handlers for edit/save
  const handleSaveProject = async (data: any) => {
    if (!data.title) {
      toast.error('El título es requerido');
      return;
    }
    if (editingProject?.id) {
      await updateProject(editingProject.id, data);
      toast.success('✅ Proyecto actualizado');
    } else {
      await addProject({ ...data, order: profile.projects?.length || 0 });
      toast.success('✅ Proyecto agregado');
    }
    setEditingProject(null);
  };

  const handleSaveCertificate = async (data: any) => {
    if (!data.title) {
      toast.error('El título es requerido');
      return;
    }
    if (editingCertificate?.id) {
      await updateCertificate(editingCertificate.id, data);
      toast.success('✅ Certificado actualizado');
    } else {
      await addCertificate({ ...data, order: profile.certificates?.length || 0 });
      toast.success('✅ Certificado agregado');
    }
    setEditingCertificate(null);
  };

  const handleSaveExperience = async (data: any) => {
    if (!data.title || !data.company) {
      toast.error('Título y empresa son requeridos');
      return;
    }
    if (editingExperience?.id) {
      await updateExperience(editingExperience.id, data);
      toast.success('✅ Experiencia actualizada');
    } else {
      await addExperience({ ...data, order: profile.experiences?.length || 0 });
      toast.success('✅ Experiencia agregada');
    }
    setEditingExperience(null);
  };

  const handleSaveSkill = async (data: any) => {
    if (!data.name) {
      toast.error('El nombre es requerido');
      return;
    }
    if (editingSkill?.id) {
      await updateSkill(editingSkill.id, data);
      toast.success('✅ Habilidad actualizada');
    } else {
      await addSkill({ ...data, order: profile.skills?.length || 0 });
      toast.success('✅ Habilidad agregada');
    }
    setEditingSkill(null);
  };

  // Loading state - themed loading screen
  if (loading || checking) {
    let savedTheme = 'default';
    try { savedTheme = localStorage.getItem('portfolio-theme') || 'default'; } catch {}
    const loadingColors = getThemeLoadingColors(savedTheme);
    const loadingTheme = getTheme(savedTheme);
    return (
      <div className={`min-h-screen flex items-center justify-center ${loadingTheme.className}`} style={{ backgroundColor: loadingColors.bg, color: loadingColors.text }}>
        {/* Apply theme CSS for loading screen */}
        {loadingTheme.css && <style>{loadingTheme.css}</style>}
        <ThemeBackground themeId={savedTheme} />
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: `${loadingColors.accent}40`, borderTopColor: 'transparent' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full" style={{ background: `linear-gradient(135deg, ${loadingColors.accent}, ${loadingColors.accent}80)` }} />
              </div>
            </div>
            <div className="text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold mb-2" 
                style={{ color: loadingColors.text }}
              >
                Cargando portafolio
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.4 }}
                className="text-sm" 
                style={{ color: loadingColors.text, opacity: 0.6 }}
              >
                Preparando tu experiencia...
              </motion.p>
            </div>
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: 120 }} 
              transition={{ delay: 0.3, duration: 1.5, repeat: Infinity }}
              className="h-1 rounded-full" 
              style={{ background: `linear-gradient(90deg, ${loadingColors.accent}, transparent)` }}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-500">Error al cargar el portafolio</span>
      </div>
    );
  }

  const currentTheme = getTheme(profile.theme || 'default');

  return (
    <div className={`min-h-screen relative ${currentTheme.className}`} style={{ ...currentTheme.bodyStyle, backgroundColor: profile.backgroundColor, color: profile.textColor }}>
      {/* Theme Background */}
      <ThemeBackground themeId={profile.theme || 'default'} />

      <div className="relative z-10">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm" style={currentTheme.navStyle}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-xl" style={{ color: profile.primaryColor }}>
            {profile.name.split(' ')[0]}
          </span>
          
          <div className="hidden md:flex items-center gap-6">
            {['Inicio', 'Sobre mí', 'Experiencia', 'Proyectos', 'Habilidades', 'Certificados', 'Contacto'].map((item, i) => {
              const sections = ['hero', 'about', 'experience', 'projects', 'skills', 'certificates', 'contact'];
              return (
                <a key={item} href={`#${sections[i]}`}
                  className={`text-sm transition-colors ${activeSection === sections[i] ? 'font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                  style={activeSection === sections[i] ? { color: profile.primaryColor } : {}}
                >
                  {item}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button onClick={() => setShowEditor(!showEditor)} size="sm" className="gap-2" style={{ backgroundColor: profile.primaryColor, color: 'white' }}>
                  {showEditor ? 'Ocultar Editor' : '✏️ Editor'}
                </Button>
                <Button onClick={logout} variant="outline" size="sm">Salir</Button>
              </>
            ) : (
              <Dialog open={showLogin} onOpenChange={setShowLogin}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 text-gray-500 hover:text-gray-700">
                    🔒 Acceder
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>🔐 Modo Editor</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label>Contraseña</Label>
                      <div className="relative mt-2 flex items-center">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                          placeholder="Ingresa la contraseña"
                          className="pr-14"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <EyeToggle
                            show={showPassword}
                            onToggle={() => setShowPassword(!showPassword)}
                            size={28}
                          />
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleLogin} disabled={loginLoading} className="w-full" style={{ backgroundColor: profile.primaryColor, color: 'white' }}>
                      {loginLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {loginLoading ? 'Verificando...' : 'Entrar al Editor'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button onClick={() => setShowPdfDialog(true)} size="sm" variant="outline" className="gap-2">📄 PDF</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center justify-center pt-16 px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl">
          {/* Profile Photo */}
          <div className="relative inline-block mb-6">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 shadow-xl" style={{ borderColor: profile.primaryColor }}>
              {profile.photo ? (
                <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${profile.primaryColor}, ${profile.secondaryColor})` }}>
                  {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}
            </div>
            {isAuthenticated && (
              <label className="absolute bottom-2 right-2 p-3 rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110" style={{ backgroundColor: profile.primaryColor }}>
                <Camera size={20} className="text-white" />
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = async (ev) => {
                      await updateProfile({ photo: ev.target?.result as string });
                      toast.success('📸 Foto actualizada');
                    };
                    reader.readAsDataURL(file);
                  }
                }} className="hidden" />
              </label>
            )}
          </div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-4xl md:text-6xl font-bold mb-4" style={{ color: profile.textColor }}>
            {profile.name}
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-xl md:text-2xl mb-6" style={{ color: profile.primaryColor }}>
            {profile.title}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap justify-center gap-3 mb-8">
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <Mail size={16} style={{ color: profile.primaryColor }} />{profile.email}
              </a>
            )}
            {profile.phone && (
              <a href={`tel:${profile.phone}`} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <Phone size={16} style={{ color: profile.primaryColor }} />{profile.phone}
              </a>
            )}
            {profile.location && (
              <span className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm shadow-sm border border-gray-100">
                <MapPin size={16} style={{ color: profile.primaryColor }} />{profile.location}
              </span>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex justify-center gap-4">
            {profile.socialLinks?.filter((link: any) => link.url && link.url.trim() !== '').map((link: any) => {
              const Icon = socialIconMap[link.icon?.toLowerCase()] || Globe;
              return (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="p-3 rounded-full transition-all hover:scale-110 shadow-sm"
                  style={{ backgroundColor: profile.primaryColor, color: 'white' }}>
                  <Icon size={24} />
                </a>
              );
            })}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-gray-400">
              <ChevronUp size={24} className="rotate-180" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      {profile.bio && (
        <section id="about" className="py-20 px-4" style={{ ...(currentTheme.altSectionStyle || {}), backgroundColor: `${profile.primaryColor}08` }}>
          <div className="max-w-4xl mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-8" style={{ color: profile.primaryColor }}>
              Sobre Mí
            </motion.h2>
            <p className="text-lg text-center leading-relaxed" style={{ color: profile.textColor, opacity: 0.8 }}>{profile.bio}</p>
          </div>
        </section>
      )}

      {/* Experience Section */}
      {profile.experiences && profile.experiences.length > 0 && (
        <section id="experience" className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-12" style={{ color: profile.primaryColor }}>
              Experiencia & Educación
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Work Experience */}
              <div>
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: profile.primaryColor }}>
                  <Briefcase size={24} /> Experiencia Laboral
                </h3>
                <div className="relative pl-8 border-l-2" style={{ borderColor: profile.primaryColor }}>
                  {profile.experiences.filter(e => e.type === 'work').map((exp: any, i: number) => (
                    <motion.div key={exp.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="relative mb-8 last:mb-0 group">
                      <div className="absolute w-4 h-4 rounded-full -left-[25px] top-0" style={{ backgroundColor: profile.primaryColor }} />
                      <div className="bg-white p-5 rounded-xl shadow-sm ml-4 card-hover border border-gray-100" style={currentTheme.cardStyle}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-lg" style={{ color: profile.textColor }}>{exp.title}</h4>
                            <p style={{ color: profile.primaryColor }} className="font-medium">{exp.company}</p>
                          </div>
                          {isAuthenticated && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" variant="ghost" onClick={() => setEditingExperience(exp)} className="h-8 w-8 p-0">
                                <Edit2 size={14} />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => { deleteExperience(exp.id); toast.success('Eliminado'); }} className="h-8 w-8 p-0 text-red-500">
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                          {exp.location && <span className="flex items-center gap-1"><MapPin size={14} />{exp.location}</span>}
                          <span className="flex items-center gap-1"><Calendar size={14} />{exp.startDate} - {exp.endDate || 'Presente'}</span>
                        </div>
                        {exp.description && <p className="mt-2 text-gray-600 text-sm">{exp.description}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: profile.secondaryColor }}>
                  <GraduationCap size={24} /> Educación
                </h3>
                <div className="relative pl-8 border-l-2" style={{ borderColor: profile.secondaryColor }}>
                  {profile.experiences.filter(e => e.type === 'education').map((exp: any, i: number) => (
                    <motion.div key={exp.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="relative mb-8 last:mb-0 group">
                      <div className="absolute w-4 h-4 rounded-full -left-[25px] top-0" style={{ backgroundColor: profile.secondaryColor }} />
                      <div className="bg-white p-5 rounded-xl shadow-sm ml-4 card-hover border border-gray-100" style={currentTheme.cardStyle}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-lg" style={{ color: profile.textColor }}>{exp.title}</h4>
                            <p style={{ color: profile.secondaryColor }} className="font-medium">{exp.company}</p>
                          </div>
                          {isAuthenticated && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" variant="ghost" onClick={() => setEditingExperience(exp)} className="h-8 w-8 p-0">
                                <Edit2 size={14} />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => { deleteExperience(exp.id); toast.success('Eliminado'); }} className="h-8 w-8 p-0 text-red-500">
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                          {exp.location && <span className="flex items-center gap-1"><MapPin size={14} />{exp.location}</span>}
                          <span className="flex items-center gap-1"><Calendar size={14} />{exp.startDate} - {exp.endDate || 'Presente'}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            
            {isAuthenticated && (
              <div className="text-center mt-8">
                <Button onClick={() => setEditingExperience({ title: '', company: '', location: '', startDate: '', endDate: '', description: '', type: 'work' })} variant="outline" className="gap-2">
                  <Plus size={16} /> Agregar Experiencia
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Projects Section */}
      {profile.projects && profile.projects.length > 0 && (
        <section id="projects" className="py-20 px-4" style={{ ...(currentTheme.altSectionStyle || {}), backgroundColor: `${profile.primaryColor}08` }}>
          <div className="max-w-6xl mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-12" style={{ color: profile.primaryColor }}>
              Proyectos
            </motion.h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.projects.map((project: any, i: number) => {
                const images = project.images ? JSON.parse(project.images) : [];
                return (
                  <motion.div key={project.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden card-hover border border-gray-100 group" style={currentTheme.cardStyle}>
                    <div className="h-48 cursor-pointer overflow-hidden relative"
                      onClick={() => images.length > 0 && setLightbox({ images, index: 0 })}>
                      {images.length > 0 ? (
                        <>
                          <img src={images[0]} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          {images.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">+{images.length - 1} fotos</div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${profile.primaryColor}20, ${profile.secondaryColor}20)` }}>
                          <span className="text-2xl font-bold" style={{ color: profile.primaryColor }}>{project.title}</span>
                        </div>
                      )}
                      {isAuthenticated && (
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setEditingProject(project); }} className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                            <Edit2 size={14} />
                          </Button>
                          <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); deleteProject(project.id); toast.success('Eliminado'); }} className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-red-500">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg" style={{ color: profile.textColor }}>{project.title}</h3>
                        {project.url && (
                          <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500">
                            <ExternalLink size={18} />
                          </a>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                      {project.technologies && (
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.split(',').map((tech: string, ti: number) => (
                            <span key={ti} className="px-2 py-1 text-xs rounded-full"
                              style={{ backgroundColor: `${profile.primaryColor}10`, color: profile.primaryColor }}>
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {isAuthenticated && (
              <div className="text-center mt-8">
                <Button onClick={() => setEditingProject({ title: '', description: '', technologies: '', url: '', images: [] })}
                  style={{ backgroundColor: profile.primaryColor, color: 'white' }} className="gap-2">
                  <Plus size={16} /> Agregar Proyecto
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Skills Section */}
      {profile.skills && profile.skills.length > 0 && (
        <section id="skills" className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-12" style={{ color: profile.primaryColor }}>
              Habilidades
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-8">
              {Object.entries(
                profile.skills.reduce((acc: any, skill: any) => {
                  const cat = skill.category || 'General';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(skill);
                  return acc;
                }, {})
              ).map(([category, skills]: [string, any], ci: number) => (
                <motion.div key={category} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: ci * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100" style={currentTheme.cardStyle}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: profile.primaryColor }}>
                    <Code size={20} /> {category}
                  </h3>
                  <div className="space-y-4">
                    {skills.map((skill: any, si: number) => (
                      <div key={skill.id} className="group">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium" style={{ color: profile.textColor }}>{skill.name}</span>
                          <div className="flex items-center gap-2">
                            <span style={{ color: profile.primaryColor }}>{skill.level}%</span>
                            {isAuthenticated && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="ghost" onClick={() => setEditingSkill(skill)} className="h-5 w-5 p-0">
                                  <Edit2 size={12} />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => { deleteSkill(skill.id); toast.success('Eliminado'); }} className="h-5 w-5 p-0 text-red-500">
                                  <Trash2 size={12} />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div className="h-full rounded-full" initial={{ width: 0 }} whileInView={{ width: `${skill.level}%` }} viewport={{ once: true }}
                            transition={{ duration: 1, delay: si * 0.05 }}
                            style={{ background: `linear-gradient(90deg, ${profile.primaryColor}, ${profile.accentColor})` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {isAuthenticated && (
              <div className="text-center mt-8">
                <Button onClick={() => setEditingSkill({ name: '', level: 80, category: 'General' })} variant="outline" className="gap-2">
                  <Plus size={16} /> Agregar Habilidad
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Certificates Section */}
      {profile.certificates && profile.certificates.length > 0 && (
        <section id="certificates" className="py-20 px-4" style={{ ...(currentTheme.altSectionStyle || {}), backgroundColor: `${profile.primaryColor}08` }}>
          <div className="max-w-6xl mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-12" style={{ color: profile.primaryColor }}>
              Certificados
            </motion.h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.certificates.map((cert: any, i: number) => {
                const isPDF = cert.fileType === 'pdf';
                return (
                  <motion.div key={cert.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden card-hover border border-gray-100 group" style={currentTheme.cardStyle}>
                    <div className="h-40 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 relative">
                      {cert.fileData ? (
                        isPDF ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 rounded-full bg-red-100">
                              <FileText size={40} className="text-red-500" />
                            </div>
                            <span className="text-sm text-gray-500 font-medium">Documento PDF</span>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => window.open(cert.fileData, '_blank')} className="gap-1">
                                <Eye size={14} /> Ver
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => {
                                const a = document.createElement('a');
                                a.href = cert.fileData;
                                a.download = `${cert.title}.pdf`;
                                a.click();
                              }} className="gap-1">
                                <Download size={14} /> Descargar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <img src={cert.fileData} alt={cert.title} className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                            onClick={() => setLightbox({ images: [cert.fileData], index: 0 })} />
                        )
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Award size={48} style={{ color: profile.primaryColor }} />
                          <span className="text-sm text-gray-500">Sin archivo</span>
                        </div>
                      )}
                      {isAuthenticated && (
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="secondary" onClick={() => setEditingCertificate(cert)} className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                            <Edit2 size={14} />
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => { deleteCertificate(cert.id); toast.success('Eliminado'); }} className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-red-500">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg" style={{ color: profile.textColor }}>{cert.title}</h3>
                      {cert.institution && <p className="text-gray-600 text-sm">{cert.institution}</p>}
                      {cert.issueDate && <p className="text-gray-400 text-sm mt-1">{cert.issueDate}</p>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {isAuthenticated && (
              <div className="text-center mt-8">
                <Button onClick={() => setEditingCertificate({ title: '', institution: '', issueDate: '', fileData: '', fileType: '' })}
                  style={{ backgroundColor: profile.primaryColor, color: 'white' }} className="gap-2">
                  <Plus size={16} /> Agregar Certificado
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl font-bold mb-8" style={{ color: profile.primaryColor }}>
            Contacto
          </motion.h2>
          <p className="mb-8" style={{ color: profile.textColor, opacity: 0.7 }}>
            ¿Interesado en trabajar juntos? No dudes en contactarme.
          </p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="flex items-center justify-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100" style={currentTheme.cardStyle}>
                <Mail style={{ color: profile.primaryColor }} size={24} />
                <span className="text-lg" style={{ color: profile.textColor }}>{profile.email}</span>
              </a>
            )}
            {profile.phone && (
              <a href={`tel:${profile.phone}`} className="flex items-center justify-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100" style={currentTheme.cardStyle}>
                <Phone style={{ color: profile.primaryColor }} size={24} />
                <span className="text-lg" style={{ color: profile.textColor }}>{profile.phone}</span>
              </a>
            )}
            {profile.location && (
              <div className="flex items-center justify-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100" style={currentTheme.cardStyle}>
                <MapPin style={{ color: profile.primaryColor }} size={24} />
                <span className="text-lg" style={{ color: profile.textColor }}>{profile.location}</span>
              </div>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex justify-center gap-4 mt-8">
            {profile.socialLinks?.filter((link: any) => link.url && link.url.trim() !== '').map((link: any) => {
              const Icon = socialIconMap[link.icon?.toLowerCase()] || Globe;
              return (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="p-4 rounded-full transition-all hover:scale-110 shadow-sm"
                  style={{ backgroundColor: profile.primaryColor, color: 'white' }}>
                  <Icon size={24} />
                </a>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden" style={{ borderColor: `${profile.primaryColor}20` }}>
        <div className="h-1" style={{ background: `linear-gradient(90deg, transparent, ${profile.primaryColor}, ${profile.secondaryColor || '#60a5fa'}, ${profile.primaryColor}, transparent)` }} />
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${profile.primaryColor}30)` }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: profile.primaryColor }} />
              <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${profile.primaryColor}30)` }} />
            </div>
            <p className="text-center text-sm" style={{ color: profile.textColor, opacity: 0.5 }}>
              © {new Date().getFullYear()} {profile.name}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Editor Panel */}
      <AnimatePresence>
        {isAuthenticated && showEditor && (
          <EditorPanel profile={profile} updateProfile={updateProfile} onClose={() => setShowEditor(false)} />
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
            onClick={() => setLightbox(null)}>
            <button className="absolute top-4 right-4 text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors" onClick={() => setLightbox(null)}>
              <X size={28} />
            </button>
            <motion.img key={lightbox.index} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              src={lightbox.images[lightbox.index]} alt="Lightbox" className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()} />
            {lightbox.images.length > 1 && (
              <>
                <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 bg-white/10 rounded-full hover:bg-white/20"
                  onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length }); }}>◀</button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 bg-white/10 rounded-full hover:bg-white/20"
                  onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.images.length }); }}>▶</button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Canvas Editor */}
      <PDFCanvasEditor open={showPdfDialog} onOpenChange={setShowPdfDialog} profile={profile} />

      {/* Edit Modals */}
      {editingProject !== null && (
        <ProjectEditModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSave={handleSaveProject}
          primaryColor={profile.primaryColor}
        />
      )}
      {editingCertificate !== null && (
        <CertificateEditModal
          certificate={editingCertificate}
          onClose={() => setEditingCertificate(null)}
          onSave={handleSaveCertificate}
          primaryColor={profile.primaryColor}
        />
      )}
      {editingExperience !== null && (
        <ExperienceEditModal
          experience={editingExperience}
          onClose={() => setEditingExperience(null)}
          onSave={handleSaveExperience}
          primaryColor={profile.primaryColor}
        />
      )}
      {editingSkill !== null && (
        <SkillEditModal
          skill={editingSkill}
          onClose={() => setEditingSkill(null)}
          onSave={handleSaveSkill}
          primaryColor={profile.primaryColor}
        />
      )}
      </div>{/* end z-10 wrapper */}
    </div>
  );
}

// Editor Panel
function EditorPanel({ profile, updateProfile, onClose }: any) {
  const [data, setData] = useState({
    name: '', title: '', bio: '', email: '', phone: '', location: '',
    primaryColor: '#3b82f6', secondaryColor: '#1e40af', accentColor: '#f59e0b',
    backgroundColor: '#ffffff', textColor: '#1f2937',
    theme: 'default',
  });
  
  // Estado para redes sociales
  const [socialLinks, setSocialLinks] = useState<{[key: string]: string}>({});

  // Initialize data from profile (only once when component mounts or profile changes significantly)
  const initialData = {
    name: profile?.name || '',
    title: profile?.title || '',
    bio: profile?.bio || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    primaryColor: profile?.primaryColor || '#3b82f6',
    secondaryColor: profile?.secondaryColor || '#1e40af',
    accentColor: profile?.accentColor || '#f59e0b',
    backgroundColor: profile?.backgroundColor || '#ffffff',
    textColor: profile?.textColor || '#1f2937',
    theme: profile?.theme || 'default',
  };
  
  // Inicializar redes sociales desde profile
  const initialSocialLinks: {[key: string]: string} = {};
  if (profile?.socialLinks) {
    profile.socialLinks.forEach((link: any) => {
      initialSocialLinks[link.icon] = link.url;
    });
  }
  
  // Use initial data directly
  const currentData = data.name ? data : initialData;
  const currentSocialLinks = Object.keys(socialLinks).length > 0 ? socialLinks : initialSocialLinks;

  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Guardar datos del perfil
      await updateProfile(currentData);
      
      // Guardar redes sociales
      const socialLinksArray = Object.entries(currentSocialLinks)
        .filter(([_, url]) => url && url.trim() !== '')
        .map(([icon, url], index) => ({
          platform: socialPlatforms.find(p => p.id === icon)?.name || icon,
          url: url.trim(),
          icon,
          order: index
        }));
      
      // Actualizar redes sociales via API
      // Primero eliminar todas las redes sociales existentes
      if (profile?.socialLinks && profile.socialLinks.length > 0) {
        for (const link of profile.socialLinks) {
          try {
            await fetch(`/api/portfolio/social?id=${link.id}`, { method: 'DELETE' });
          } catch (e) {
            console.log('Error deleting link:', e);
          }
        }
      }
      
      // Luego crear las nuevas
      for (const link of socialLinksArray) {
        try {
          const res = await fetch('/api/portfolio/social', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(link)
          });
          if (!res.ok) {
            console.error('Error creating social link:', await res.text());
          }
        } catch (e) {
          console.error('Error creating link:', e);
        }
      }
      
      toast.success('✅ Cambios guardados');
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const updateSocialLink = (platformId: string, url: string) => {
    setSocialLinks({ ...currentSocialLinks, [platformId]: url });
  };

  return (
    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[420px] bg-white rounded-2xl shadow-2xl z-50 border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-gray-50 to-white">
        <span className="font-semibold" style={{ color: profile.primaryColor }}>⚙️ Panel de Editor</span>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0"><X size={16} /></Button>
      </div>
      
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full grid grid-cols-4 bg-gray-50 p-1">
          <TabsTrigger value="profile" className="text-sm">👤 Perfil</TabsTrigger>
          <TabsTrigger value="social" className="text-sm">🌐 Redes</TabsTrigger>
          <TabsTrigger value="colors" className="text-sm">🎨 Colores</TabsTrigger>
          <TabsTrigger value="themes" className="text-sm">🎭 Plantillas</TabsTrigger>
        </TabsList>

        <div className="max-h-[50vh] overflow-y-auto p-4">
          <TabsContent value="profile" className="space-y-3 mt-0">
            <div><Label className="text-xs text-gray-500">Nombre</Label>
              <Input value={currentData.name} onChange={(e) => setData({ ...currentData, name: e.target.value })} className="mt-1" /></div>
            <div><Label className="text-xs text-gray-500">Título Profesional</Label>
              <Input value={currentData.title} onChange={(e) => setData({ ...currentData, title: e.target.value })} className="mt-1" /></div>
            <div><Label className="text-xs text-gray-500">Biografía</Label>
              <Textarea value={currentData.bio} onChange={(e) => setData({ ...currentData, bio: e.target.value })} rows={3} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs text-gray-500">Email</Label>
                <Input value={currentData.email} onChange={(e) => setData({ ...currentData, email: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs text-gray-500">Teléfono</Label>
                <Input value={currentData.phone} onChange={(e) => setData({ ...currentData, phone: e.target.value })} className="mt-1" /></div>
            </div>
            <div><Label className="text-xs text-gray-500">Ubicación</Label>
              <Input value={currentData.location} onChange={(e) => setData({ ...currentData, location: e.target.value })} className="mt-1" /></div>
          </TabsContent>

          <TabsContent value="social" className="space-y-2 mt-0">
            <p className="text-xs text-gray-500 mb-3">Deja vacío las redes que no quieras mostrar</p>
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              const url = currentSocialLinks[platform.id] || '';
              return (
                <div key={platform.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <Input 
                      value={url} 
                      onChange={(e) => updateSocialLink(platform.id, e.target.value)} 
                      placeholder={platform.placeholder}
                      className="text-xs h-8"
                    />
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="colors" className="space-y-3 mt-0">
            {[
              { key: 'primaryColor', label: 'Color Primario' },
              { key: 'secondaryColor', label: 'Color Secundario' },
              { key: 'accentColor', label: 'Color Acento' },
              { key: 'backgroundColor', label: 'Color de Fondo' },
              { key: 'textColor', label: 'Color de Texto' },
            ].map(({ key, label }) => (
              <div key={key}>
                <Label className="text-xs text-gray-500">{label}</Label>
                <div className="flex gap-2 mt-1">
                  <Input type="color" value={currentData[key as keyof typeof currentData] as string} onChange={(e) => setData({ ...currentData, [key]: e.target.value })} className="w-12 h-9 p-1" />
                  <Input value={currentData[key as keyof typeof currentData] as string} onChange={(e) => setData({ ...currentData, [key]: e.target.value })} className="flex-1 text-xs" />
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="themes" className="mt-0">
            <p className="text-xs text-gray-500 mb-3">Selecciona una plantilla para cambiar el diseño visual</p>
            <div className="space-y-2">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    const colorsToUpdate: any = {};
                    if (t.colors.primaryColor) colorsToUpdate.primaryColor = t.colors.primaryColor;
                    if (t.colors.secondaryColor) colorsToUpdate.secondaryColor = t.colors.secondaryColor;
                    if (t.colors.accentColor) colorsToUpdate.accentColor = t.colors.accentColor;
                    if (t.colors.backgroundColor) colorsToUpdate.backgroundColor = t.colors.backgroundColor;
                    if (t.colors.textColor) colorsToUpdate.textColor = t.colors.textColor;
                    setData({ ...currentData, ...colorsToUpdate, theme: t.id });
                  }}
                  className={`w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                    (currentData as any).theme === t.id || ((!(currentData as any).theme || (currentData as any).theme === 'default') && t.id === 'default')
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <div className="flex-1">
                    <span className="font-medium text-sm">{t.name}</span>
                    <p className="text-xs text-gray-500">{t.description}</p>
                  </div>
                  {t.colors.primaryColor && (
                    <div className="flex gap-1">
                      {[t.colors.primaryColor, t.colors.secondaryColor, t.colors.accentColor].filter(Boolean).map((c, i) => (
                        <div key={i} className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="p-4 border-t bg-gray-50">
        <Button onClick={handleSave} disabled={saving} className="w-full gap-2" style={{ backgroundColor: profile.primaryColor, color: 'white' }}>
          {saving ? '⏳ Guardando...' : '💾 Guardar Todos los Cambios'}
        </Button>
      </div>
    </motion.div>
  );
}

// Project Edit Modal - FIXED to properly load data
function ProjectEditModal({ project, onClose, onSave, primaryColor }: any) {
  const initialData = {
    title: project?.title || '',
    description: project?.description || '',
    technologies: project?.technologies || '',
    url: project?.url || '',
    images: project?.images ? (typeof project.images === 'string' ? JSON.parse(project.images) : project.images) : []
  };
  
  const [data, setData] = useState(initialData);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => setData(p => ({ ...p, images: [...p.images, ev.target?.result as string] }));
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setData(p => ({ ...p, images: p.images.filter((_, i) => i !== index) }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{project?.id ? '✏️ Editar Proyecto' : '➕ Nuevo Proyecto'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Título *</Label>
            <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className="mt-1" placeholder="Nombre del proyecto" />
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} rows={3} className="mt-1" placeholder="Describe el proyecto..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>URL</Label>
              <Input value={data.url} onChange={(e) => setData({ ...data, url: e.target.value })} className="mt-1" placeholder="https://..." />
            </div>
            <div>
              <Label>Tecnologías</Label>
              <Input value={data.technologies} onChange={(e) => setData({ ...data, technologies: e.target.value })} placeholder="React, Node, etc" className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Imágenes</Label>
            <Input type="file" accept="image/*" multiple onChange={handleImageUpload} className="mt-1" />
            <div className="flex gap-2 mt-2 flex-wrap">
              {data.images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt={`Preview ${i+1}`} className="w-16 h-16 object-cover rounded-lg border" />
                  <button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave({ ...data, images: JSON.stringify(data.images) })} style={{ backgroundColor: primaryColor, color: 'white' }}>
            {project?.id ? 'Guardar Cambios' : 'Agregar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Certificate Edit Modal - FIXED
function CertificateEditModal({ certificate, onClose, onSave, primaryColor }: any) {
  const initialData = {
    title: certificate?.title || '',
    institution: certificate?.institution || '',
    issueDate: certificate?.issueDate || '',
    fileData: certificate?.fileData || '',
    fileType: certificate?.fileType || ''
  };
  
  const [data, setData] = useState(initialData);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setData({ 
        ...data, 
        fileData: ev.target?.result as string, 
        fileType: file.type.includes('pdf') ? 'pdf' : 'image' 
      });
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{certificate?.id ? '✏️ Editar Certificado' : '➕ Nuevo Certificado'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Título *</Label>
            <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className="mt-1" placeholder="Nombre del certificado" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Institución</Label>
              <Input value={data.institution} onChange={(e) => setData({ ...data, institution: e.target.value })} className="mt-1" placeholder="¿Quién lo emitió?" />
            </div>
            <div>
              <Label>Fecha</Label>
              <Input value={data.issueDate} onChange={(e) => setData({ ...data, issueDate: e.target.value })} placeholder="2023-06" className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Archivo (PDF o Imagen)</Label>
            <Input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="mt-1" />
            {data.fileData && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg flex items-center gap-2 border border-green-200">
                {data.fileType === 'pdf' ? <FileText size={20} className="text-red-500" /> : <ImageIcon size={20} className="text-blue-500" />}
                <span className="text-sm text-green-700">✓ Archivo cargado correctamente</span>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(data)} style={{ backgroundColor: primaryColor, color: 'white' }}>
            {certificate?.id ? 'Guardar Cambios' : 'Agregar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Experience Edit Modal - FIXED
function ExperienceEditModal({ experience, onClose, onSave, primaryColor }: any) {
  const initialData = {
    title: experience?.title || '',
    company: experience?.company || '',
    location: experience?.location || '',
    startDate: experience?.startDate || '',
    endDate: experience?.endDate || '',
    description: experience?.description || '',
    type: experience?.type || 'work'
  };
  
  const [data, setData] = useState(initialData);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{experience?.id ? '✏️ Editar Experiencia' : '➕ Nueva Experiencia'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Título / Puesto *</Label>
            <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className="mt-1" placeholder="¿Cuál era tu puesto?" />
          </div>
          <div>
            <Label>Empresa / Institución *</Label>
            <Input value={data.company} onChange={(e) => setData({ ...data, company: e.target.value })} className="mt-1" placeholder="¿Dónde trabajabas?" />
          </div>
          <div>
            <Label>Ubicación</Label>
            <Input value={data.location} onChange={(e) => setData({ ...data, location: e.target.value })} className="mt-1" placeholder="Ciudad, País" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha Inicio</Label>
              <Input value={data.startDate} onChange={(e) => setData({ ...data, startDate: e.target.value })} placeholder="2020-01" className="mt-1" />
            </div>
            <div>
              <Label>Fecha Fin</Label>
              <Input value={data.endDate} onChange={(e) => setData({ ...data, endDate: e.target.value })} placeholder="Vacío = actual" className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} rows={3} className="mt-1" placeholder="¿Qué hacías ahí?" />
          </div>
          <div>
            <Label>Tipo</Label>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant={data.type === 'work' ? 'default' : 'outline'} onClick={() => setData({ ...data, type: 'work' })} className="flex-1"
                style={data.type === 'work' ? { backgroundColor: primaryColor, color: 'white' } : {}}>💼 Trabajo</Button>
              <Button size="sm" variant={data.type === 'education' ? 'default' : 'outline'} onClick={() => setData({ ...data, type: 'education' })} className="flex-1"
                style={data.type === 'education' ? { backgroundColor: primaryColor, color: 'white' } : {}}>🎓 Educación</Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(data)} style={{ backgroundColor: primaryColor, color: 'white' }}>
            {experience?.id ? 'Guardar Cambios' : 'Agregar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Skill Edit Modal - FIXED
function SkillEditModal({ skill, onClose, onSave, primaryColor }: any) {
  const categories = ['General', 'Frontend', 'Backend', 'DevOps', 'Herramientas', 'Mobile', 'Design', 'Database'];
  
  const initialData = {
    name: skill?.name || '',
    level: skill?.level || 80,
    category: skill?.category || 'General'
  };
  
  const [data, setData] = useState(initialData);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{skill?.id ? '✏️ Editar Habilidad' : '➕ Nueva Habilidad'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Nombre *</Label>
            <Input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="mt-1" placeholder="Ej: JavaScript, React, etc." />
          </div>
          <div>
            <Label>Nivel: {data.level}%</Label>
            <input type="range" min="0" max="100" value={data.level} onChange={(e) => setData({ ...data, level: parseInt(e.target.value) })}
              className="w-full mt-2 h-2 rounded-lg appearance-none cursor-pointer" style={{ accentColor: primaryColor }} />
          </div>
          <div>
            <Label>Categoría</Label>
            <select value={data.category} onChange={(e) => setData({ ...data, category: e.target.value })}
              className="w-full mt-1 p-2 border rounded-lg bg-white">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(data)} style={{ backgroundColor: primaryColor, color: 'white' }}>
            {skill?.id ? 'Guardar Cambios' : 'Agregar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// PDF functionality moved to PDFCanvasEditor component
export default function Home() {
  return (
    <AuthProvider>
      <DataProvider>
        <PortfolioApp />
      </DataProvider>
    </AuthProvider>
  );
}
