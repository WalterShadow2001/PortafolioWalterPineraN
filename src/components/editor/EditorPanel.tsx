'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { useData } from '@/lib/contexts/data-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Lock, LogOut, Plus, Trash2, Edit2, Palette, 
  Folder, Award, Briefcase, Code, Save, User,
  ChevronDown, ChevronUp, X
} from 'lucide-react';
import { toast } from 'sonner';

export function LoginButton() {
  const { isAuthenticated, login, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (login(password)) {
      setShowLogin(false);
      setPassword('');
      toast.success('Modo editor activado');
    } else {
      toast.error('Contraseña incorrecta');
    }
  };

  if (isAuthenticated) {
    return (
      <Button
        onClick={logout}
        variant="outline"
        className="fixed top-4 right-4 z-50 gap-2"
      >
        <LogOut size={16} />
        Salir del Editor
      </Button>
    );
  }

  return (
    <Dialog open={showLogin} onOpenChange={setShowLogin}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-4 right-4 z-50 opacity-20 hover:opacity-100 transition-opacity"
        >
          <Lock size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modo Editor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Ingresa la contraseña"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleLogin}>Entrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditorPanel() {
  const { profile, updateProfile, addProject, updateProject, deleteProject, 
          addCertificate, updateCertificate, deleteCertificate,
          addExperience, updateExperience, deleteExperience,
          addSkill, updateSkill, deleteSkill } = useData();
  const [activeTab, setActiveTab] = useState('profile');
  const [isMinimized, setIsMinimized] = useState(false);

  if (!profile) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-40 overflow-hidden transition-all ${isMinimized ? 'h-12' : ''}`}>
      <div className="flex items-center justify-between px-2 py-1 bg-gray-100 dark:bg-gray-700">
        <span className="text-sm font-medium px-2">Panel de Editor</span>
        <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)}>
          {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </div>
      
      {!isMinimized && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-6 h-auto">
            <TabsTrigger value="profile" className="p-2"><User size={14} /></TabsTrigger>
            <TabsTrigger value="colors" className="p-2"><Palette size={14} /></TabsTrigger>
            <TabsTrigger value="projects" className="p-2"><Folder size={14} /></TabsTrigger>
            <TabsTrigger value="certificates" className="p-2"><Award size={14} /></TabsTrigger>
            <TabsTrigger value="experience" className="p-2"><Briefcase size={14} /></TabsTrigger>
            <TabsTrigger value="skills" className="p-2"><Code size={14} /></TabsTrigger>
          </TabsList>

          <div className="max-h-[60vh] overflow-y-auto">
            <TabsContent value="profile" className="p-4 space-y-4">
              <h3 className="font-semibold">Información Personal</h3>
              <ProfileEditor profile={profile} updateProfile={updateProfile} />
            </TabsContent>

            <TabsContent value="colors" className="p-4 space-y-4">
              <h3 className="font-semibold">Personalizar Colores</h3>
              <ColorEditor profile={profile} updateProfile={updateProfile} />
            </TabsContent>

            <TabsContent value="projects" className="p-4 space-y-4">
              <h3 className="font-semibold">Proyectos</h3>
              <ProjectEditor 
                projects={profile.projects} 
                addProject={addProject} 
                updateProject={updateProject}
                deleteProject={deleteProject}
                primaryColor={profile.primaryColor}
              />
            </TabsContent>

            <TabsContent value="certificates" className="p-4 space-y-4">
              <h3 className="font-semibold">Certificados</h3>
              <CertificateEditor 
                certificates={profile.certificates} 
                addCertificate={addCertificate}
                updateCertificate={updateCertificate}
                deleteCertificate={deleteCertificate}
                primaryColor={profile.primaryColor}
              />
            </TabsContent>

            <TabsContent value="experience" className="p-4 space-y-4">
              <h3 className="font-semibold">Experiencia</h3>
              <ExperienceEditor 
                experiences={profile.experiences} 
                addExperience={addExperience}
                updateExperience={updateExperience}
                deleteExperience={deleteExperience}
                primaryColor={profile.primaryColor}
              />
            </TabsContent>

            <TabsContent value="skills" className="p-4 space-y-4">
              <h3 className="font-semibold">Habilidades</h3>
              <SkillEditor 
                skills={profile.skills} 
                addSkill={addSkill}
                updateSkill={updateSkill}
                deleteSkill={deleteSkill}
                primaryColor={profile.primaryColor}
              />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
}

function ProfileEditor({ profile, updateProfile }: { profile: any; updateProfile: (data: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    title: profile.title || '',
    bio: profile.bio || '',
    email: profile.email || '',
    phone: profile.phone || '',
    location: profile.location || '',
    website: profile.website || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(formData);
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.error('Error al guardar');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Nombre</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Tu nombre"
        />
      </div>
      <div>
        <Label className="text-xs">Título Profesional</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Tu título"
        />
      </div>
      <div>
        <Label className="text-xs">Biografía</Label>
        <Textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Una breve descripción sobre ti"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <Label className="text-xs">Teléfono</Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 234 567 890"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Ubicación</Label>
        <Input
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Ciudad, País"
        />
      </div>
      <div>
        <Label className="text-xs">Sitio Web</Label>
        <Input
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://tusitio.com"
        />
      </div>
      <Button onClick={handleSave} className="w-full gap-2" disabled={saving}>
        <Save size={16} />
        {saving ? 'Guardando...' : 'Guardar Perfil'}
      </Button>
    </div>
  );
}

function ColorEditor({ profile, updateProfile }: { profile: any; updateProfile: (data: any) => Promise<void> }) {
  const [colors, setColors] = useState({
    primaryColor: profile.primaryColor,
    secondaryColor: profile.secondaryColor,
    accentColor: profile.accentColor,
    backgroundColor: profile.backgroundColor,
    textColor: profile.textColor,
  });

  const handleSave = async () => {
    await updateProfile(colors);
    toast.success('Colores actualizados');
  };

  return (
    <div className="space-y-3">
      {Object.entries(colors).map(([key, value]) => (
        <div key={key} className="flex items-center gap-3">
          <Label className="flex-1 capitalize text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
          <Input
            type="color"
            value={value}
            onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
            className="w-16 h-8 p-1"
          />
        </div>
      ))}
      <Button onClick={handleSave} className="w-full gap-2">
        <Save size={16} />
        Guardar Colores
      </Button>
    </div>
  );
}

function ProjectEditor({ projects, addProject, updateProject, deleteProject, primaryColor }: { 
  projects: any[]; 
  addProject: (data: any) => Promise<void>;
  updateProject: (id: string, data: any) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  primaryColor: string;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    url: '',
    technologies: '',
    images: [] as string[],
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setNewProject(prev => ({
            ...prev,
            images: [...prev.images, e.target?.result as string],
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setNewProject(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAdd = async () => {
    if (!newProject.title) return toast.error('El título es requerido');
    await addProject({
      ...newProject,
      images: JSON.stringify(newProject.images),
      order: projects.length,
    });
    setNewProject({ title: '', description: '', url: '', technologies: '', images: [] });
    setShowAdd(false);
    toast.success('Proyecto agregado');
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      await deleteProject(id);
      toast.success('Proyecto eliminado');
    }
  };

  return (
    <div className="space-y-3">
      {projects.map((p) => (
        <div key={p.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm group relative">
          <div className="font-medium">{p.title}</div>
          <div className="text-gray-500 text-xs">{p.technologies}</div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            onClick={() => handleDelete(p.id)}
          >
            <Trash2 size={14} className="text-red-500" />
          </Button>
        </div>
      ))}
      
      {showAdd ? (
        <div className="space-y-2 p-2 border rounded">
          <Input
            placeholder="Título *"
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
          />
          <Textarea
            placeholder="Descripción"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            rows={2}
          />
          <Input
            placeholder="URL (opcional)"
            value={newProject.url}
            onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
          />
          <Input
            placeholder="Tecnologías (separadas por coma)"
            value={newProject.technologies}
            onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
          />
          <div>
            <Label className="text-xs">Imágenes del Proyecto</Label>
            <Input type="file" accept="image/*" multiple onChange={handleImageUpload} />
            <div className="flex gap-2 mt-2 flex-wrap">
              {newProject.images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="w-16 h-16 object-cover rounded" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} size="sm">Agregar</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancelar</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setShowAdd(true)} size="sm" className="w-full gap-2">
          <Plus size={16} />
          Agregar Proyecto
        </Button>
      )}
    </div>
  );
}

function CertificateEditor({ certificates, addCertificate, updateCertificate, deleteCertificate, primaryColor }: { 
  certificates: any[]; 
  addCertificate: (data: any) => Promise<void>;
  updateCertificate: (id: string, data: any) => Promise<void>;
  deleteCertificate: (id: string) => Promise<void>;
  primaryColor: string;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newCert, setNewCert] = useState({
    title: '',
    institution: '',
    issueDate: '',
    fileData: '',
    fileType: '',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileType = file.type.includes('pdf') ? 'pdf' : file.type.split('/')[1];
        setNewCert({
          ...newCert,
          fileData: e.target?.result as string,
          fileType,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!newCert.title) return toast.error('El título es requerido');
    await addCertificate({
      ...newCert,
      order: certificates.length,
    });
    setNewCert({ title: '', institution: '', issueDate: '', fileData: '', fileType: '' });
    setShowAdd(false);
    toast.success('Certificado agregado');
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este certificado?')) {
      await deleteCertificate(id);
      toast.success('Certificado eliminado');
    }
  };

  return (
    <div className="space-y-3">
      {certificates.map((c) => (
        <div key={c.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm group relative">
          <div className="font-medium">{c.title}</div>
          <div className="text-gray-500 text-xs">{c.institution}</div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            onClick={() => handleDelete(c.id)}
          >
            <Trash2 size={14} className="text-red-500" />
          </Button>
        </div>
      ))}
      
      {showAdd ? (
        <div className="space-y-2 p-2 border rounded">
          <Input
            placeholder="Título *"
            value={newCert.title}
            onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
          />
          <Input
            placeholder="Institución"
            value={newCert.institution}
            onChange={(e) => setNewCert({ ...newCert, institution: e.target.value })}
          />
          <Input
            placeholder="Fecha (ej: 2023-06)"
            value={newCert.issueDate}
            onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
          />
          <div>
            <Label className="text-xs">Archivo (PDF o Imagen)</Label>
            <Input type="file" accept="image/*,.pdf" onChange={handleFileUpload} />
            {newCert.fileData && (
              <div className="mt-2">
                {newCert.fileType === 'pdf' ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Award size={16} />
                    PDF cargado ✓
                  </div>
                ) : (
                  <img src={newCert.fileData} alt="Preview" className="w-20 h-20 object-cover rounded" />
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} size="sm">Agregar</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancelar</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setShowAdd(true)} size="sm" className="w-full gap-2">
          <Plus size={16} />
          Agregar Certificado
        </Button>
      )}
    </div>
  );
}

function ExperienceEditor({ experiences, addExperience, updateExperience, deleteExperience, primaryColor }: { 
  experiences: any[]; 
  addExperience: (data: any) => Promise<void>;
  updateExperience: (id: string, data: any) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  primaryColor: string;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newExp, setNewExp] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    type: 'work',
  });

  const handleAdd = async () => {
    if (!newExp.title || !newExp.company) return toast.error('Título y empresa son requeridos');
    await addExperience({
      ...newExp,
      order: experiences.length,
    });
    setNewExp({ title: '', company: '', location: '', startDate: '', endDate: '', description: '', type: 'work' });
    setShowAdd(false);
    toast.success('Experiencia agregada');
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta experiencia?')) {
      await deleteExperience(id);
      toast.success('Experiencia eliminada');
    }
  };

  return (
    <div className="space-y-3">
      {experiences.map((e) => (
        <div key={e.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm group relative">
          <div className="font-medium">{e.title}</div>
          <div className="text-gray-500 text-xs">{e.company}</div>
          <div className={`text-xs ${e.type === 'work' ? 'text-blue-500' : 'text-green-500'}`}>
            {e.type === 'work' ? '💼 Trabajo' : '🎓 Educación'}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            onClick={() => handleDelete(e.id)}
          >
            <Trash2 size={14} className="text-red-500" />
          </Button>
        </div>
      ))}
      
      {showAdd ? (
        <div className="space-y-2 p-2 border rounded">
          <Input
            placeholder="Título / Puesto *"
            value={newExp.title}
            onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
          />
          <Input
            placeholder="Empresa / Institución *"
            value={newExp.company}
            onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
          />
          <Input
            placeholder="Ubicación"
            value={newExp.location}
            onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Inicio (ej: 2020-01)"
              value={newExp.startDate}
              onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
              className="flex-1"
            />
            <Input
              placeholder="Fin (vacío = actual)"
              value={newExp.endDate}
              onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
              className="flex-1"
            />
          </div>
          <Textarea
            placeholder="Descripción"
            value={newExp.description}
            onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
            rows={2}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={newExp.type === 'work' ? 'default' : 'outline'}
              onClick={() => setNewExp({ ...newExp, type: 'work' })}
              className="flex-1"
            >
              Trabajo
            </Button>
            <Button
              size="sm"
              variant={newExp.type === 'education' ? 'default' : 'outline'}
              onClick={() => setNewExp({ ...newExp, type: 'education' })}
              className="flex-1"
            >
              Educación
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} size="sm">Agregar</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancelar</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setShowAdd(true)} size="sm" className="w-full gap-2">
          <Plus size={16} />
          Agregar Experiencia
        </Button>
      )}
    </div>
  );
}

function SkillEditor({ skills, addSkill, updateSkill, deleteSkill, primaryColor }: { 
  skills: any[]; 
  addSkill: (data: any) => Promise<void>;
  updateSkill: (id: string, data: any) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  primaryColor: string;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: '',
    level: 80,
    category: 'General',
  });

  const handleAdd = async () => {
    if (!newSkill.name) return toast.error('El nombre es requerido');
    await addSkill({
      ...newSkill,
      order: skills.length,
    });
    setNewSkill({ name: '', level: 80, category: 'General' });
    setShowAdd(false);
    toast.success('Habilidad agregada');
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta habilidad?')) {
      await deleteSkill(id);
      toast.success('Habilidad eliminada');
    }
  };

  const categories = ['General', 'Frontend', 'Backend', 'DevOps', 'Herramientas', 'Database', 'Mobile', 'Design'];

  return (
    <div className="space-y-3">
      {skills.map((s) => (
        <div key={s.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm flex justify-between items-center group relative">
          <div className="flex-1">
            <span className="font-medium">{s.name}</span>
            <span className="text-xs text-gray-500 ml-2">{s.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">{s.level}%</span>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              onClick={() => handleDelete(s.id)}
            >
              <Trash2 size={14} className="text-red-500" />
            </Button>
          </div>
        </div>
      ))}
      
      {showAdd ? (
        <div className="space-y-2 p-2 border rounded">
          <Input
            placeholder="Nombre de la habilidad *"
            value={newSkill.name}
            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
          />
          <div>
            <Label className="text-xs">Nivel: {newSkill.level}%</Label>
            <input
              type="range"
              min="0"
              max="100"
              value={newSkill.level}
              onChange={(e) => setNewSkill({ ...newSkill, level: parseInt(e.target.value) })}
              className="w-full"
              style={{ accentColor: primaryColor }}
            />
          </div>
          <div>
            <Label className="text-xs">Categoría</Label>
            <select
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} size="sm">Agregar</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancelar</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setShowAdd(true)} size="sm" className="w-full gap-2">
          <Plus size={16} />
          Agregar Habilidad
        </Button>
      )}
    </div>
  );
}
