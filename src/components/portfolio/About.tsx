'use client';

import { motion } from 'framer-motion';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';

interface AboutProps {
  onEditProfile?: () => void;
}

export function About({ onEditProfile }: AboutProps) {
  const { profile } = useData();
  const { isAuthenticated } = useAuth();

  if (!profile || !profile.bio) return null;

  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50" id="about">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--primary-color)' }}>
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
              Sobre Mí
            </h2>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg whitespace-pre-line">
                  {profile.bio}
                </p>
              </div>

              {isAuthenticated && onEditProfile && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button onClick={onEditProfile} variant="outline" size="sm">
                    Editar Biografía
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
