'use client';

import { motion } from 'framer-motion';
import { useData } from '@/lib/contexts/data-context';
import { useAuth } from '@/lib/contexts/auth-context';
import { Award, FileText, Plus, Trash2, Download, Eye } from 'lucide-react';
import { useState, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Certificates() {
  const { profile, addCertificate, deleteCertificate } = useData();
  const { isAuthenticated } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    institution: '',
    issueDate: '',
    fileData: '',
    fileType: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!profile) return null;
  if (!isAuthenticated && profile.certificates.length === 0) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const fileType = file.type.includes('pdf') ? 'pdf' : 'image';
        setFormData({ ...formData, fileData: ev.target?.result as string, fileType });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!formData.title) {
      toast.error('El título es requerido');
      return;
    }
    await addCertificate(formData);
    setFormData({ title: '', institution: '', issueDate: '', fileData: '', fileType: '' });
    setShowAddForm(false);
    toast.success('Certificado agregado');
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este certificado?')) {
      await deleteCertificate(id);
      toast.success('Certificado eliminado');
    }
  };

  const handleDownload = (cert: any) => {
    if (cert.fileData) {
      const link = document.createElement('a');
      link.href = cert.fileData;
      link.download = `${cert.title}.${cert.fileType === 'pdf' ? 'pdf' : 'png'}`;
      link.click();
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
          Certificados
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profile.certificates.map((cert, index) => {
            const isPDF = cert.fileType === 'pdf';
            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group relative"
              >
                {isAuthenticated && (
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-white shadow-md" onClick={() => handleDelete(cert.id)}>
                      <Trash2 size={14} className="text-red-500" />
                    </Button>
                  </div>
                )}
                <CertificateCard cert={cert} primaryColor={profile.primaryColor} onDownload={() => handleDownload(cert)} />
              </motion.div>
            );
          })}
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
                <h3 className="text-lg font-semibold mb-4" style={{ color: profile.primaryColor }}>Nuevo Certificado</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Título *</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border rounded-md" placeholder="AWS Certified Developer" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Institución</label>
                    <input type="text" value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} className="w-full p-2 border rounded-md" placeholder="Amazon Web Services" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha</label>
                    <input type="text" value={formData.issueDate} onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })} className="w-full p-2 border rounded-md" placeholder="2023-06" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Archivo (PDF o Imagen)</label>
                    <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                      <Plus size={16} className="mr-2" />
                      Subir Archivo
                    </Button>
                    {formData.fileData && (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        {formData.fileType === 'pdf' ? <FileText size={20} className="text-red-500" /> : <img src={formData.fileData} alt="" className="w-12 h-12 object-cover rounded" />}
                        <span className="text-sm text-green-600">Archivo listo ✓</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAdd} style={{ backgroundColor: profile.primaryColor }}>Agregar</Button>
                    <Button variant="outline" onClick={() => { setShowAddForm(false); setFormData({ title: '', institution: '', issueDate: '', fileData: '', fileType: '' }); }}>Cancelar</Button>
                  </div>
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
                Agregar Certificado
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function CertificateCard({ cert, primaryColor, onDownload }: { cert: any; primaryColor: string; onDownload: () => void }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isPDF = cert.fileType === 'pdf';

  return (
    <>
      <div className="h-40 overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700 cursor-pointer" onClick={() => cert.fileData && setLightboxOpen(true)}>
        {cert.fileData ? (
          isPDF ? (
            <div className="flex flex-col items-center gap-2">
              <FileText size={48} style={{ color: primaryColor }} />
              <span className="text-sm text-gray-500">PDF - Click para ver</span>
            </div>
          ) : (
            <img src={cert.fileData} alt={cert.title} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Award size={48} style={{ color: primaryColor }} />
            <span className="text-sm text-gray-500">Sin archivo</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{cert.title}</h3>
        {cert.institution && <p className="text-gray-600 dark:text-gray-400 text-sm">{cert.institution}</p>}
        {cert.issueDate && <p className="text-gray-500 text-sm mt-1">{cert.issueDate}</p>}
        {cert.fileData && (
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}>
              <Eye size={14} className="mr-1" /> Ver
            </Button>
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onDownload(); }}>
              <Download size={14} className="mr-1" /> Descargar
            </Button>
          </div>
        )}
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-white border-gray-200">
          <div className="relative w-full h-[80vh] flex items-center justify-center bg-gray-100">
            {cert.fileData && (isPDF ? <iframe src={cert.fileData} className="w-full h-full" title={cert.title} /> : <img src={cert.fileData} alt={cert.title} className="max-w-full max-h-full object-contain" />)}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
