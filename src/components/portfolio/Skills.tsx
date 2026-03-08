'use client';

import { motion } from 'framer-motion';
import { useData } from '@/lib/contexts/data-context';
import { useAuth } from '@/lib/contexts/auth-context';
import { Progress } from '@/components/ui/progress';
import { Code, Database, Server, Wrench, Palette, Cloud, Plus, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const categoryIcons: { [key: string]: typeof Code } = {
  Frontend: Palette,
  Backend: Server,
  'Full Stack': Code,
  DevOps: Cloud,
  Database: Database,
  Herramientas: Wrench,
  General: Code,
};

export default function Skills() {
  const { profile, addSkill, updateSkill, deleteSkill } = useData();
  const { isAuthenticated } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', level: 80, category: 'General' });

  if (!profile) return null;
  if (!isAuthenticated && profile.skills.length === 0) return null;

  const skillsByCategory = profile.skills.reduce((acc, skill) => {
    const category = skill.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as { [key: string]: typeof profile.skills });

  const categories = ['Frontend', 'Backend', 'Full Stack', 'DevOps', 'Database', 'Herramientas', 'General'];

  const handleAdd = async () => {
    if (!formData.name) {
      toast.error('El nombre es requerido');
      return;
    }
    await addSkill(formData);
    setFormData({ name: '', level: 80, category: 'General' });
    setShowAddForm(false);
    toast.success('Habilidad agregada');
  };

  const handleUpdate = async () => {
    if (!editingSkill || !formData.name) return;
    await updateSkill(editingSkill.id, formData);
    setEditingSkill(null);
    setFormData({ name: '', level: 80, category: 'General' });
    toast.success('Habilidad actualizada');
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta habilidad?')) {
      await deleteSkill(id);
      toast.success('Habilidad eliminada');
    }
  };

  const openEdit = (skill: any) => {
    setEditingSkill(skill);
    setFormData({ name: skill.name, level: skill.level, category: skill.category || 'General' });
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
          Habilidades
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(skillsByCategory).map(([category, skills], categoryIndex) => {
            const Icon = categoryIcons[category] || Code;
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: profile.primaryColor }}>
                  <Icon size={20} />
                  {category}
                </h3>
                <div className="space-y-4">
                  {skills.map((skill) => (
                    <div key={skill.id} className="group relative">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm" style={{ color: profile.primaryColor }}>{skill.level}%</span>
                          {isAuthenticated && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEdit(skill)} className="p-1">
                                <Edit2 size={12} className="text-blue-500" />
                              </button>
                              <button onClick={() => handleDelete(skill.id)} className="p-1">
                                <Trash2 size={12} className="text-red-500" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <Progress value={skill.level} className="h-2" style={{ backgroundColor: `${profile.primaryColor}20` }} />
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Formulario de agregar/editar en modo editor */}
        {isAuthenticated && (
          <div className="mt-8">
            {showAddForm || editingSkill ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-2 border-dashed"
                style={{ borderColor: profile.primaryColor }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: profile.primaryColor }}>
                  {editingSkill ? 'Editar Habilidad' : 'Nueva Habilidad'}
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      placeholder="JavaScript, React..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nivel: {formData.level}%</label>
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
                    <label className="block text-sm font-medium mb-1">Categoría</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={editingSkill ? handleUpdate : handleAdd} style={{ backgroundColor: profile.primaryColor }}>
                    {editingSkill ? 'Actualizar' : 'Agregar'}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingSkill(null); setFormData({ name: '', level: 80, category: 'General' }); }}>
                    Cancelar
                  </Button>
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
                Agregar Habilidad
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
