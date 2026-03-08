'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileDown, Check } from 'lucide-react';

type TemplateType = 'classic' | 'modern' | 'creative' | 'minimal';

interface SectionVisibility {
  experience: boolean;
  projects: boolean;
  skills: boolean;
  certificates: boolean;
  contact: boolean;
}

const templates: { id: TemplateType; name: string; preview: string }[] = [
  { id: 'classic', name: 'Clásico', preview: 'Diseño tradicional y profesional' },
  { id: 'modern', name: 'Moderno', preview: 'Barra lateral con degradado' },
  { id: 'creative', name: 'Creativo', preview: 'Diseño único con gradientes' },
  { id: 'minimal', name: 'Minimalista', preview: 'Solo lo esencial' },
];

interface PDFExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: any;
}

export function PDFExportDialog({ open, onOpenChange, profile }: PDFExportDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('classic');
  const [sections, setSections] = useState<SectionVisibility>({
    experience: true,
    projects: true,
    skills: true,
    certificates: true,
    contact: true,
  });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = generateCVHTML(profile, selectedTemplate, sections);
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">📄 Generar CV en PDF</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 pt-4">
          {/* Options */}
          <div className="space-y-6">
            {/* Template Selection */}
            <div>
              <h3 className="font-semibold mb-3">Selecciona una Plantilla</h3>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{template.name}</span>
                      {selectedTemplate === template.id && (
                        <Check size={16} className="text-blue-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{template.preview}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Section Selection */}
            <div>
              <h3 className="font-semibold mb-3">Secciones a Incluir</h3>
              <div className="space-y-2">
                {Object.entries(sections).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => 
                        setSections({ ...sections, [key]: checked as boolean })
                      }
                    />
                    <Label htmlFor={key} className="cursor-pointer capitalize">
                      {key === 'experience' ? '💼 Experiencia y Educación' :
                       key === 'projects' ? '📁 Proyectos' :
                       key === 'skills' ? '💻 Habilidades' :
                       key === 'certificates' ? '🏆 Certificados' :
                       '📧 Contacto'}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handlePrint} 
              className="w-full gap-2 text-lg py-6"
              style={{ backgroundColor: profile?.primaryColor || '#3b82f6' }}
            >
              <FileDown size={20} />
              Generar e Imprimir PDF
            </Button>

            <p className="text-xs text-gray-500 text-center">
              El PDF se generará en tamaño carta (8.5" x 11")
            </p>
          </div>

          {/* Preview */}
          <div>
            <h3 className="font-semibold mb-3">Vista Previa</h3>
            <div 
              className="border rounded-lg overflow-hidden bg-white shadow-inner"
              style={{ 
                transform: 'scale(0.55)', 
                transformOrigin: 'top left', 
                width: '182%', 
                height: '550px' 
              }}
            >
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: generateCVContent(profile, selectedTemplate, sections) 
                }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function generateCVHTML(profile: any, template: TemplateType, sections: SectionVisibility): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CV - ${profile.name}</title>
  <style>
    ${getTemplateStyles(template, profile)}
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { size: letter; margin: 0; }
    }
  </style>
</head>
<body>
  ${generateCVContent(profile, template, sections)}
</body>
</html>
`;
}

function getTemplateStyles(template: TemplateType, profile: any): string {
  const baseStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #333;
      background: #fff;
    }
  `;

  switch (template) {
    case 'classic':
      return baseStyles + `
        .cv-container { max-width: 8.5in; min-height: 11in; margin: 0 auto; padding: 0.4in; }
        .header { text-align: center; border-bottom: 2px solid ${profile.primaryColor}; padding-bottom: 12px; margin-bottom: 12px; }
        .name { font-size: 22pt; font-weight: bold; color: ${profile.primaryColor}; margin-bottom: 4px; }
        .title { font-size: 12pt; color: #666; margin-bottom: 8px; }
        .contact-info { display: flex; justify-content: center; gap: 15px; font-size: 9pt; color: #666; flex-wrap: wrap; }
        .section { margin-bottom: 12px; }
        .section-title { font-size: 11pt; font-weight: bold; color: ${profile.primaryColor}; border-bottom: 1px solid ${profile.primaryColor}; padding-bottom: 2px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
        .item { margin-bottom: 8px; }
        .item-title { font-weight: bold; font-size: 10pt; }
        .item-subtitle { color: #666; font-size: 9pt; }
        .item-date { color: #888; font-size: 8pt; }
        .item-desc { color: #555; font-size: 9pt; margin-top: 2px; }
        .skills-grid { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-item { display: flex; align-items: center; gap: 4px; }
        .skill-bar { width: 50px; height: 5px; background: #eee; border-radius: 2px; }
        .skill-fill { height: 100%; background: ${profile.primaryColor}; border-radius: 2px; }
        .skill-tag { padding: 2px 6px; background: ${profile.primaryColor}15; border-radius: 3px; font-size: 8pt; }
      `;
    
    case 'modern':
      return baseStyles + `
        .cv-container { display: flex; min-height: 11in; }
        .sidebar { width: 32%; background: ${profile.primaryColor}; color: #fff; padding: 20px; }
        .main { width: 68%; padding: 20px; }
        .photo { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 12px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 28pt; font-weight: bold; }
        .name { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 4px; }
        .title { font-size: 10pt; text-align: center; opacity: 0.9; margin-bottom: 15px; }
        .sidebar-section { margin-bottom: 15px; }
        .sidebar-title { font-size: 9pt; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase; }
        .contact-item { margin-bottom: 6px; font-size: 9pt; }
        .section { margin-bottom: 12px; }
        .section-title { font-size: 10pt; font-weight: bold; color: ${profile.primaryColor}; margin-bottom: 8px; text-transform: uppercase; }
        .item { margin-bottom: 8px; }
        .item-title { font-weight: bold; font-size: 10pt; }
        .item-subtitle { color: #666; font-size: 9pt; }
        .skill-item { margin-bottom: 6px; }
        .skill-name { display: flex; justify-content: space-between; font-size: 9pt; margin-bottom: 2px; }
        .skill-bar { height: 4px; background: #eee; border-radius: 2px; }
        .skill-fill { height: 100%; background: ${profile.primaryColor}; border-radius: 2px; }
      `;
    
    case 'creative':
      return baseStyles + `
        .cv-container { max-width: 8.5in; min-height: 11in; margin: 0 auto; padding: 0.4in; }
        .header { background: linear-gradient(135deg, ${profile.primaryColor}, ${profile.secondaryColor}); color: #fff; padding: 18px; border-radius: 8px; margin-bottom: 12px; display: flex; gap: 15px; align-items: center; }
        .photo { width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 24pt; flex-shrink: 0; }
        .header-info { flex: 1; }
        .name { font-size: 18pt; font-weight: bold; }
        .title { font-size: 11pt; opacity: 0.9; margin-bottom: 6px; }
        .contact-line { font-size: 8pt; opacity: 0.8; }
        .section { margin-bottom: 10px; }
        .section-title { font-size: 10pt; font-weight: bold; color: ${profile.primaryColor}; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .section-title::after { content: ''; flex: 1; height: 2px; background: linear-gradient(to right, ${profile.primaryColor}, transparent); }
        .timeline { border-left: 2px solid ${profile.primaryColor}; padding-left: 12px; }
        .item { margin-bottom: 8px; position: relative; }
        .item::before { content: ''; position: absolute; left: -16px; top: 3px; width: 6px; height: 6px; border-radius: 50%; background: ${profile.primaryColor}; }
        .item-title { font-weight: bold; font-size: 10pt; }
        .item-subtitle { color: #666; font-size: 9pt; }
        .skills-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
        .skill-item { text-align: center; }
        .skill-circle { width: 35px; height: 35px; border-radius: 50%; border: 2px solid ${profile.primaryColor}; display: flex; align-items: center; justify-content: center; margin: 0 auto 3px; font-weight: bold; font-size: 9pt; }
        .skill-name { font-size: 8pt; }
      `;
    
    case 'minimal':
      return baseStyles + `
        .cv-container { max-width: 8.5in; min-height: 11in; margin: 0 auto; padding: 0.5in; }
        .header { text-align: center; margin-bottom: 18px; }
        .name { font-size: 26pt; font-weight: 300; letter-spacing: 3px; margin-bottom: 6px; text-transform: uppercase; }
        .title { font-size: 11pt; color: #888; letter-spacing: 2px; margin-bottom: 8px; text-transform: uppercase; }
        .contact-line { font-size: 9pt; color: #666; }
        .section { margin-bottom: 15px; }
        .section-title { font-size: 9pt; font-weight: 600; letter-spacing: 2px; color: #333; margin-bottom: 10px; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 4px; }
        .item { margin-bottom: 10px; }
        .item-header { display: flex; justify-content: space-between; }
        .item-title { font-weight: 500; font-size: 10pt; }
        .item-date { color: #888; font-size: 9pt; }
        .item-subtitle { color: #666; font-size: 9pt; margin-top: 2px; }
        .item-desc { color: #444; font-size: 9pt; margin-top: 4px; }
        .skills-list { display: flex; flex-wrap: wrap; gap: 4px; }
        .skill-tag { padding: 3px 8px; background: #f0f0f0; border-radius: 3px; font-size: 9pt; }
      `;
    
    default:
      return baseStyles;
  }
}

function generateCVContent(profile: any, template: TemplateType, sections: SectionVisibility): string {
  const workExperiences = profile.experiences?.filter((e: any) => e.type === 'work') || [];
  const educationExperiences = profile.experiences?.filter((e: any) => e.type === 'education') || [];

  switch (template) {
    case 'classic':
      return `
        <div class="cv-container">
          <div class="header">
            <div class="name">${profile.name}</div>
            <div class="title">${profile.title}</div>
            <div class="contact-info">
              ${profile.email ? `<span>📧 ${profile.email}</span>` : ''}
              ${profile.phone ? `<span>📱 ${profile.phone}</span>` : ''}
              ${profile.location ? `<span>📍 ${profile.location}</span>` : ''}
            </div>
          </div>
          
          ${profile.bio ? `
            <div class="section">
              <div class="section-title">Perfil Profesional</div>
              <p style="font-size: 9pt; color: #555;">${profile.bio}</p>
            </div>
          ` : ''}
          
          ${sections.experience && workExperiences.length > 0 ? `
            <div class="section">
              <div class="section-title">Experiencia Laboral</div>
              ${workExperiences.map((exp: any) => `
                <div class="item">
                  <div class="item-title">${exp.title}</div>
                  <div class="item-subtitle">${exp.company}${exp.location ? ` • ${exp.location}` : ''}</div>
                  <div class="item-date">${exp.startDate} - ${exp.endDate || 'Presente'}</div>
                  ${exp.description ? `<div class="item-desc">${exp.description}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${sections.experience && educationExperiences.length > 0 ? `
            <div class="section">
              <div class="section-title">Educación</div>
              ${educationExperiences.map((exp: any) => `
                <div class="item">
                  <div class="item-title">${exp.title}</div>
                  <div class="item-subtitle">${exp.company}</div>
                  <div class="item-date">${exp.startDate} - ${exp.endDate || 'Presente'}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${sections.skills && profile.skills?.length > 0 ? `
            <div class="section">
              <div class="section-title">Habilidades</div>
              <div class="skills-grid">
                ${profile.skills.map((skill: any) => `
                  <div class="skill-item">
                    <span style="font-size: 9pt; width: 80px;">${skill.name}</span>
                    <div class="skill-bar">
                      <div class="skill-fill" style="width: ${skill.level}%"></div>
                    </div>
                    <span style="font-size: 8pt; color: #888;">${skill.level}%</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${sections.projects && profile.projects?.length > 0 ? `
            <div class="section">
              <div class="section-title">Proyectos Destacados</div>
              ${profile.projects.slice(0, 3).map((proj: any) => `
                <div class="item">
                  <div class="item-title">${proj.title}</div>
                  ${proj.technologies ? `<div class="item-subtitle">${proj.technologies}</div>` : ''}
                  ${proj.description ? `<div class="item-desc">${proj.description?.substring(0, 100)}${proj.description?.length > 100 ? '...' : ''}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${sections.certificates && profile.certificates?.length > 0 ? `
            <div class="section">
              <div class="section-title">Certificaciones</div>
              ${profile.certificates.map((cert: any) => `
                <div class="item">
                  <div class="item-title">${cert.title}</div>
                  <div class="item-subtitle">${cert.institution || ''} ${cert.issueDate ? `• ${cert.issueDate}` : ''}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${sections.contact ? `
            <div class="section">
              <div class="section-title">Contacto</div>
              <div class="contact-info" style="justify-content: flex-start;">
                ${profile.email ? `<span>📧 ${profile.email}</span>` : ''}
                ${profile.phone ? `<span>📱 ${profile.phone}</span>` : ''}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    
    case 'modern':
      return `
        <div class="cv-container">
          <div class="sidebar">
            <div class="photo">${profile.name.split(' ').map((n: string) => n[0]).join('')}</div>
            <div class="name">${profile.name}</div>
            <div class="title">${profile.title}</div>
            
            ${sections.contact ? `
              <div class="sidebar-section">
                <div class="sidebar-title">Contacto</div>
                ${profile.email ? `<div class="contact-item">📧 ${profile.email}</div>` : ''}
                ${profile.phone ? `<div class="contact-item">📱 ${profile.phone}</div>` : ''}
                ${profile.location ? `<div class="contact-item">📍 ${profile.location}</div>` : ''}
              </div>
            ` : ''}
            
            ${sections.skills && profile.skills?.length > 0 ? `
              <div class="sidebar-section">
                <div class="sidebar-title">Habilidades</div>
                ${profile.skills.map((skill: any) => `
                  <div class="skill-item">
                    <div class="skill-name">
                      <span>${skill.name}</span>
                      <span>${skill.level}%</span>
                    </div>
                    <div class="skill-bar">
                      <div class="skill-fill" style="width: ${skill.level}%"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${sections.certificates && profile.certificates?.length > 0 ? `
              <div class="sidebar-section">
                <div class="sidebar-title">Certificados</div>
                ${profile.certificates.map((cert: any) => `
                  <div class="contact-item">
                    <strong>${cert.title}</strong><br>
                    ${cert.institution || ''} ${cert.issueDate ? `(${cert.issueDate})` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
          
          <div class="main">
            ${profile.bio ? `
              <div class="section">
                <div class="section-title">Perfil</div>
                <p style="font-size: 9pt; color: #555;">${profile.bio}</p>
              </div>
            ` : ''}
            
            ${sections.experience && workExperiences.length > 0 ? `
              <div class="section">
                <div class="section-title">Experiencia</div>
                ${workExperiences.map((exp: any) => `
                  <div class="item">
                    <div class="item-title">${exp.title}</div>
                    <div class="item-subtitle">${exp.company} | ${exp.startDate} - ${exp.endDate || 'Presente'}</div>
                    ${exp.description ? `<p style="font-size: 9pt; color: #555; margin-top: 2px;">${exp.description}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${sections.experience && educationExperiences.length > 0 ? `
              <div class="section">
                <div class="section-title">Educación</div>
                ${educationExperiences.map((exp: any) => `
                  <div class="item">
                    <div class="item-title">${exp.title}</div>
                    <div class="item-subtitle">${exp.company} | ${exp.startDate} - ${exp.endDate || 'Presente'}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${sections.projects && profile.projects?.length > 0 ? `
              <div class="section">
                <div class="section-title">Proyectos</div>
                ${profile.projects.slice(0, 4).map((proj: any) => `
                  <div class="item">
                    <div class="item-title">${proj.title}</div>
                    <div class="item-subtitle">${proj.technologies || ''}</div>
                    ${proj.description ? `<p style="font-size: 9pt; color: #555; margin-top: 2px;">${proj.description?.substring(0, 80)}...</p>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    
    case 'creative':
      return `
        <div class="cv-container">
          <div class="header">
            <div class="photo">${profile.name.split(' ').map((n: string) => n[0]).join('')}</div>
            <div class="header-info">
              <div class="name">${profile.name}</div>
              <div class="title">${profile.title}</div>
              <div class="contact-line">
                ${[profile.email, profile.phone, profile.location].filter(Boolean).join(' • ')}
              </div>
            </div>
          </div>
          
          ${profile.bio ? `
            <div class="section">
              <p style="font-size: 9pt; color: #555; text-align: center;">${profile.bio}</p>
            </div>
          ` : ''}
          
          ${sections.experience && workExperiences.length > 0 ? `
            <div class="section">
              <div class="section-title">Experiencia</div>
              <div class="timeline">
                ${workExperiences.map((exp: any) => `
                  <div class="item">
                    <div class="item-title">${exp.title}</div>
                    <div class="item-subtitle">${exp.company} • ${exp.startDate} - ${exp.endDate || 'Presente'}</div>
                    ${exp.description ? `<p style="font-size: 9pt; color: #555; margin-top: 2px;">${exp.description}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${sections.experience && educationExperiences.length > 0 ? `
            <div class="section">
              <div class="section-title">Educación</div>
              <div class="timeline">
                ${educationExperiences.map((exp: any) => `
                  <div class="item">
                    <div class="item-title">${exp.title}</div>
                    <div class="item-subtitle">${exp.company} • ${exp.startDate} - ${exp.endDate || 'Presente'}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${sections.skills && profile.skills?.length > 0 ? `
            <div class="section">
              <div class="section-title">Habilidades</div>
              <div class="skills-grid">
                ${profile.skills.map((skill: any) => `
                  <div class="skill-item">
                    <div class="skill-circle">${skill.level}%</div>
                    <div class="skill-name">${skill.name}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${sections.projects && profile.projects?.length > 0 ? `
            <div class="section">
              <div class="section-title">Proyectos</div>
              ${profile.projects.slice(0, 3).map((proj: any) => `
                <div class="item" style="border-left: 3px solid ${profile.accentColor}; padding-left: 10px; margin-bottom: 8px;">
                  <div class="item-title">${proj.title}</div>
                  <div class="item-subtitle">${proj.technologies || ''}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    
    case 'minimal':
      return `
        <div class="cv-container">
          <div class="header">
            <div class="name">${profile.name.toUpperCase()}</div>
            <div class="title">${profile.title}</div>
            <div class="contact-line">
              ${[profile.email, profile.phone, profile.location].filter(Boolean).join('  •  ')}
            </div>
          </div>
          
          ${profile.bio ? `
            <div class="section">
              <p style="color: #555; text-align: center; font-size: 10pt;">${profile.bio}</p>
            </div>
          ` : ''}
          
          ${sections.experience && workExperiences.length > 0 ? `
            <div class="section">
              <div class="section-title">Experiencia</div>
              ${workExperiences.map((exp: any) => `
                <div class="item">
                  <div class="item-header">
                    <div class="item-title">${exp.title}</div>
                    <div class="item-date">${exp.startDate} — ${exp.endDate || 'Presente'}</div>
                  </div>
                  <div class="item-subtitle">${exp.company}</div>
                  ${exp.description ? `<div class="item-desc">${exp.description}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${sections.experience && educationExperiences.length > 0 ? `
            <div class="section">
              <div class="section-title">Educación</div>
              ${educationExperiences.map((exp: any) => `
                <div class="item">
                  <div class="item-header">
                    <div class="item-title">${exp.title}</div>
                    <div class="item-date">${exp.startDate} — ${exp.endDate || 'Presente'}</div>
                  </div>
                  <div class="item-subtitle">${exp.company}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${sections.skills && profile.skills?.length > 0 ? `
            <div class="section">
              <div class="section-title">Habilidades</div>
              <div class="skills-list">
                ${profile.skills.map((skill: any) => `
                  <span class="skill-tag">${skill.name}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${sections.projects && profile.projects?.length > 0 ? `
            <div class="section">
              <div class="section-title">Proyectos</div>
              ${profile.projects.slice(0, 3).map((proj: any) => `
                <div class="item">
                  <div class="item-title">${proj.title}</div>
                  <div class="item-subtitle">${proj.technologies || ''}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${sections.certificates && profile.certificates?.length > 0 ? `
            <div class="section">
              <div class="section-title">Certificaciones</div>
              <div class="skills-list">
                ${profile.certificates.map((cert: any) => `
                  <span class="skill-tag">${cert.title}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    
    default:
      return '';
  }
}
