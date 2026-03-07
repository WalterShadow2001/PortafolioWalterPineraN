'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  technologies: string | null;
  images: string | null;
  startDate: string | null;
  endDate: string | null;
  featured: boolean;
  order: number;
}

interface Certificate {
  id: string;
  title: string;
  institution: string | null;
  issueDate: string | null;
  fileData: string | null;
  fileType: string | null;
  description: string | null;
  order: number;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
  type: string;
  order: number;
}

interface Skill {
  id: string;
  name: string;
  level: number;
  icon: string | null;
  category: string;
  order: number;
}

interface Profile {
  id: string;
  name: string;
  title: string;
  photo: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  socialLinks: SocialLink[];
  projects: Project[];
  certificates: Certificate[];
  experiences: Experience[];
  skills: Skill[];
}

interface DataContextType {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  addProject: (data: Partial<Project>) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addCertificate: (data: Partial<Certificate>) => Promise<void>;
  updateCertificate: (id: string, data: Partial<Certificate>) => Promise<void>;
  deleteCertificate: (id: string) => Promise<void>;
  addExperience: (data: Partial<Experience>) => Promise<void>;
  updateExperience: (id: string, data: Partial<Experience>) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  addSkill: (data: Partial<Skill>) => Promise<void>;
  updateSkill: (id: string, data: Partial<Skill>) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/portfolio');
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const updateProfile = async (data: Partial<Profile>) => {
    await fetch('/api/portfolio', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await refreshProfile();
  };

  const addProject = async (data: Partial<Project>) => {
    await fetch('/api/portfolio/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await refreshProfile();
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    await fetch('/api/portfolio/projects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    await refreshProfile();
  };

  const deleteProject = async (id: string) => {
    await fetch(`/api/portfolio/projects?id=${id}`, { method: 'DELETE' });
    await refreshProfile();
  };

  const addCertificate = async (data: Partial<Certificate>) => {
    await fetch('/api/portfolio/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await refreshProfile();
  };

  const updateCertificate = async (id: string, data: Partial<Certificate>) => {
    await fetch('/api/portfolio/certificates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    await refreshProfile();
  };

  const deleteCertificate = async (id: string) => {
    await fetch(`/api/portfolio/certificates?id=${id}`, { method: 'DELETE' });
    await refreshProfile();
  };

  const addExperience = async (data: Partial<Experience>) => {
    await fetch('/api/portfolio/experiences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await refreshProfile();
  };

  const updateExperience = async (id: string, data: Partial<Experience>) => {
    await fetch('/api/portfolio/experiences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    await refreshProfile();
  };

  const deleteExperience = async (id: string) => {
    await fetch(`/api/portfolio/experiences?id=${id}`, { method: 'DELETE' });
    await refreshProfile();
  };

  const addSkill = async (data: Partial<Skill>) => {
    await fetch('/api/portfolio/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await refreshProfile();
  };

  const updateSkill = async (id: string, data: Partial<Skill>) => {
    await fetch('/api/portfolio/skills', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    await refreshProfile();
  };

  const deleteSkill = async (id: string) => {
    await fetch(`/api/portfolio/skills?id=${id}`, { method: 'DELETE' });
    await refreshProfile();
  };

  return (
    <DataContext.Provider
      value={{
        profile,
        loading,
        refreshProfile,
        updateProfile,
        addProject,
        updateProject,
        deleteProject,
        addCertificate,
        updateCertificate,
        deleteCertificate,
        addExperience,
        updateExperience,
        deleteExperience,
        addSkill,
        updateSkill,
        deleteSkill,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
