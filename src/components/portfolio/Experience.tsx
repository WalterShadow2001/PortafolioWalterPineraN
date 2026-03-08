'use client';

import { motion } from 'framer-motion';
import { useData } from '@/lib/contexts/data-context';
import { useAuth } from '@/lib/contexts/auth-context';
import { Briefcase, GraduationCap, MapPin, Calendar, Plus, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Experience() {
  const { profile, addExperience, deleteExperience } = useData();
  const { isAuthenticated } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    type: 'work',
  });

  if (!profile) return null;
  if (!isAuthenticated && profile.experiences.length === 0) return null;

  const workExperiences = profile.experiences.filter(e => e.type === 'work');
  const educationExperiences = profile.experiences.filter(e => e.type === 'education');

  const handleAdd = async () => {
    if (!formData.title || !formData.company) {
      toast.error('Título y empresa/institución son requeridos');
      return;
    }
    await addExperience(formData);
    setFormData({ title: '', company: '', location: '', startDate: '', endDate: '', description: '', type: 'work' });
    setShowAddForm(false);
    toast.success('Experiencia agregada');
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta experiencia?')) {
      await deleteExperience(id);
      toast.success('Experiencia eliminada');
    }
  };

  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
          style={{ color: profile.primaryColor }}
        >
          Experiencia y Educación
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Work Experience */}
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: profile.primaryColor }}>
              <Briefcase size={24} />
              Experiencia Laboral
            </h3>
            <div className="relative pl-8 border-l-2" style={{ borderColor: profile.primaryColor }}>
              {workExperiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative mb-8 last:mb-0 group"
                >
                  <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full" style={{ backgroundColor: profile.primaryColor }} />
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    {isAuthenticated && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDelete(exp.id)}>
                          <Trash2 size={14} className="text-red-500" />
                        </Button>
                      </div>
                    )}
                    <h4 className="font-semibold text-lg pr-8">{exp.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{exp.company}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                      {exp.location && <span className="flex items-center gap-1"><MapPin size={14} />{exp.location}</span>}
                      <span className="flex items-center gap-1"><Calendar size={14} />{exp.startDate} - {exp.endDate || 'Presente'}</span>
                    </div>
                    {exp.description && <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">{exp.description}</p>}
                  </div>
                </motion.div>
              ))}
              {isAuthenticated && workExperiences.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No hay experiencias laborales
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: profile.secondaryColor }}>
              <GraduationCap size={24} />
              Educación
            </h3>
            <div className="relative pl-8 border-l-2" style={{ borderColor: profile.secondaryColor }}>
              {educationExperiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative mb-8 last:mb-0 group"
                >
                  <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full" style={{ backgroundColor: profile.secondaryColor }} />
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    {isAuthenticated && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDelete(exp.id)}>
                          <Trash2 size={14} className="text-red-500" />
                        </Button>
                      </div>
                    )}
                    <h4 className="font-semibold text-lg pr-8">{exp.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{exp.company}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                      {exp.location && <span className="flex items-center gap-1"><MapPin size={14} />{exp.location}</span>}
                      <span className="flex items-center gap-1"><Calendar size={14} />{exp.startDate} - {exp.endDate || 'Presente'}</span>
                    </div>
                    {exp.description && <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">{exp.description}</p>}
                  </div>
                </motion.div>
              ))}
              {isAuthenticated && educationExperiences.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No hay educación registrada
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formulario para agregar */}
        {isAuthenticated && (
          <div className="mt-8">
            {showAddForm ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-2 border-dashed"
                style={{ borderColor: profile.primaryColor }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: profile.primaryColor }}>Nueva Experiencia</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Título / Puesto *</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border rounded-md" placeholder="Desarrollador Full Stack" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Empresa / Institución *</label>
                    <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full p-2 border rounded-md" placeholder="Nombre de la empresa" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ubicación</label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full p-2 border rounded-md" placeholder="Ciudad, País" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Inicio *</label>
                      <input type="text" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full p-2 border rounded-md" placeholder="2020-01" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Fin</label>
                      <input type="text" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full p-2 border rounded-md" placeholder="2023-12 o vacío" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Descripción</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded-md" rows={2} placeholder="Describe tus responsabilidades..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Tipo</label>
                    <div className="flex gap-2">
                      <Button variant={formData.type === 'work' ? 'default' : 'outline'} onClick={() => setFormData({ ...formData, type: 'work' })} style={formData.type === 'work' ? { backgroundColor: profile.primaryColor } : {}}>
                        💼 Trabajo
                      </Button>
                      <Button variant={formData.type === 'education' ? 'default' : 'outline'} onClick={() => setFormData({ ...formData, type: 'education' })} style={formData.type === 'education' ? { backgroundColor: profile.secondaryColor } : {}}>
                        🎓 Educación
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleAdd} style={{ backgroundColor: profile.primaryColor }}>Agregar</Button>
                  <Button variant="outline" onClick={() => { setShowAddForm(false); setFormData({ title: '', company: '', location: '', startDate: '', endDate: '', description: '', type: 'work' }); }}>Cancelar</Button>
                </div>
              </motion.div>
            ) : (
              <Button
                onClick={() => setShowAddForm(true)}
                className="w-full py-8 border-2 border-dashed bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                variant="outline"
                style={{ borderColor: profile.primaryColor, color: profile.primaryColor }}
              >
                <Plus size={20} className="mr-2" />
                Agregar Experiencia / Educación
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
