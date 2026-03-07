'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { AuthProvider, useAuth } from '@/lib/contexts/auth-context';
import { DataProvider, useData } from '@/lib/contexts/data-context';
import Hero from '@/components/portfolio/Hero';
import Experience from '@/components/portfolio/Experience';
import Projects from '@/components/portfolio/Projects';
import Skills from '@/components/portfolio/Skills';
import Certificates from '@/components/portfolio/Certificates';
import Contact from '@/components/portfolio/Contact';
import { LoginButton, EditorPanel } from '@/components/editor/EditorPanel';
import { PDFExportButton } from '@/components/pdf/PDFExport';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Empty subscription for useSyncExternalStore
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

function PortfolioContent() {
  const { profile, loading } = useData();
  const { isAuthenticated } = useAuth();
  
  // Client-side only rendering check
  const isClient = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  // Apply theme colors from profile
  useEffect(() => {
    if (profile) {
      document.documentElement.style.setProperty('--color-primary', profile.primaryColor);
      document.documentElement.style.setProperty('--color-secondary', profile.secondaryColor);
      document.documentElement.style.setProperty('--color-accent', profile.accentColor);
      document.documentElement.style.setProperty('--color-background', profile.backgroundColor);
      document.documentElement.style.setProperty('--color-text', profile.textColor);
    }
  }, [profile]);

  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-gray-500">Cargando portafolio...</span>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-500">Error al cargar el portafolio</span>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: profile.backgroundColor }}
    >
      {/* Fixed buttons */}
      <LoginButton />
      <PDFExportButton />

      {/* Main content */}
      <main>
        <Hero />
        <Experience />
        <Projects />
        <Skills />
        <Certificates />
        <Contact />
      </main>

      {/* Editor Panel (only when authenticated) */}
      <AnimatePresence>
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
          >
            <EditorPanel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer 
        className="py-8 text-center text-sm"
        style={{ backgroundColor: `${profile.primaryColor}10`, color: profile.textColor }}
      >
        <p>© {new Date().getFullYear()} {profile.name}. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <DataProvider>
        <PortfolioContent />
      </DataProvider>
    </AuthProvider>
  );
}
