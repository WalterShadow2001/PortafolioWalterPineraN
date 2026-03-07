'use client';

import { motion } from 'framer-motion';
import { useData } from '@/lib/contexts/data-context';
import { useAuth } from '@/lib/contexts/auth-context';
import { Award, ExternalLink, FileText, Image, Edit2, Trash2, Download, Eye } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Certificates() {
  const { profile } = useData();

  if (!profile || profile.certificates.length === 0) return null;

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
          {profile.certificates.map((cert, index) => (
            <CertificateCard key={cert.id} cert={cert} index={index} primaryColor={profile.primaryColor} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CertificateCard({ cert, index, primaryColor }: { cert: any; index: number; primaryColor: string }) {
  const { isAuthenticated } = useAuth();
  const { deleteCertificate } = useData();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const isPDF = cert.fileType === 'pdf';

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de eliminar este certificado?')) {
      await deleteCertificate(cert.id);
      toast.success('Certificado eliminado');
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info('Usa el panel de editor para modificar este certificado');
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cert.fileData) {
      const link = document.createElement('a');
      link.href = cert.fileData;
      link.download = `${cert.title}.${isPDF ? 'pdf' : 'png'}`;
      link.click();
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group relative cursor-pointer"
        onClick={() => cert.fileData && setLightboxOpen(true)}
      >
        {/* Editor buttons - only show when authenticated */}
        {isAuthenticated && (
          <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0 bg-white shadow-md"
              onClick={handleEdit}
            >
              <Edit2 size={14} className="text-blue-500" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0 bg-white shadow-md"
              onClick={handleDelete}
            >
              <Trash2 size={14} className="text-red-500" />
            </Button>
          </div>
        )}

        {/* Preview */}
        <div className="h-40 overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700">
          {cert.fileData ? (
            isPDF ? (
              <div className="flex flex-col items-center gap-2">
                <FileText size={48} style={{ color: primaryColor }} />
                <span className="text-sm text-gray-500">PDF</span>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}>
                    <Eye size={14} className="mr-1" /> Ver
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    <Download size={14} className="mr-1" /> Descargar
                  </Button>
                </div>
              </div>
            ) : (
              <img
                src={cert.fileData}
                alt={cert.title}
                className="w-full h-full object-cover"
              />
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
          {cert.institution && (
            <p className="text-gray-600 dark:text-gray-400 text-sm">{cert.institution}</p>
          )}
          {cert.issueDate && (
            <p className="text-gray-500 text-sm mt-2">{cert.issueDate}</p>
          )}
        </div>
      </motion.div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-white border border-gray-200">
          <div className="relative w-full h-[80vh] flex items-center justify-center bg-gray-100">
            {cert.fileData && (
              isPDF ? (
                <iframe
                  src={cert.fileData}
                  className="w-full h-full"
                  title={cert.title}
                />
              ) : (
                <img
                  src={cert.fileData}
                  alt={cert.title}
                  className="max-w-full max-h-full object-contain"
                />
              )
            )}
          </div>
          {/* Download button in lightbox */}
          {cert.fileData && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <Button onClick={handleDownload} className="gap-2">
                <Download size={16} />
                Descargar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
