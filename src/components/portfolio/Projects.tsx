'use client';

import { motion } from 'framer-motion';
import { useData } from '@/lib/contexts/data-context';
import { useAuth } from '@/lib/contexts/auth-context';
import { ExternalLink, ChevronLeft, ChevronRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Projects() {
  const { profile, addProject, deleteProject } = useData();
  const { isAuthenticated } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    technologies: '',
    images: [] as string[],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // En modo editor, siempre mostrar la sección
  if (!profile) return null;
  if (!isAuthenticated && profile.projects.length === 0) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ev.target?.result as string],
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

  const handleAdd = async () => {
    if (!formData.title) {
      toast.error('El título es requerido');
      return;
    }
    await addProject({
      ...formData,
      images: JSON.stringify(formData.images),
    });
    setFormData({ title: '', description: '', url: '', technologies: '', images: [] });
    setShowAddForm(false);
    toast.success('Proyecto agregado');
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      await deleteProject(id);
      toast.success('Proyecto eliminado');
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
          style={{ color: profile?.primaryColor }}
        >
          Proyectos
        </motion.h2>

        {/* Grid de proyectos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profile.projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group relative"
            >
              {/* Botones de edición */}
              {isAuthenticated && (
                <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white shadow-md"
                    onClick={() => toast.info('Usa el panel de editor para modificar')}
                  >
                    <Edit2 size={14} className="text-blue-500" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white shadow-md"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              )}
              <ProjectCard project={project} primaryColor={profile.primaryColor} />
            </motion.div>
          ))}
        </div>

        {/* Sección vacía o formulario de agregar en modo editor */}
        {isAuthenticated && (
          <div className="mt-6">
            {showAddForm ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-2 border-dashed"
                style={{ borderColor: profile.primaryColor }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: profile.primaryColor }}>
                  Nuevo Proyecto
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Título *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      placeholder="Nombre del proyecto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Descripción</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      placeholder="Describe tu proyecto..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL</label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tecnologías (separadas por coma)</label>
                    <input
                      type="text"
                      value={formData.technologies}
                      onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      placeholder="React, Node.js, PostgreSQL..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Imágenes</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Plus size={16} className="mr-2" />
                      Agregar Imágenes
                    </Button>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {formData.images.map((img, i) => (
                        <div key={i} className="relative">
                          <img src={img} alt="" className="w-16 h-16 object-cover rounded" />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAdd} style={{ backgroundColor: profile.primaryColor }}>
                      Guardar Proyecto
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setShowAddForm(false);
                      setFormData({ title: '', description: '', url: '', technologies: '', images: [] });
                    }}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <Button
                onClick={() => setShowAddForm(true)}
                className="w-full py-8 border-2 border-dashed bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
                variant="outline"
                style={{ borderColor: profile.primaryColor, color: profile.primaryColor }}
              >
                <Plus size={20} className="mr-2" />
                Agregar Proyecto
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({ project, primaryColor }: { project: any; primaryColor: string }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = project.images ? JSON.parse(project.images) : [];

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <>
      <div 
        className="relative h-48 overflow-hidden cursor-pointer"
        onClick={() => images.length > 0 && setLightboxOpen(true)}
      >
        {images.length > 0 ? (
          <img
            src={images[0]}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <span style={{ color: primaryColor }} className="text-lg font-semibold">
              {project.title}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg">{project.title}</h3>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-500 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={18} />
            </a>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {project.description}
        </p>
        {project.technologies && (
          <div className="flex flex-wrap gap-1">
            {project.technologies.split(',').map((tech: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 text-xs rounded-full"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                {tech.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black/90 border-none">
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            {images.length > 0 && (
              <img src={images[currentImageIndex]} alt={project.title} className="max-w-full max-h-full object-contain" />
            )}
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20">
                  <ChevronLeft className="text-white" size={24} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20">
                  <ChevronRight className="text-white" size={24} />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
