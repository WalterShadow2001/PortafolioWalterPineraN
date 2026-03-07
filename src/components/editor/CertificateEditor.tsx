'use client';

import { useState, useRef } from 'react';
import { useData, Certificate } from '@/lib/data-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUp, Save, X, Trash2, FileText, Image } from 'lucide-react';

interface CertificateEditorProps {
  open: boolean;
  onClose: () => void;
  certificate: Certificate | null;
}

export function CertificateEditor({ open, onClose, certificate }: CertificateEditorProps) {
  const { addCertificate, updateCertificate } = useData();
  const [formData, setFormData] = useState<Partial<Certificate>>({
    title: certificate?.title || '',
    institution: certificate?.institution || '',
    date: certificate?.date || '',
    type: certificate?.type || '',
    file: certificate?.file || '',
    fileType: certificate?.fileType || '',
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!certificate;

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = {
        ...formData,
        id: certificate?.id,
      };

      if (isEditing) {
        await updateCertificate(data);
      } else {
        await addCertificate(data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileType = file.type.includes('pdf') ? 'pdf' : 'image';
        setFormData({
          ...formData,
          file: reader.result as string,
          fileType,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setFormData({ ...formData, file: '', fileType: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Certificado' : 'Nuevo Certificado'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Upload */}
          <div className="space-y-4">
            <Label>Archivo del Certificado</Label>
            {formData.file ? (
              <div className="relative group">
                {formData.fileType === 'image' ? (
                  <img
                    src={formData.file}
                    alt="Certificate preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={removeFile}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                <FileUp className="w-10 h-10 mb-2" />
                <span className="text-sm">Subir PDF o imagen</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, PDF</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nombre del certificado"
            />
          </div>

          {/* Institution */}
          <div className="space-y-2">
            <Label htmlFor="institution">Institución</Label>
            <Input
              id="institution"
              value={formData.institution || ''}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              placeholder="Institución que lo emitió"
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

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type || ''}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Certificación Profesional">Certificación Profesional</SelectItem>
                <SelectItem value="Curso Online">Curso Online</SelectItem>
                <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                <SelectItem value="Workshop">Workshop</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
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
