'use client';

import { useState, useRef } from 'react';
import { useData, Project } from '@/lib/data-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus, Save, X, Trash2 } from 'lucide-react';

interface ProjectEditorProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
}

export function ProjectEditor({ open, onClose, project }: ProjectEditorProps) {
  const { addProject, updateProject } = useData();
  const [formData, setFormData] = useState<Partial<Project>>({
    title: project?.title || '',
    description: project?.description || '',
    url: project?.url || '',
    technologies: project?.technologies || '',
    date: project?.date || '',
    images: project?.images ? JSON.parse(project.images) : [],
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!project;

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = {
        ...formData,
        id: project?.id,
        images: formData.images,
      };

      if (isEditing) {
        await updateProject(data);
      } else {
        await addProject(data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            images: [...(prev.images || []), reader.result as string],
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_: string, i: number) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Images */}
          <div className="space-y-4">
            <Label>Imágenes del Proyecto</Label>
            <div className="grid grid-cols-3 gap-4">
              {formData.images?.map((img: string, index: number) => (
                <div key={index} className="relative aspect-video group">
                  <img
                    src={img}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                <ImagePlus className="w-8 h-8 mb-2" />
                <span className="text-sm">Añadir imagen</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nombre del proyecto"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Describe tu proyecto..."
            />
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url">URL del Proyecto</Label>
            <Input
              id="url"
              value={formData.url || ''}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          {/* Technologies */}
          <div className="space-y-2">
            <Label htmlFor="technologies">Tecnologías (separadas por coma)</Label>
            <Input
              id="technologies"
              value={formData.technologies || ''}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
              placeholder="React, Node.js, PostgreSQL..."
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              value={formData.date || ''}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              placeholder="2024"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
