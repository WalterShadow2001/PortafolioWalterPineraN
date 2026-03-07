'use client';

import { motion } from 'framer-motion';
import { useData } from '@/lib/contexts/data-context';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { 
  Linkedin, Github, Twitter, Instagram, Mail, Phone, MapPin, Globe,
  Edit2, Camera
} from 'lucide-react';
import { useState, useRef } from 'react';
import Image from 'next/image';

const iconMap: { [key: string]: typeof Linkedin } = {
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  instagram: Instagram,
};

export default function Hero({ onEditPhoto }: { onEditPhoto?: () => void }) {
  const { profile, updateProfile } = useData();
  const { isAuthenticated } = useAuth();
  const [editingField, setEditingField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!profile) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        await updateProfile({ photo: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section 
      className="min-h-screen flex items-center justify-center px-4 py-20"
      style={{ backgroundColor: profile.backgroundColor }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full text-center"
      >
        {/* Photo */}
        <div className="relative inline-block mb-6">
          <div 
            className="w-40 h-40 rounded-full overflow-hidden border-4 shadow-lg mx-auto"
            style={{ borderColor: profile.primaryColor }}
          >
            {profile.photo ? (
              <img 
                src={profile.photo} 
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center text-4xl font-bold"
                style={{ backgroundColor: profile.primaryColor, color: '#fff' }}
              >
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
          </div>
          {isAuthenticated && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 rounded-full shadow-lg transition-colors"
              style={{ backgroundColor: profile.primaryColor, color: '#fff' }}
            >
              <Camera size={18} />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        {/* Name */}
        <EditableField
          value={profile.name}
          fieldName="name"
          label="Nombre"
          isAuthenticated={isAuthenticated}
          editingField={editingField}
          setEditingField={setEditingField}
          className="text-4xl md:text-5xl font-bold mb-2"
          style={{ color: profile.textColor }}
        />

        {/* Title */}
        <EditableField
          value={profile.title}
          fieldName="title"
          label="Título Profesional"
          isAuthenticated={isAuthenticated}
          editingField={editingField}
          setEditingField={setEditingField}
          className="text-xl md:text-2xl mb-4"
          style={{ color: profile.primaryColor }}
        />

        {/* Bio */}
        <EditableField
          value={profile.bio || ''}
          fieldName="bio"
          label="Biografía"
          isAuthenticated={isAuthenticated}
          editingField={editingField}
          setEditingField={setEditingField}
          className="text-gray-600 max-w-2xl mx-auto mb-6"
          style={{ color: profile.textColor }}
          isTextarea
        />

        {/* Contact Info */}
        <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
          {profile.email && (
            <a 
              href={`mailto:${profile.email}`}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
              style={{ color: profile.textColor }}
            >
              <Mail size={16} />
              <EditableField
                value={profile.email}
                fieldName="email"
                label="Email"
                isAuthenticated={isAuthenticated}
                editingField={editingField}
                setEditingField={setEditingField}
                inline
              />
            </a>
          )}
          {profile.phone && (
            <span 
              className="flex items-center gap-2"
              style={{ color: profile.textColor }}
            >
              <Phone size={16} />
              <EditableField
                value={profile.phone}
                fieldName="phone"
                label="Teléfono"
                isAuthenticated={isAuthenticated}
                editingField={editingField}
                setEditingField={setEditingField}
                inline
              />
            </span>
          )}
          {profile.location && (
            <span 
              className="flex items-center gap-2"
              style={{ color: profile.textColor }}
            >
              <MapPin size={16} />
              <EditableField
                value={profile.location}
                fieldName="location"
                label="Ubicación"
                isAuthenticated={isAuthenticated}
                editingField={editingField}
                setEditingField={setEditingField}
                inline
              />
            </span>
          )}
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-4">
          {profile.socialLinks.map((link) => {
            const Icon = iconMap[link.icon] || Globe;
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full transition-all hover:scale-110"
                style={{ 
                  backgroundColor: `${profile.primaryColor}20`,
                  color: profile.primaryColor 
                }}
              >
                <Icon size={24} />
              </a>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

function EditableField({
  value,
  fieldName,
  label,
  isAuthenticated,
  editingField,
  setEditingField,
  className = '',
  style = {},
  isTextarea = false,
  inline = false,
}: {
  value: string;
  fieldName: string;
  label: string;
  isAuthenticated: boolean;
  editingField: string | null;
  setEditingField: (f: string | null) => void;
  className?: string;
  style?: React.CSSProperties;
  isTextarea?: boolean;
  inline?: boolean;
}) {
  const [editValue, setEditValue] = useState(value);
  const { updateProfile } = useData();

  const handleSave = async () => {
    await updateProfile({ [fieldName]: editValue });
    setEditingField(null);
  };

  if (!isAuthenticated || editingField !== fieldName) {
    return (
      <div 
        className={`${className} ${inline ? '' : 'relative group'} cursor-default`}
        style={style}
        onClick={() => isAuthenticated && setEditingField(fieldName)}
      >
        {value}
        {isAuthenticated && (
          <Edit2 
            size={14} 
            className="absolute -right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setEditingField(fieldName);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`${inline ? 'inline-flex items-center gap-2' : ''}`}>
      {isTextarea ? (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full p-2 border rounded-md"
          autoFocus
        />
      ) : (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className={`${inline ? 'w-40' : 'w-full'} p-2 border rounded-md`}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') setEditingField(null);
          }}
        />
      )}
      <Button size="sm" onClick={handleSave} className="ml-2">
        Guardar
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setEditingField(null)}>
        Cancelar
      </Button>
    </div>
  );
}
