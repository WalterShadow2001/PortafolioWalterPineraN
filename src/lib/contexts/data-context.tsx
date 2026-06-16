'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';

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
  theme: string;
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
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef(false);

  const refreshProfile = useCallback(async () => {
    // Prevent duplicate concurrent refreshes
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    try {
      const res = await fetch('/api/portfolio');
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      isRefreshingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Debounced refresh - coalesces multiple rapid saves into one fetch
  const debouncedRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = setTimeout(() => {
      refreshProfile();
    }, 300);
  }, [refreshProfile]);

  useEffect(() => {
    refreshProfile();
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [refreshProfile]);

  // Helper: perform a mutation and optimistically update local state
  const mutate = useCallback(async (
    url: string,
    method: string,
    body?: any,
    optimisticUpdate?: (prev: Profile) => Profile
  ) => {
    // Apply optimistic update immediately if provided
    if (optimisticUpdate && profile) {
      setProfile(optimisticUpdate(profile));
    }

    try {
      const options: RequestInit = { method };
      if (body) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(body);
      }
      const res = await fetch(url, options);
      if (!res.ok) {
        // Revert on error by refreshing from server
        await refreshProfile();
        throw new Error('Mutation failed');
      }

      // If no optimistic update was applied, do a debounced refresh
      if (!optimisticUpdate) {
        debouncedRefresh();
      } else {
        // Even with optimistic update, refresh in background to ensure consistency
        debouncedRefresh();
      }
    } catch (error) {
      console.error('Mutation error:', error);
      await refreshProfile();
      throw error;
    }
  }, [profile, refreshProfile, debouncedRefresh]);

  const updateProfile = useCallback(async (data: Partial<Profile>) => {
    await mutate('/api/portfolio', 'PUT', data, (prev) => ({
      ...prev,
      ...data,
    }));
  }, [mutate]);

  const addProject = useCallback(async (data: Partial<Project>) => {
    await mutate('/api/portfolio/projects', 'POST', data);
  }, [mutate]);

  const updateProject = useCallback(async (id: string, data: Partial<Project>) => {
    await mutate('/api/portfolio/projects', 'PUT', { id, ...data }, (prev) => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...data } : p),
    }));
  }, [mutate]);

  const deleteProject = useCallback(async (id: string) => {
    await mutate(`/api/portfolio/projects?id=${id}`, 'DELETE', undefined, (prev) => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
    }));
  }, [mutate]);

  const addCertificate = useCallback(async (data: Partial<Certificate>) => {
    await mutate('/api/portfolio/certificates', 'POST', data);
  }, [mutate]);

  const updateCertificate = useCallback(async (id: string, data: Partial<Certificate>) => {
    await mutate('/api/portfolio/certificates', 'PUT', { id, ...data }, (prev) => ({
      ...prev,
      certificates: prev.certificates.map(c => c.id === id ? { ...c, ...data } : c),
    }));
  }, [mutate]);

  const deleteCertificate = useCallback(async (id: string) => {
    await mutate(`/api/portfolio/certificates?id=${id}`, 'DELETE', undefined, (prev) => ({
      ...prev,
      certificates: prev.certificates.filter(c => c.id !== id),
    }));
  }, [mutate]);

  const addExperience = useCallback(async (data: Partial<Experience>) => {
    await mutate('/api/portfolio/experiences', 'POST', data);
  }, [mutate]);

  const updateExperience = useCallback(async (id: string, data: Partial<Experience>) => {
    await mutate('/api/portfolio/experiences', 'PUT', { id, ...data }, (prev) => ({
      ...prev,
      experiences: prev.experiences.map(e => e.id === id ? { ...e, ...data } : e),
    }));
  }, [mutate]);

  const deleteExperience = useCallback(async (id: string) => {
    await mutate(`/api/portfolio/experiences?id=${id}`, 'DELETE', undefined, (prev) => ({
      ...prev,
      experiences: prev.experiences.filter(e => e.id !== id),
    }));
  }, [mutate]);

  const addSkill = useCallback(async (data: Partial<Skill>) => {
    await mutate('/api/portfolio/skills', 'POST', data);
  }, [mutate]);

  const updateSkill = useCallback(async (id: string, data: Partial<Skill>) => {
    await mutate('/api/portfolio/skills', 'PUT', { id, ...data }, (prev) => ({
      ...prev,
      skills: prev.skills.map(s => s.id === id ? { ...s, ...data } : s),
    }));
  }, [mutate]);

  const deleteSkill = useCallback(async (id: string) => {
    await mutate(`/api/portfolio/skills?id=${id}`, 'DELETE', undefined, (prev) => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== id),
    }));
  }, [mutate]);

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
