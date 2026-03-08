'use client';

import { motion } from 'framer-motion';
import { useData } from '@/lib/contexts/data-context';
import { Progress } from '@/components/ui/progress';
import { Code, Database, Server, Wrench, Palette, Cloud } from 'lucide-react';

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
  const { profile } = useData();

  if (!profile || profile.skills.length === 0) return null;

  // Group skills by category
  const skillsByCategory = profile.skills.reduce((acc, skill) => {
    const category = skill.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as { [key: string]: typeof profile.skills });

  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
          style={{ color: profile?.primaryColor }}
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
                <h3 
                  className="text-lg font-semibold mb-4 flex items-center gap-2"
                  style={{ color: profile.primaryColor }}
                >
                  <Icon size={20} />
                  {category}
                </h3>
                
                <div className="space-y-4">
                  {skills.map((skill, index) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span 
                          className="text-sm"
                          style={{ color: profile.primaryColor }}
                        >
                          {skill.level}%
                        </span>
                      </div>
                      <Progress 
                        value={skill.level} 
                        className="h-2"
                        style={{
                          backgroundColor: `${profile.primaryColor}20`,
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
