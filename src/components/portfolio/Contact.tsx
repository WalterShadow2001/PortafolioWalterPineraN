'use client';

import { motion } from 'framer-motion';
import { useData } from '@/lib/contexts/data-context';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Twitter, Send } from 'lucide-react';

const iconMap: { [key: string]: typeof Linkedin } = {
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
};

export default function Contact() {
  const { profile } = useData();

  if (!profile) return null;

  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-8"
          style={{ color: profile.primaryColor }}
        >
          Contacto
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-gray-600 dark:text-gray-400 mb-8"
        >
          ¿Interesado en trabajar juntos? No dudes en contactarme.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <Mail style={{ color: profile.primaryColor }} size={24} />
              <span className="text-lg">{profile.email}</span>
            </a>
          )}

          {profile.phone && (
            <a
              href={`tel:${profile.phone}`}
              className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <Phone style={{ color: profile.primaryColor }} size={24} />
              <span className="text-lg">{profile.phone}</span>
            </a>
          )}

          {profile.location && (
            <div className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <MapPin style={{ color: profile.primaryColor }} size={24} />
              <span className="text-lg">{profile.location}</span>
            </div>
          )}

          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <Globe style={{ color: profile.primaryColor }} size={24} />
              <span className="text-lg">{profile.website.replace('https://', '')}</span>
            </a>
          )}

          {/* Social Links */}
          <div className="flex justify-center gap-4 pt-4">
            {profile.socialLinks.map((link) => {
              const Icon = iconMap[link.icon] || Globe;
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-full transition-all hover:scale-110"
                  style={{ 
                    backgroundColor: profile.primaryColor,
                    color: '#fff' 
                  }}
                >
                  <Icon size={24} />
                </a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
