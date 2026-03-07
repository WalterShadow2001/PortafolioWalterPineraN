'use client';

import { useState, useEffect } from 'react';
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
  DialogFooter,
  DialogTrigger,
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
  ChevronDown, ChevronUp, X, ImagePlus
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
        className="fixed top-4 right-4 z-50 gap-2 bg-white shadow-lg"
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
      <DialogContent className="bg-white">
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
  const { profile } = useData();
  const [activeTab, setActiveTab] = useState('profile');
  const [isMinimized, setIsMinimized] = useState(false);

  if (!profile) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-40 overflow-hidden transition-all ${isMinimized ? 'h-12' : ''}`}>
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
              <ProfileEditor />
            </TabsContent>

            <TabsContent value="colors" className="p-4 space-y-4">
              <h3 className="font-semibold">Personalizar Colores</h3>
              <ColorEditor />
            </TabsContent>

            <TabsContent value="projects" className="p-4 space-y-4">
              <h3 className="font-semibold">Proyectos</h3>
              <ProjectList />
            </TabsContent>

            <TabsContent value="certificates" className="p-4 space-y-4">
              <h3 className="font-semibold">Certificados</h3>
              <CertificateList />
            </TabsContent>

            <TabsContent value="experience" className="p-4 space-y-4">
              <h3 className="font-semibold">Experiencia</h3>
              <ExperienceList />
            </TabsContent>

            <TabsContent value="skills" className="p-4 space-y-4">
              <h3 className="font-semibold">Habilidades</h3>
              <SkillList />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
}

// Profile Editor
function ProfileEditor() {
  const { profile, updateProfile } = useData();
  const [formData, setFormData] = useState(() => ({
    name: profile?.name || '',
    title: profile?.title || '',
    bio: profile?.bio || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    website: profile?.website || '',
  }));
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
          className="bg-white"
        />
      </div>
      <div>
        <Label className="text-xs">Título Profesional</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Tu título"
          className="bg-white"
        />
      </div>
      <div>
        <Label className="text-xs">Biografía</Label>
        <Textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Una breve descripción sobre ti"
          rows={3}
          className="bg-white"
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
            className="bg-white"
          />
        </div>
        <div>
          <Label className="text-xs">Teléfono</Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 234 567 890"
            className="bg-white"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Ubicación</Label>
        <Input
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Ciudad, País"
          className="bg-white"
        />
      </div>
      <div>
        <Label className="text-xs">Sitio Web</Label>
        <Input
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://tusitio.com"
          className="bg-white"
        />
      </div>
      <Button onClick={handleSave} className="w-full gap-2" disabled={saving}>
        <Save size={16} />
        {saving ? 'Guardando...' : 'Guardar Perfil'}
      </Button>
    </div>
  );
}

// Color Editor
function ColorEditor() {
  const { profile, updateProfile } = useData();
  const [colors, setColors] = useState(() => ({
    primaryColor: profile?.primaryColor || '#3b82f6',
    secondaryColor: profile?.secondaryColor || '#10b981',
    accentColor: profile?.accentColor || '#f59e0b',
    backgroundColor: profile?.backgroundColor || '#ffffff',
    textColor: profile?.textColor || '#1f2937',
  }));



  const handleSave = async () => {
    await updateProfile(colors);
    toast.success('Colores actualizados');
  };

  const colorLabels: { [key: string]: string } = {
    primaryColor: 'Color Primario',
    secondaryColor: 'Color Secundario',
    accentColor: 'Color de Acento',
    backgroundColor: 'Color de Fondo',
    textColor: 'Color de Texto',
  };

  return (
    <div className="space-y-3">
      {Object.entries(colors).map(([key, value]) => (
        <div key={key} className="flex items-center gap-3">
          <Label className="flex-1 text-sm">{colorLabels[key] || key}</Label>
          <Input
            type="color"
            value={value}
            onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
            className="w-16 h-8 p-1 bg-white"
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

// Project List with Edit/Delete
function ProjectList() {
  const { profile, addProject, updateProject, deleteProject } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    technologies: '',
    images: [] as string[],
  });

  const resetForm = () => {
    setFormData({ title: '', description: '', url: '', technologies: '', images: [] });
  };

  const openEditModal = (project: any) => {
    const images = project.images ? JSON.parse(project.images) : [];
    setFormData({
      title: project.title || '',
      description: project.description || '',
      url: project.url || '',
      technologies: project.technologies || '',
      images: images,
    });
    setEditingProject(project);
  };

  const openAddModal = () => {
    resetForm();
    setShowAdd(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, e.target?.result as string],
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!formData.title) return toast.error('El título es requerido');
    
    const data = {
      ...formData,
      images: JSON.stringify(formData.images),
      order: editingProject ? editingProject.order : (profile?.projects?.length || 0),
    };

    try {
      if (editingProject) {
        await updateProject(editingProject.id, data);
        toast.success('Proyecto actualizado');
      } else {
        await addProject(data);
        toast.success('Proyecto agregado');
      }
      resetForm();
      setShowAdd(false);
      setEditingProject(null);
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      await deleteProject(id);
      toast.success('Proyecto eliminado');
    }
  };

  return (
    <div className="space-y-3">
      {profile?.projects?.map((p) => (
        <div key={p.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm group relative flex justify-between items-center">
          <div className="flex-1">
            <div className="font-medium">{p.title}</div>
            <div className="text-gray-500 text-xs">{p.technologies}</div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEditModal(p)}>
              <Edit2 size={14} className="text-blue-500" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleDelete(p.id)}>
              <Trash2 size={14} className="text-red-500" />
            </Button>
          </div>
        </div>
      ))}
      
      {/* Add/Edit Modal */}
      <Dialog open={showAdd || !!editingProject} onOpenChange={(open) => { if (!open) { setShowAdd(false); setEditingProject(null); resetForm(); }}}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-white" />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="bg-white" />
            </div>
            <div>
              <Label>URL</Label>
              <Input value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="bg-white" />
            </div>
            <div>
              <Label>Tecnologías (separadas por coma)</Label>
              <Input value={formData.technologies} onChange={(e) => setFormData({ ...formData, technologies: e.target.value })} className="bg-white" />
            </div>
            <div>
              <Label>Imágenes</Label>
              <Input type="file" accept="image/*" multiple onChange={handleImageUpload} className="bg-white" />
              <div className="flex gap-2 mt-2 flex-wrap">
                {formData.images.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt="" className="w-16 h-16 object-cover rounded" />
                    <button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditingProject(null); resetForm(); }}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!showAdd && !editingProject && (
        <Button onClick={openAddModal} size="sm" className="w-full gap-2">
          <Plus size={16} />
          Agregar Proyecto
        </Button>
      )}
    </div>
  );
}

// Certificate List with Edit/Delete
function CertificateList() {
  const { profile, addCertificate, updateCertificate, deleteCertificate } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [editingCert, setEditingCert] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    institution: '',
    issueDate: '',
    fileData: '',
    fileType: '',
  });

  const resetForm = () => {
    setFormData({ title: '', institution: '', issueDate: '', fileData: '', fileType: '' });
  };

  const openEditModal = (cert: any) => {
    setFormData({
      title: cert.title || '',
      institution: cert.institution || '',
      issueDate: cert.issueDate || '',
      fileData: cert.fileData || '',
      fileType: cert.fileType || '',
    });
    setEditingCert(cert);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileType = file.type.includes('pdf') ? 'pdf' : 'image';
        setFormData({
          ...formData,
          fileData: e.target?.result as string,
          fileType,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.title) return toast.error('El título es requerido');
    
    const data = {
      ...formData,
      order: editingCert ? editingCert.order : (profile?.certificates?.length || 0),
    };

    try {
      if (editingCert) {
        await updateCertificate(editingCert.id, data);
        toast.success('Certificado actualizado');
      } else {
        await addCertificate(data);
        toast.success('Certificado agregado');
      }
      resetForm();
      setShowAdd(false);
      setEditingCert(null);
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este certificado?')) {
      await deleteCertificate(id);
      toast.success('Certificado eliminado');
    }
  };

  return (
    <div className="space-y-3">
      {profile?.certificates?.map((c) => (
        <div key={c.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm group relative flex justify-between items-center">
          <div className="flex-1">
            <div className="font-medium">{c.title}</div>
            <div className="text-gray-500 text-xs">{c.institution}</div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEditModal(c)}>
              <Edit2 size={14} className="text-blue-500" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleDelete(c.id)}>
              <Trash2 size={14} className="text-red-500" />
            </Button>
          </div>
        </div>
      ))}
      
      {/* Add/Edit Modal */}
      <Dialog open={showAdd || !!editingCert} onOpenChange={(open) => { if (!open) { setShowAdd(false); setEditingCert(null); resetForm(); }}}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>{editingCert ? 'Editar Certificado' : 'Nuevo Certificado'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-white" />
            </div>
            <div>
              <Label>Institución</Label>
              <Input value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} className="bg-white" />
            </div>
            <div>
              <Label>Fecha</Label>
              <Input value={formData.issueDate} onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })} className="bg-white" />
            </div>
            <div>
              <Label>Archivo (PDF o Imagen)</Label>
              <Input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="bg-white" />
              {formData.fileData && (
                <div className="mt-2">
                  {formData.fileType === 'pdf' ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Award size={16} />
                      PDF cargado ✓
                    </div>
                  ) : (
                    <img src={formData.fileData} alt="Preview" className="w-20 h-20 object-cover rounded" />
                  )}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditingCert(null); resetForm(); }}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!showAdd && !editingCert && (
        <Button onClick={() => { resetForm(); setShowAdd(true); }} size="sm" className="w-full gap-2">
          <Plus size={16} />
          Agregar Certificado
        </Button>
      )}
    </div>
  );
}

// Experience List with Edit/Delete
function ExperienceList() {
  const { profile, addExperience, updateExperience, deleteExperience } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [editingExp, setEditingExp] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    type: 'work',
  });

  const resetForm = () => {
    setFormData({ title: '', company: '', location: '', startDate: '', endDate: '', description: '', type: 'work' });
  };

  const openEditModal = (exp: any) => {
    setFormData({
      title: exp.title || '',
      company: exp.company || '',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      description: exp.description || '',
      type: exp.type || 'work',
    });
    setEditingExp(exp);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.company) return toast.error('Título y empresa son requeridos');
    
    const data = {
      ...formData,
      order: editingExp ? editingExp.order : (profile?.experiences?.length || 0),
    };

    try {
      if (editingExp) {
        await updateExperience(editingExp.id, data);
        toast.success('Experiencia actualizada');
      } else {
        await addExperience(data);
        toast.success('Experiencia agregada');
      }
      resetForm();
      setShowAdd(false);
      setEditingExp(null);
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta experiencia?')) {
      await deleteExperience(id);
      toast.success('Experiencia eliminada');
    }
  };

  return (
    <div className="space-y-3">
      {profile?.experiences?.map((e) => (
        <div key={e.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm group relative">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="font-medium">{e.title}</div>
              <div className="text-gray-500 text-xs">{e.company}</div>
              <div className={`text-xs ${e.type === 'work' ? 'text-blue-500' : 'text-green-500'}`}>
                {e.type === 'work' ? '💼 Trabajo' : '🎓 Educación'}
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEditModal(e)}>
                <Edit2 size={14} className="text-blue-500" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleDelete(e.id)}>
                <Trash2 size={14} className="text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      ))}
      
      {/* Add/Edit Modal */}
      <Dialog open={showAdd || !!editingExp} onOpenChange={(open) => { if (!open) { setShowAdd(false); setEditingExp(null); resetForm(); }}}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>{editingExp ? 'Editar Experiencia' : 'Nueva Experiencia'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Título / Puesto *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-white" />
            </div>
            <div>
              <Label>Empresa / Institución *</Label>
              <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="bg-white" />
            </div>
            <div>
              <Label>Ubicación</Label>
              <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="bg-white" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Inicio</Label>
                <Input value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} placeholder="2020-01" className="bg-white" />
              </div>
              <div className="flex-1">
                <Label>Fin (vacío = actual)</Label>
                <Input value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="bg-white" />
              </div>
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="bg-white" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant={formData.type === 'work' ? 'default' : 'outline'} onClick={() => setFormData({ ...formData, type: 'work' })} className="flex-1">
                Trabajo
              </Button>
              <Button size="sm" variant={formData.type === 'education' ? 'default' : 'outline'} onClick={() => setFormData({ ...formData, type: 'education' })} className="flex-1">
                Educación
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditingExp(null); resetForm(); }}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!showAdd && !editingExp && (
        <Button onClick={() => { resetForm(); setShowAdd(true); }} size="sm" className="w-full gap-2">
          <Plus size={16} />
          Agregar Experiencia
        </Button>
      )}
    </div>
  );
}

// Skill List with Edit/Delete
function SkillList() {
  const { profile, addSkill, updateSkill, deleteSkill } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    level: 80,
    category: 'General',
  });

  const resetForm = () => {
    setFormData({ name: '', level: 80, category: 'General' });
  };

  const openEditModal = (skill: any) => {
    setFormData({
      name: skill.name || '',
      level: skill.level || 80,
      category: skill.category || 'General',
    });
    setEditingSkill(skill);
  };

  const handleSave = async () => {
    if (!formData.name) return toast.error('El nombre es requerido');
    
    const data = {
      ...formData,
      order: editingSkill ? editingSkill.order : (profile?.skills?.length || 0),
    };

    try {
      if (editingSkill) {
        await updateSkill(editingSkill.id, data);
        toast.success('Habilidad actualizada');
      } else {
        await addSkill(data);
        toast.success('Habilidad agregada');
      }
      resetForm();
      setShowAdd(false);
      setEditingSkill(null);
    } catch (error) {
      toast.error('Error al guardar');
    }
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
      {profile?.skills?.map((s) => (
        <div key={s.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm flex justify-between items-center group">
          <div className="flex-1">
            <span className="font-medium">{s.name}</span>
            <span className="text-xs text-gray-500 ml-2">{s.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">{s.level}%</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEditModal(s)}>
                <Edit2 size={14} className="text-blue-500" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleDelete(s.id)}>
                <Trash2 size={14} className="text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      ))}
      
      {/* Add/Edit Modal */}
      <Dialog open={showAdd || !!editingSkill} onOpenChange={(open) => { if (!open) { setShowAdd(false); setEditingSkill(null); resetForm(); }}}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>{editingSkill ? 'Editar Habilidad' : 'Nueva Habilidad'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-white" />
            </div>
            <div>
              <Label>Nivel: {formData.level}%</Label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <Label>Categoría</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border rounded text-sm bg-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditingSkill(null); resetForm(); }}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!showAdd && !editingSkill && (
        <Button onClick={() => { resetForm(); setShowAdd(true); }} size="sm" className="w-full gap-2">
          <Plus size={16} />
          Agregar Habilidad
        </Button>
      )}
    </div>
  );
}
