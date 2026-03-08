'use client';

import { motion } from 'framer-motion';
import { useData } from '@/lib/contexts/data-context';
import { useAuth } from '@/lib/contexts/auth-context';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function Projects() {
  const { profile } = useData();
  const { isAuthenticated } = useAuth();

  if (!profile || profile.projects.length === 0) return null;

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profile.projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} primaryColor={profile.primaryColor} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, index, primaryColor }: { project: any; index: number; primaryColor: string }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = project.images ? JSON.parse(project.images) : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group"
    >
      {/* Project Images Carousel */}
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
        
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_: any, i: number) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-white/50"
              />
            ))}
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
                style={{ 
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor 
                }}
              >
                {tech.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black/90 border-none">
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            {images.length > 0 && (
              <img
                src={images[currentImageIndex]}
                alt={`${project.title} - ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}
            
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="text-white" size={24} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="text-white" size={24} />
                </button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_: any, i: number) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i); }}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        i === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
