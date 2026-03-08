'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { AuthProvider, useAuth } from '@/lib/contexts/auth-context';
import { DataProvider, useData } from '@/lib/contexts/data-context';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, ChevronUp, 
  Mail, Phone, MapPin, Calendar, ExternalLink, 
  Briefcase, GraduationCap, Award, Code, 
  Camera, X, Download, Eye, Edit2, Trash2, Plus,
  Linkedin, Github, Twitter, Globe, FileText, Image as ImageIcon, Save, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Empty subscription for SSR
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

// Icon map
const socialIconMap: { [key: string]: typeof Linkedin } = {
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  instagram: Globe,
};

function PortfolioApp() {
  const { profile, loading, updateProfile, addProject, updateProject, deleteProject, 
          addCertificate, updateCertificate, deleteCertificate,
          addExperience, updateExperience, deleteExperience,
          addSkill, updateSkill, deleteSkill } = useData();
  const { isAuthenticated, login, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  
  // Edit modals state
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editingCertificate, setEditingCertificate] = useState<any>(null);
  const [editingExperience, setEditingExperience] = useState<any>(null);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  
  const isClient = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

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

  const handleLogin = () => {
    if (login(password)) {
      setShowLogin(false);
      setPassword('');
      toast.success('🔒 Modo editor activado');
    } else {
      toast.error('❌ Contraseña incorrecta');
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

  // Loading state
  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <span className="text-gray-500 text-lg">Cargando portafolio...</span>
        </motion.div>
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: profile.backgroundColor, color: profile.textColor }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
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
                  <Button variant="ghost" size="sm" className="opacity-30 hover:opacity-100">🔒</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>🔐 Modo Editor</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label>Contraseña</Label>
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="Ingresa la contraseña" className="mt-2" />
                    </div>
                    <Button onClick={handleLogin} className="w-full" style={{ backgroundColor: profile.primaryColor, color: 'white' }}>
                      Entrar al Editor
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

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-4xl md:text-6xl font-bold mb-4">
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
            {profile.socialLinks?.map((link: any) => {
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
        <section id="about" className="py-20 px-4" style={{ backgroundColor: `${profile.primaryColor}08` }}>
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
                      <div className="bg-white p-5 rounded-xl shadow-sm ml-4 card-hover border border-gray-100">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-lg">{exp.title}</h4>
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
                      <div className="bg-white p-5 rounded-xl shadow-sm ml-4 card-hover border border-gray-100">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-lg">{exp.title}</h4>
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
        <section id="projects" className="py-20 px-4" style={{ backgroundColor: `${profile.primaryColor}08` }}>
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
                    className="bg-white rounded-xl shadow-sm overflow-hidden card-hover border border-gray-100 group">
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
                        <h3 className="font-semibold text-lg">{project.title}</h3>
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
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: profile.primaryColor }}>
                    <Code size={20} /> {category}
                  </h3>
                  <div className="space-y-4">
                    {skills.map((skill: any, si: number) => (
                      <div key={skill.id} className="group">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{skill.name}</span>
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
        <section id="certificates" className="py-20 px-4" style={{ backgroundColor: `${profile.primaryColor}08` }}>
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
                    className="bg-white rounded-xl shadow-sm overflow-hidden card-hover border border-gray-100 group">
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
                      <h3 className="font-semibold text-lg">{cert.title}</h3>
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
              <a href={`mailto:${profile.email}`} className="flex items-center justify-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <Mail style={{ color: profile.primaryColor }} size={24} />
                <span className="text-lg">{profile.email}</span>
              </a>
            )}
            {profile.phone && (
              <a href={`tel:${profile.phone}`} className="flex items-center justify-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <Phone style={{ color: profile.primaryColor }} size={24} />
                <span className="text-lg">{profile.phone}</span>
              </a>
            )}
            {profile.location && (
              <div className="flex items-center justify-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <MapPin style={{ color: profile.primaryColor }} size={24} />
                <span className="text-lg">{profile.location}</span>
              </div>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex justify-center gap-4 mt-8">
            {profile.socialLinks?.map((link: any) => {
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
      <footer className="py-8 text-center text-sm border-t" style={{ borderColor: `${profile.primaryColor}20` }}>
        <p style={{ color: profile.textColor, opacity: 0.6 }}>
          © {new Date().getFullYear()} {profile.name}. Todos los derechos reservados.
        </p>
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

      {/* PDF Export Dialog */}
      <PDFExportDialog open={showPdfDialog} onOpenChange={setShowPdfDialog} profile={profile} />

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
    </div>
  );
}

// Editor Panel
function EditorPanel({ profile, updateProfile, onClose }: any) {
  const [data, setData] = useState({
    name: '', title: '', bio: '', email: '', phone: '', location: '',
    primaryColor: '#3b82f6', secondaryColor: '#1e40af', accentColor: '#f59e0b',
    backgroundColor: '#ffffff', textColor: '#1f2937',
  });

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
  };
  
  // Use initial data directly
  const currentData = data.name ? data : initialData;

  const [tab, setTab] = useState('profile');

  const handleSave = async () => {
    await updateProfile(currentData);
    toast.success('✅ Cambios guardados');
  };

  return (
    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[420px] bg-white rounded-2xl shadow-2xl z-50 border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-gray-50 to-white">
        <span className="font-semibold" style={{ color: profile.primaryColor }}>⚙️ Panel de Editor</span>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0"><X size={16} /></Button>
      </div>
      
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full grid grid-cols-2 bg-gray-50 p-1">
          <TabsTrigger value="profile" className="text-sm">👤 Perfil</TabsTrigger>
          <TabsTrigger value="colors" className="text-sm">🎨 Colores</TabsTrigger>
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
        </div>
      </Tabs>
      
      <div className="p-4 border-t bg-gray-50">
        <Button onClick={handleSave} className="w-full gap-2" style={{ backgroundColor: profile.primaryColor, color: 'white' }}>
          <Save size={16} /> Guardar Todos los Cambios
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

// PDF Export Dialog
function PDFExportDialog({ open, onOpenChange, profile }: any) {
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [sections, setSections] = useState({ experience: true, projects: true, skills: true, certificates: true, contact: true });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = generateCVHTML(profile, selectedTemplate, sections);
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  const templates = [
    { id: 'classic', name: 'Clásico', desc: 'Tradicional y profesional' },
    { id: 'modern', name: 'Moderno', desc: 'Barra lateral con color' },
    { id: 'creative', name: 'Creativo', desc: 'Diseño con gradientes' },
    { id: 'minimal', name: 'Minimalista', desc: 'Solo lo esencial' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">📄 Generar CV en PDF</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 py-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Plantilla</h3>
              <div className="grid grid-cols-2 gap-2">
                {templates.map(t => (
                  <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${selectedTemplate === t.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}`}>
                    <span className="font-medium">{t.name}</span>
                    <p className="text-xs text-gray-500">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Secciones a incluir</h3>
              <div className="space-y-2">
                {Object.entries(sections).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" checked={value as boolean} onChange={(e) => setSections({ ...sections, [key]: e.target.checked })} className="w-4 h-4" />
                    <span className="capitalize">{key === 'experience' ? '💼 Experiencia y Educación' : key === 'projects' ? '📁 Proyectos' : key === 'skills' ? '💻 Habilidades' : key === 'certificates' ? '🏆 Certificados' : '📧 Contacto'}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={handlePrint} className="w-full gap-2 py-6 text-lg" style={{ backgroundColor: profile.primaryColor, color: 'white' }}>
              📥 Generar e Imprimir PDF
            </Button>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Vista Previa</h3>
            <div className="border rounded-lg overflow-hidden bg-white shadow-inner" style={{ transform: 'scale(0.55)', transformOrigin: 'top left', width: '182%', height: '550px' }}>
              <div dangerouslySetInnerHTML={{ __html: generateCVContent(profile, selectedTemplate, sections) }} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function generateCVHTML(profile: any, template: string, sections: any): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>CV - ${profile.name}</title><style>${getStyles(template, profile)}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:letter;margin:0}}</style></head><body>${generateCVContent(profile, template, sections)}</body></html>`;
}

function getStyles(template: string, profile: any): string {
  const base = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:10pt;line-height:1.4;color:#333;background:#fff}`;
  const photoStyle = profile.photo 
    ? `.photo-circle{width:80px;height:80px;border-radius:50%;overflow:hidden;margin:0 auto 12px;border:3px solid ${profile.primaryColor}}.photo-circle img{width:100%;height:100%;object:cover}` 
    : `.photo-circle{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,${profile.primaryColor},${profile.secondaryColor});display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:#fff;font-size:28pt;font-weight:bold;border:3px solid ${profile.primaryColor}}`;
  
  switch(template) {
    case 'modern':
      return base + `.cv-container{display:flex;min-height:11in}.sidebar{width:32%;background:${profile.primaryColor};color:#fff;padding:20px}.main{width:68%;padding:20px}${photoStyle}.name{font-size:16pt;font-weight:bold;text-align:center;margin-bottom:4px}.title{font-size:10pt;text-align:center;opacity:0.9;margin-bottom:15px}.sidebar-section{margin-bottom:15px}.sidebar-title{font-size:9pt;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.3);padding-bottom:4px;margin-bottom:8px;text-transform:uppercase}.contact-item{margin-bottom:6px;font-size:9pt}.section{margin-bottom:12px}.section-title{font-size:10pt;font-weight:bold;color:${profile.primaryColor};margin-bottom:8px;text-transform:uppercase}.item{margin-bottom:8px}.item-title{font-weight:bold;font-size:10pt}.item-subtitle{color:#666;font-size:9pt}.skill-item{margin-bottom:6px}.skill-name{display:flex;justify-content:space-between;font-size:9pt;margin-bottom:2px}.skill-bar{height:4px;background:rgba(255,255,255,0.3);border-radius:2px}.skill-fill{height:100%;background:#fff;border-radius:2px}`;
    case 'creative':
      return base + `.cv-container{max-width:8.5in;min-height:11in;margin:0 auto;padding:0.4in}.header{background:linear-gradient(135deg,${profile.primaryColor},${profile.secondaryColor});color:#fff;padding:18px;border-radius:8px;margin-bottom:12px;display:flex;gap:15px;align-items:center}${photoStyle.replace('margin:0 auto 12px','margin:0')}.header-info{flex:1}.name{font-size:18pt;font-weight:bold}.title{font-size:11pt;opacity:0.9;margin-bottom:6px}.contact-line{font-size:8pt;opacity:0.8}.section{margin-bottom:10px}.section-title{font-size:10pt;font-weight:bold;color:${profile.primaryColor};display:flex;align-items:center;gap:8px;margin-bottom:8px}.section-title::after{content:'';flex:1;height:2px;background:linear-gradient(to right,${profile.primaryColor},transparent)}.timeline{border-left:2px solid ${profile.primaryColor};padding-left:12px}.item{margin-bottom:8px;position:relative}.item::before{content:'';position:absolute;left:-16px;top:3px;width:6px;height:6px;border-radius:50%;background:${profile.primaryColor}}.item-title{font-weight:bold;font-size:10pt}.item-subtitle{color:#666;font-size:9pt}.skills-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.skill-item{text-align:center}.skill-circle{width:35px;height:35px;border-radius:50%;border:2px solid ${profile.primaryColor};display:flex;align-items:center;justify-content:center;margin:0 auto 3px;font-weight:bold;font-size:9pt}.skill-name{font-size:8pt}`;
    case 'minimal':
      return base + `.cv-container{max-width:8.5in;min-height:11in;margin:0 auto;padding:0.5in}.header{text-align:center;margin-bottom:18px}${photoStyle}.name{font-size:26pt;font-weight:300;letter-spacing:3px;margin-bottom:6px;text-transform:uppercase}.title{font-size:11pt;color:#888;letter-spacing:2px;margin-bottom:8px;text-transform:uppercase}.contact-line{font-size:9pt;color:#666}.section{margin-bottom:15px}.section-title{font-size:9pt;font-weight:600;letter-spacing:2px;color:#333;margin-bottom:10px;text-transform:uppercase;border-bottom:1px solid #eee;padding-bottom:4px}.item{margin-bottom:10px}.item-header{display:flex;justify-content:space-between}.item-title{font-weight:500;font-size:10pt}.item-date{color:#888;font-size:9pt}.item-subtitle{color:#666;font-size:9pt;margin-top:2px}.skills-list{display:flex;flex-wrap:wrap;gap:4px}.skill-tag{padding:3px 8px;background:#f0f0f0;border-radius:3px;font-size:9pt}`;
    default:
      return base + `.cv-container{max-width:8.5in;min-height:11in;margin:0 auto;padding:0.4in}.header{text-align:center;border-bottom:2px solid ${profile.primaryColor};padding-bottom:12px;margin-bottom:12px}${photoStyle}.name{font-size:22pt;font-weight:bold;color:${profile.primaryColor};margin-bottom:4px}.title{font-size:12pt;color:#666;margin-bottom:8px}.contact-info{display:flex;justify-content:center;gap:15px;font-size:9pt;color:#666;flex-wrap:wrap}.section{margin-bottom:12px}.section-title{font-size:11pt;font-weight:bold;color:${profile.primaryColor};border-bottom:1px solid ${profile.primaryColor};padding-bottom:2px;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px}.item{margin-bottom:8px}.item-title{font-weight:bold;font-size:10pt}.item-subtitle{color:#666;font-size:9pt}.item-date{color:#888;font-size:8pt}.item-desc{color:#555;font-size:9pt;margin-top:2px}.skills-grid{display:flex;flex-wrap:wrap;gap:6px}.skill-item{display:flex;align-items:center;gap:4px}.skill-bar{width:50px;height:5px;background:#eee;border-radius:2px}.skill-fill{height:100%;background:${profile.primaryColor};border-radius:2px}`;
  }
}

function generateCVContent(profile: any, template: string, sections: any): string {
  const work = profile.experiences?.filter((e: any) => e.type === 'work') || [];
  const edu = profile.experiences?.filter((e: any) => e.type === 'education') || [];
  const photoHtml = profile.photo 
    ? `<div class="photo-circle"><img src="${profile.photo}" alt="${profile.name}"></div>`
    : `<div class="photo-circle">${profile.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</div>`;
  
  if (template === 'modern') {
    return `<div class="cv-container">
      <div class="sidebar">${photoHtml}<div class="name">${profile.name}</div><div class="title">${profile.title}</div>
        ${sections.contact ? `<div class="sidebar-section"><div class="sidebar-title">Contacto</div>${profile.email ? `<div class="contact-item">📧 ${profile.email}</div>` : ''}${profile.phone ? `<div class="contact-item">📱 ${profile.phone}</div>` : ''}${profile.location ? `<div class="contact-item">📍 ${profile.location}</div>` : ''}</div>` : ''}
        ${sections.skills && profile.skills?.length ? `<div class="sidebar-section"><div class="sidebar-title">Habilidades</div>${profile.skills.map((s: any) => `<div class="skill-item"><div class="skill-name"><span>${s.name}</span><span>${s.level}%</span></div><div class="skill-bar"><div class="skill-fill" style="width:${s.level}%"></div></div></div>`).join('')}</div>` : ''}
        ${sections.certificates && profile.certificates?.length ? `<div class="sidebar-section"><div class="sidebar-title">Certificados</div>${profile.certificates.map((c: any) => `<div class="contact-item"><strong>${c.title}</strong><br>${c.institution || ''} ${c.issueDate ? `(${c.issueDate})` : ''}</div>`).join('')}</div>` : ''}
      </div>
      <div class="main">
        ${profile.bio ? `<div class="section"><div class="section-title">Perfil</div><p style="font-size:9pt;color:#555">${profile.bio}</p></div>` : ''}
        ${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div>${work.map((e: any) => `<div class="item"><div class="item-title">${e.title}</div><div class="item-subtitle">${e.company} | ${e.startDate} - ${e.endDate || 'Presente'}</div></div>`).join('')}</div>` : ''}
        ${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${edu.map((e: any) => `<div class="item"><div class="item-title">${e.title}</div><div class="item-subtitle">${e.company} | ${e.startDate} - ${e.endDate || 'Presente'}</div></div>`).join('')}</div>` : ''}
        ${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${profile.projects.slice(0, 4).map((p: any) => `<div class="item"><div class="item-title">${p.title}</div><div class="item-subtitle">${p.technologies || ''}</div></div>`).join('')}</div>` : ''}
      </div>
    </div>`;
  }
  if (template === 'creative') {
    return `<div class="cv-container">
      <div class="header">${photoHtml}<div class="header-info"><div class="name">${profile.name}</div><div class="title">${profile.title}</div><div class="contact-line">${[profile.email, profile.phone, profile.location].filter(Boolean).join(' • ')}</div></div></div>
      ${profile.bio ? `<div class="section"><p style="font-size:9pt;color:#555;text-align:center">${profile.bio}</p></div>` : ''}
      ${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div><div class="timeline">${work.map((e: any) => `<div class="item"><div class="item-title">${e.title}</div><div class="item-subtitle">${e.company} • ${e.startDate} - ${e.endDate || 'Presente'}</div></div>`).join('')}</div></div>` : ''}
      ${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div><div class="timeline">${edu.map((e: any) => `<div class="item"><div class="item-title">${e.title}</div><div class="item-subtitle">${e.company} • ${e.startDate} - ${e.endDate || 'Presente'}</div></div>`).join('')}</div></div>` : ''}
      ${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="skills-grid">${profile.skills.map((s: any) => `<div class="skill-item"><div class="skill-circle">${s.level}%</div><div class="skill-name">${s.name}</div></div>`).join('')}</div></div>` : ''}
    </div>`;
  }
  if (template === 'minimal') {
    return `<div class="cv-container">
      <div class="header">${photoHtml}<div class="name">${profile.name.toUpperCase()}</div><div class="title">${profile.title}</div><div class="contact-line">${[profile.email, profile.phone, profile.location].filter(Boolean).join('  •  ')}</div></div>
      ${profile.bio ? `<div class="section"><p style="color:#555;text-align:center;font-size:10pt">${profile.bio}</p></div>` : ''}
      ${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div>${work.map((e: any) => `<div class="item"><div class="item-header"><div class="item-title">${e.title}</div><div class="item-date">${e.startDate} — ${e.endDate || 'Presente'}</div></div><div class="item-subtitle">${e.company}</div></div>`).join('')}</div>` : ''}
      ${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${edu.map((e: any) => `<div class="item"><div class="item-header"><div class="item-title">${e.title}</div><div class="item-date">${e.startDate} — ${e.endDate || 'Presente'}</div></div><div class="item-subtitle">${e.company}</div></div>`).join('')}</div>` : ''}
      ${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="skills-list">${profile.skills.map((s: any) => `<span class="skill-tag">${s.name}</span>`).join('')}</div></div>` : ''}
    </div>`;
  }
  // Classic
  return `<div class="cv-container">
    <div class="header">${photoHtml}<div class="name">${profile.name}</div><div class="title">${profile.title}</div><div class="contact-info">${profile.email ? `<span>📧 ${profile.email}</span>` : ''}${profile.phone ? `<span>📱 ${profile.phone}</span>` : ''}${profile.location ? `<span>📍 ${profile.location}</span>` : ''}</div></div>
    ${profile.bio ? `<div class="section"><div class="section-title">Perfil Profesional</div><p style="font-size:9pt;color:#555">${profile.bio}</p></div>` : ''}
    ${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia Laboral</div>${work.map((e: any) => `<div class="item"><div class="item-title">${e.title}</div><div class="item-subtitle">${e.company}${e.location ? ` • ${e.location}` : ''}</div><div class="item-date">${e.startDate} - ${e.endDate || 'Presente'}</div></div>`).join('')}</div>` : ''}
    ${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${edu.map((e: any) => `<div class="item"><div class="item-title">${e.title}</div><div class="item-subtitle">${e.company}</div><div class="item-date">${e.startDate} - ${e.endDate || 'Presente'}</div></div>`).join('')}</div>` : ''}
    ${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="skills-grid">${profile.skills.map((s: any) => `<div class="skill-item"><span style="font-size:9pt;width:80px">${s.name}</span><div class="skill-bar"><div class="skill-fill" style="width:${s.level}%"></div></div><span style="font-size:8pt;color:#888">${s.level}%</span></div>`).join('')}</div></div>` : ''}
    ${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos Destacados</div>${profile.projects.slice(0, 3).map((p: any) => `<div class="item"><div class="item-title">${p.title}</div>${p.technologies ? `<div class="item-subtitle">${p.technologies}</div>` : ''}</div>`).join('')}</div>` : ''}
    ${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificaciones</div>${profile.certificates.map((c: any) => `<div class="item"><div class="item-title">${c.title}</div><div class="item-subtitle">${c.institution || ''} ${c.issueDate ? `• ${c.issueDate}` : ''}</div></div>`).join('')}</div>` : ''}
  </div>`;
}

export default function Home() {
  return (
    <AuthProvider>
      <DataProvider>
        <PortfolioApp />
      </DataProvider>
    </AuthProvider>
  );
}
