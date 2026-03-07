'use client';

import { motion } from 'framer-motion';
import { useData } from '@/lib/contexts/data-context';
import { useAuth } from '@/lib/contexts/auth-context';
import { Progress } from '@/components/ui/progress';
import { Code, Database, Server, Wrench, Palette, Cloud, Edit2, Trash2 } from 'lucide-react';
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
                    <SkillItem key={skill.id} skill={skill} index={index} primaryColor={profile.primaryColor} />
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

function SkillItem({ skill, index, primaryColor }: { skill: any; index: number; primaryColor: string }) {
  const { isAuthenticated } = useAuth();
  const { deleteSkill } = useData();

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de eliminar esta habilidad?')) {
      await deleteSkill(skill.id);
      toast.success('Habilidad eliminada');
    }
  };

  const handleEdit = () => {
    toast.info('Usa el panel de editor para modificar esta habilidad');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
    >
      <div className="flex justify-between mb-1 items-center">
        <span className="text-sm font-medium">{skill.name}</span>
        <div className="flex items-center gap-2">
          <span 
            className="text-sm"
            style={{ color: primaryColor }}
          >
            {skill.level}%
          </span>
          {isAuthenticated && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={handleEdit}
              >
                <Edit2 size={12} className="text-blue-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={handleDelete}
              >
                <Trash2 size={12} className="text-red-500" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <Progress 
        value={skill.level} 
        className="h-2"
        style={{
          backgroundColor: `${primaryColor}20`,
        }}
      />
    </motion.div>
  );
}
