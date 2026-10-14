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
  Lock, LogOut, Plus, Trash2, Palette, 
  Folder, Award, Briefcase, Code, Save, User,
  ChevronDown, ChevronUp, X, RotateCcw, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

// Temas predefinidos
const colorThemes = [
  { name: 'Azul Profesional', primary: '#3b82f6', secondary: '#1e40af', accent: '#f59e0b', background: '#ffffff', text: '#1f2937' },
  { name: 'Verde Naturaleza', primary: '#10b981', secondary: '#059669', accent: '#8b5cf6', background: '#f0fdf4', text: '#1f2937' },
  { name: 'Púrpura Moderno', primary: '#8b5cf6', secondary: '#6d28d9', accent: '#f59e0b', background: '#faf5ff', text: '#1f2937' },
  { name: 'Rojo Energético', primary: '#ef4444', secondary: '#b91c1c', accent: '#fbbf24', background: '#fff5f5', text: '#1f2937' },
  { name: 'Naranja Creativo', primary: '#f97316', secondary: '#ea580c', accent: '#3b82f6', background: '#fff7ed', text: '#1f2937' },
  { name: 'Oscuro Elegante', primary: '#6366f1', secondary: '#4f46e5', accent: '#fbbf24', background: '#0f172a', text: '#e2e8f0' },
  { name: 'Rosa Moderno', primary: '#ec4899', secondary: '#db2777', accent: '#14b8a6', background: '#fdf2f8', text: '#1f2937' },
  { name: 'Cyan Tecnológico', primary: '#06b6d4', secondary: '#0891b2', accent: '#f43f5e', background: '#ecfeff', text: '#0f172a' },
];

// Paletas de colores
const colorPalettes = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#1f2937', '#374151', '#ffffff'
];

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
        <Button variant="ghost" size="sm" className="fixed top-4 right-4 z-50 opacity-20 hover:opacity-100 transition-opacity">
          <Lock size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader><DialogTitle>Modo Editor</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="Ingresa la contraseña" />
        </div>
        <DialogFooter><Button onClick={handleLogin}>Entrar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditorPanel() {
  const { profile } = useData();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isMinimized, setIsMinimized] = useState(false);

  if (!profile) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-40 overflow-hidden transition-all ${isMinimized ? 'h-12' : ''}`}>
      <div className="flex items-center justify-between px-2 py-1 bg-gray-100 dark:bg-gray-700">
        <span className="text-sm font-medium px-2">🎨 Panel de Editor</span>
        <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)}>
          {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </div>
      
      {!isMinimized && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 h-auto">
            <TabsTrigger value="profile" className="p-2 text-xs gap-1"><User size={14} /> Perfil</TabsTrigger>
            <TabsTrigger value="colors" className="p-2 text-xs gap-1"><Palette size={14} /> Estilos</TabsTrigger>
            <TabsTrigger value="content" className="p-2 text-xs gap-1"><Folder size={14} /> Contenido</TabsTrigger>
          </TabsList>

          <div className="max-h-[60vh] overflow-y-auto">
            <TabsContent value="profile" className="p-4"><ProfileEditor /></TabsContent>
            <TabsContent value="colors" className="p-4"><ColorEditorEnhanced /></TabsContent>
            <TabsContent value="content" className="p-4"><ContentTabs /></TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
}

function ProfileEditor() {
  const { profile, updateProfile } = useData();
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    title: profile?.title || '',
    bio: profile?.bio || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    website: profile?.website || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(formData);
      toast.success('Perfil actualizado');
    } catch {
      toast.error('Error al guardar');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-3">
      <div><Label className="text-xs">Nombre</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Tu nombre" /></div>
      <div><Label className="text-xs">Título Profesional</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Tu título" /></div>
      <div><Label className="text-xs">Biografía</Label><Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Descripción breve" rows={3} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label className="text-xs">Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="tu@email.com" /></div>
        <div><Label className="text-xs">Teléfono</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 234 567 890" /></div>
      </div>
      <div><Label className="text-xs">Ubicación</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Ciudad, País" /></div>
      <div><Label className="text-xs">Sitio Web</Label><Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://tusitio.com" /></div>
      <Button onClick={handleSave} className="w-full gap-2" disabled={saving}><Save size={16} />{saving ? 'Guardando...' : 'Guardar Perfil'}</Button>
    </div>
  );
}

function ColorEditorEnhanced() {
  const { profile, updateProfile } = useData();
  const [colors, setColors] = useState({
    primaryColor: profile?.primaryColor || '#3b82f6',
    secondaryColor: profile?.secondaryColor || '#1e40af',
    accentColor: profile?.accentColor || '#f59e0b',
    backgroundColor: profile?.backgroundColor || '#ffffff',
    textColor: profile?.textColor || '#1f2937',
  });

  const handleSave = async () => {
    await updateProfile(colors);
    toast.success('Colores actualizados');
  };

  const applyTheme = (theme: typeof colorThemes[0]) => {
    setColors({
      primaryColor: theme.primary,
      secondaryColor: theme.secondary,
      accentColor: theme.accent,
      backgroundColor: theme.background,
      textColor: theme.text,
    });
  };

  const colorLabels: { [key: string]: { label: string; description: string } } = {
    primaryColor: { label: 'Primario', description: 'Títulos y botones' },
    secondaryColor: { label: 'Secundario', description: 'Elementos secundarios' },
    accentColor: { label: 'Acento', description: 'Detalles destacados' },
    backgroundColor: { label: 'Fondo', description: 'Fondo de la página' },
    textColor: { label: 'Texto', description: 'Texto principal' },
  };

  return (
    <div className="space-y-4">
      {/* Temas rápidos */}
      <div>
        <Label className="text-xs font-semibold mb-2 block">🎯 Temas Rápidos</Label>
        <div className="grid grid-cols-4 gap-1">
          {colorThemes.map((theme, i) => (
            <button key={i} onClick={() => applyTheme(theme)} className="group p-2 rounded-lg border border-gray-200 hover:border-gray-400 transition-all" title={theme.name}>
              <div className="flex gap-0.5 h-3">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: theme.primary }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: theme.secondary }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: theme.accent }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 my-3" />

      {/* Colores personalizados */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold">🎨 Colores Personalizados</Label>
        {Object.entries(colors).map(([key, value]) => (
          <div key={key} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{colorLabels[key]?.label || key}</span>
              <div className="flex items-center gap-2">
                <input type="color" value={value} onChange={(e) => setColors({ ...colors, [key]: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-2 border-white shadow" />
                <input type="text" value={value} onChange={(e) => setColors({ ...colors, [key]: e.target.value })} className="w-20 text-xs p-1 border rounded font-mono" />
              </div>
            </div>
            <p className="text-xs text-gray-500">{colorLabels[key]?.description}</p>
            <div className="flex gap-1 mt-2 flex-wrap">
              {colorPalettes.slice(0, 10).map((color, i) => (
                <button key={i} onClick={() => setColors({ ...colors, [key]: color })} className="w-5 h-5 rounded-sm border border-gray-300 hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Vista previa */}
      <div className="p-4 rounded-lg border-2 border-dashed" style={{ backgroundColor: colors.backgroundColor, borderColor: colors.primaryColor }}>
        <h4 style={{ color: colors.primaryColor }} className="font-bold">Vista Previa</h4>
        <p style={{ color: colors.textColor }} className="text-sm mt-1">Este es un ejemplo de cómo se verá.</p>
        <div className="flex gap-2 mt-2">
          <span className="px-2 py-1 text-xs rounded-full text-white" style={{ backgroundColor: colors.primaryColor }}>Primario</span>
          <span className="px-2 py-1 text-xs rounded-full text-white" style={{ backgroundColor: colors.secondaryColor }}>Secundario</span>
          <span className="px-2 py-1 text-xs rounded-full text-white" style={{ backgroundColor: colors.accentColor }}>Acento</span>
        </div>
      </div>

      <Button onClick={handleSave} className="w-full gap-2" style={{ backgroundColor: colors.primaryColor }}><Save size={16} />Guardar Colores</Button>
    </div>
  );
}

function ContentTabs() {
  const { profile } = useData();
  const [subTab, setSubTab] = useState('projects');
  if (!profile) return null;

  return (
    <Tabs value={subTab} onValueChange={setSubTab}>
      <TabsList className="w-full grid grid-cols-4 h-auto mb-2">
        <TabsTrigger value="projects" className="p-1.5 text-xs"><Folder size={12} /></TabsTrigger>
        <TabsTrigger value="certificates" className="p-1.5 text-xs"><Award size={12} /></TabsTrigger>
        <TabsTrigger value="experience" className="p-1.5 text-xs"><Briefcase size={12} /></TabsTrigger>
        <TabsTrigger value="skills" className="p-1.5 text-xs"><Code size={12} /></TabsTrigger>
      </TabsList>

      <TabsContent value="projects">
        <div className="text-xs font-medium mb-2 px-1">Proyectos ({profile.projects.length}) - Edita directamente en la página</div>
        <div className="space-y-2 max-h-[30vh] overflow-y-auto">
          {profile.projects.map((p) => (<div key={p.id} className="p-2 bg-gray-100 rounded text-sm"><div className="font-medium">{p.title}</div><div className="text-gray-500 text-xs">{p.technologies}</div></div>))}
        </div>
      </TabsContent>
      <TabsContent value="certificates">
        <div className="text-xs font-medium mb-2 px-1">Certificados ({profile.certificates.length}) - Edita directamente en la página</div>
        <div className="space-y-2 max-h-[30vh] overflow-y-auto">
          {profile.certificates.map((c) => (<div key={c.id} className="p-2 bg-gray-100 rounded text-sm"><div className="font-medium">{c.title}</div><div className="text-gray-500 text-xs">{c.institution}</div></div>))}
        </div>
      </TabsContent>
      <TabsContent value="experience">
        <div className="text-xs font-medium mb-2 px-1">Experiencia ({profile.experiences.length}) - Edita directamente en la página</div>
        <div className="space-y-2 max-h-[30vh] overflow-y-auto">
          {profile.experiences.map((e) => (<div key={e.id} className="p-2 bg-gray-100 rounded text-sm"><div className="font-medium">{e.title}</div><div className="text-gray-500 text-xs">{e.company}</div></div>))}
        </div>
      </TabsContent>
      <TabsContent value="skills">
        <div className="text-xs font-medium mb-2 px-1">Habilidades ({profile.skills.length}) - Edita directamente en la página</div>
        <div className="space-y-2 max-h-[30vh] overflow-y-auto">
          {profile.skills.map((s) => (<div key={s.id} className="p-2 bg-gray-100 rounded text-sm flex justify-between"><span className="font-medium">{s.name}</span><span className="text-gray-500 text-xs">{s.level}%</span></div>))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
