'use client';

import { motion } from 'framer-motion';
import { useData } from '@/lib/contexts/data-context';
import { useAuth } from '@/lib/contexts/auth-context';
import { Briefcase, GraduationCap, MapPin, Calendar } from 'lucide-react';

export default function Experience() {
  const { profile } = useData();
  const { isAuthenticated } = useAuth();

  if (!profile || profile.experiences.length === 0) return null;

  const workExperiences = profile.experiences.filter(e => e.type === 'work');
  const educationExperiences = profile.experiences.filter(e => e.type === 'education');

  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
          style={{ color: profile.primaryColor }}
        >
          Experiencia y Educación
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Work Experience */}
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: profile.primaryColor }}>
              <Briefcase size={24} />
              Experiencia Laboral
            </h3>
            <div className="relative pl-8 border-l-2" style={{ borderColor: profile.primaryColor }}>
              {workExperiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative mb-8 last:mb-0"
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-[25px] top-0 w-4 h-4 rounded-full"
                    style={{ backgroundColor: profile.primaryColor }}
                  />
                  
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-lg">{exp.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{exp.company}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {exp.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {exp.startDate} - {exp.endDate || 'Presente'}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: profile.secondaryColor }}>
              <GraduationCap size={24} />
              Educación
            </h3>
            <div className="relative pl-8 border-l-2" style={{ borderColor: profile.secondaryColor }}>
              {educationExperiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative mb-8 last:mb-0"
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-[25px] top-0 w-4 h-4 rounded-full"
                    style={{ backgroundColor: profile.secondaryColor }}
                  />
                  
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-lg">{exp.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{exp.company}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {exp.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {exp.startDate} - {exp.endDate || 'Presente'}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
