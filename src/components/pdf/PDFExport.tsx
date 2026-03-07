'use client';

import { useState, useRef } from 'react';
import { useData } from '@/lib/contexts/data-context';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileDown, Eye } from 'lucide-react';

type TemplateType = 'classic' | 'modern' | 'creative' | 'minimal';

interface SectionVisibility {
  experience: boolean;
  projects: boolean;
  skills: boolean;
  certificates: boolean;
  contact: boolean;
}

const templates: { id: TemplateType; name: string; description: string }[] = [
  { id: 'classic', name: 'Clásico', description: 'Diseño tradicional y profesional' },
  { id: 'modern', name: 'Moderno', description: 'Estilo limpio con toques de color' },
  { id: 'creative', name: 'Creativo', description: 'Diseño único y original' },
  { id: 'minimal', name: 'Minimalista', description: 'Solo lo esencial, máxima claridad' },
];

export function PDFExportButton() {
  const { profile } = useData();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('classic');
  const [sections, setSections] = useState<SectionVisibility>({
    experience: true,
    projects: true,
    skills: true,
    certificates: true,
    contact: true,
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!profile) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = generatePDFHTML(profile, selectedTemplate, sections);
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="fixed top-4 left-4 z-50 gap-2"
          >
            <FileDown size={16} />
            Generar CV PDF
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generar CV en PDF</DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Options */}
            <div className="space-y-6">
              {/* Template Selection */}
              <div>
                <h3 className="font-semibold mb-3">Plantilla</h3>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-gray-500">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Selection */}
              <div>
                <h3 className="font-semibold mb-3">Secciones a Incluir</h3>
                <div className="space-y-2">
                  {Object.entries(sections).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => 
                          setSections({ ...sections, [key]: checked as boolean })
                        }
                      />
                      <Label htmlFor={key} className="capitalize">
                        {key === 'experience' ? 'Experiencia y Educación' :
                         key === 'projects' ? 'Proyectos' :
                         key === 'skills' ? 'Habilidades' :
                         key === 'certificates' ? 'Certificados' :
                         'Contacto'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button onClick={handlePrint} className="w-full gap-2">
                <FileDown size={16} />
                Descargar PDF
              </Button>
            </div>

            {/* Preview */}
            <div>
              <h3 className="font-semibold mb-3">Vista Previa</h3>
              <div 
                className="border rounded-lg overflow-hidden bg-white"
                style={{ transform: 'scale(0.6)', transformOrigin: 'top left', width: '167%', height: '600px' }}
              >
                <div 
                  ref={printRef}
                  dangerouslySetInnerHTML={{ 
                    __html: generatePDFHTML(profile, selectedTemplate, sections, true) 
                  }}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function generatePDFHTML(
  profile: any, 
  template: TemplateType, 
  sections: SectionVisibility,
  isPreview = false
): string {
  const styles = getTemplateStyles(template, profile);
  
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>CV - ${profile.name}</title>
      <style>
        ${styles}
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      ${generateCVContent(profile, template, sections)}
    </body>
    </html>
  `;

  return isPreview ? generateCVContent(profile, template, sections) : content;
}

function getTemplateStyles(template: TemplateType, profile: any): string {
  const baseStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 10px;
      line-height: 1.4;
      color: #333;
      background: #fff;
    }
    @page { size: letter; margin: 0.5in; }
  `;

  switch (template) {
    case 'classic':
      return baseStyles + `
        .cv-container { max-width: 8.5in; margin: 0 auto; padding: 0.3in; }
        .header { text-align: center; border-bottom: 2px solid ${profile.primaryColor}; padding-bottom: 15px; margin-bottom: 15px; }
        .name { font-size: 24px; font-weight: bold; color: ${profile.primaryColor}; margin-bottom: 5px; }
        .title { font-size: 14px; color: #666; margin-bottom: 10px; }
        .contact-info { display: flex; justify-content: center; gap: 20px; font-size: 9px; color: #666; flex-wrap: wrap; }
        .section { margin-bottom: 15px; }
        .section-title { font-size: 12px; font-weight: bold; color: ${profile.primaryColor}; border-bottom: 1px solid ${profile.primaryColor}; padding-bottom: 3px; margin-bottom: 8px; }
        .item { margin-bottom: 8px; }
        .item-title { font-weight: bold; }
        .item-subtitle { color: #666; font-size: 9px; }
        .item-date { color: #888; font-size: 8px; }
        .skills-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-item { display: flex; align-items: center; gap: 5px; }
        .skill-bar { width: 60px; height: 6px; background: #eee; border-radius: 3px; }
        .skill-fill { height: 100%; background: ${profile.primaryColor}; border-radius: 3px; }
      `;
    
    case 'modern':
      return baseStyles + `
        .cv-container { display: flex; min-height: 10in; }
        .sidebar { width: 30%; background: ${profile.primaryColor}; color: #fff; padding: 20px; }
        .main { width: 70%; padding: 20px; }
        .photo { width: 100px; height: 100px; border-radius: 50%; margin: 0 auto 15px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 36px; }
        .name { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 5px; }
        .title { font-size: 11px; text-align: center; opacity: 0.9; margin-bottom: 20px; }
        .sidebar-section { margin-bottom: 20px; }
        .sidebar-title { font-size: 10px; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px; margin-bottom: 10px; }
        .contact-item { margin-bottom: 8px; font-size: 9px; }
        .section { margin-bottom: 15px; }
        .section-title { font-size: 12px; font-weight: bold; color: ${profile.primaryColor}; margin-bottom: 10px; }
        .item { margin-bottom: 10px; }
        .item-title { font-weight: bold; }
        .item-subtitle { color: #666; font-size: 9px; }
        .skill-item { margin-bottom: 8px; }
        .skill-name { display: flex; justify-content: space-between; font-size: 9px; margin-bottom: 2px; }
        .skill-bar { height: 4px; background: #eee; border-radius: 2px; }
        .skill-fill { height: 100%; background: ${profile.primaryColor}; border-radius: 2px; }
      `;
    
    case 'creative':
      return baseStyles + `
        .cv-container { max-width: 8.5in; margin: 0 auto; padding: 0.3in; }
        .header { background: linear-gradient(135deg, ${profile.primaryColor}, ${profile.secondaryColor}); color: #fff; padding: 20px; border-radius: 10px; margin-bottom: 15px; display: flex; gap: 20px; align-items: center; }
        .photo { width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }
        .header-info { flex: 1; }
        .name { font-size: 22px; font-weight: bold; }
        .title { font-size: 12px; opacity: 0.9; margin-bottom: 10px; }
        .contact-line { font-size: 9px; opacity: 0.8; }
        .section { margin-bottom: 15px; }
        .section-title { font-size: 12px; font-weight: bold; color: ${profile.primaryColor}; display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .section-title::after { content: ''; flex: 1; height: 2px; background: linear-gradient(to right, ${profile.primaryColor}, transparent); }
        .timeline { border-left: 2px solid ${profile.primaryColor}; padding-left: 15px; }
        .item { margin-bottom: 10px; position: relative; }
        .item::before { content: ''; position: absolute; left: -19px; top: 4px; width: 8px; height: 8px; border-radius: 50%; background: ${profile.primaryColor}; }
        .item-title { font-weight: bold; }
        .item-subtitle { color: #666; font-size: 9px; }
        .skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .skill-item { text-align: center; }
        .skill-circle { width: 40px; height: 40px; border-radius: 50%; border: 3px solid ${profile.primaryColor}; display: flex; align-items: center; justify-content: center; margin: 0 auto 5px; font-weight: bold; font-size: 10px; }
      `;
    
    case 'minimal':
      return baseStyles + `
        .cv-container { max-width: 8.5in; margin: 0 auto; padding: 0.4in; }
        .header { text-align: center; margin-bottom: 20px; }
        .name { font-size: 28px; font-weight: 300; letter-spacing: 2px; margin-bottom: 5px; }
        .title { font-size: 12px; color: #888; letter-spacing: 1px; margin-bottom: 10px; }
        .contact-line { font-size: 9px; color: #666; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 10px; font-weight: 600; letter-spacing: 2px; color: #333; margin-bottom: 10px; text-transform: uppercase; }
        .item { margin-bottom: 12px; }
        .item-header { display: flex; justify-content: space-between; }
        .item-title { font-weight: 500; }
        .item-date { color: #888; font-size: 9px; }
        .item-subtitle { color: #666; font-size: 9px; margin-top: 2px; }
        .item-desc { color: #444; font-size: 9px; margin-top: 5px; }
        .skills-list { display: flex; flex-wrap: wrap; gap: 5px; }
        .skill-tag { padding: 3px 8px; background: #f0f0f0; border-radius: 3px; font-size: 9px; }
      `;
    
    default:
      return baseStyles;
  }
}

function generateCVContent(profile: any, template: TemplateType, sections: SectionVisibility): string {
  const workExperiences = profile.experiences.filter((e: any) => e.type === 'work');
  const educationExperiences = profile.experiences.filter((e: any) => e.type === 'education');
  const skillsByCategory = profile.skills.reduce((acc: any, skill: any) => {
    const cat = skill.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

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
              <div class="section-title">PERFIL PROFESIONAL</div>
              <p>${profile.bio}</p>
            </div>
          ` : ''}
          
          ${sections.experience && workExperiences.length > 0 ? `
            <div class="section">
              <div class="section-title">EXPERIENCIA LABORAL</div>
              ${workExperiences.map((exp: any) => `
                <div class="item">
                  <div class="item-title">${exp.title}</div>
                  <div class="item-subtitle">${exp.company}${exp.location ? ` • ${exp.location}` : ''}</div>
                  <div class="item-date">${exp.startDate} - ${exp.endDate || 'Presente'}</div>
                  ${exp.description ? `<p style="margin-top: 3px; font-size: 9px;">${exp.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${sections.experience && educationExperiences.length > 0 ? `
            <div class="section">
              <div class="section-title">EDUCACIÓN</div>
              ${educationExperiences.map((exp: any) => `
                <div class="item">
                  <div class="item-title">${exp.title}</div>
                  <div class="item-subtitle">${exp.company}</div>
                  <div class="item-date">${exp.startDate} - ${exp.endDate || 'Presente'}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${sections.skills && profile.skills.length > 0 ? `
            <div class="section">
              <div class="section-title">HABILIDADES</div>
              <div class="skills-grid">
                ${profile.skills.map((skill: any) => `
                  <div class="skill-item">
                    <span style="font-size: 9px; width: 70px;">${skill.name}</span>
                    <div class="skill-bar">
                      <div class="skill-fill" style="width: ${skill.level}%"></div>
                    </div>
                    <span style="font-size: 8px;">${skill.level}%</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${sections.projects && profile.projects.length > 0 ? `
            <div class="section">
              <div class="section-title">PROYECTOS DESTACADOS</div>
              ${profile.projects.slice(0, 3).map((proj: any) => `
                <div class="item">
                  <div class="item-title">${proj.title}</div>
                  ${proj.technologies ? `<div class="item-subtitle">${proj.technologies}</div>` : ''}
                  ${proj.description ? `<p style="font-size: 9px; margin-top: 2px;">${proj.description?.substring(0, 100)}...</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${sections.certificates && profile.certificates.length > 0 ? `
            <div class="section">
              <div class="section-title">CERTIFICACIONES</div>
              ${profile.certificates.map((cert: any) => `
                <div class="item">
                  <div class="item-title">${cert.title}</div>
                  <div class="item-subtitle">${cert.institution || ''} ${cert.issueDate ? `• ${cert.issueDate}` : ''}</div>
                </div>
              `).join('')}
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
                <div class="sidebar-title">CONTACTO</div>
                ${profile.email ? `<div class="contact-item">📧 ${profile.email}</div>` : ''}
                ${profile.phone ? `<div class="contact-item">📱 ${profile.phone}</div>` : ''}
                ${profile.location ? `<div class="contact-item">📍 ${profile.location}</div>` : ''}
              </div>
            ` : ''}
            
            ${sections.skills && profile.skills.length > 0 ? `
              <div class="sidebar-section">
                <div class="sidebar-title">HABILIDADES</div>
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
            
            ${sections.certificates && profile.certificates.length > 0 ? `
              <div class="sidebar-section">
                <div class="sidebar-title">CERTIFICADOS</div>
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
                <div class="section-title">PERFIL</div>
                <p>${profile.bio}</p>
              </div>
            ` : ''}
            
            ${sections.experience && workExperiences.length > 0 ? `
              <div class="section">
                <div class="section-title">EXPERIENCIA</div>
                ${workExperiences.map((exp: any) => `
                  <div class="item">
                    <div class="item-title">${exp.title}</div>
                    <div class="item-subtitle">${exp.company} | ${exp.startDate} - ${exp.endDate || 'Presente'}</div>
                    ${exp.description ? `<p style="font-size: 9px; margin-top: 3px;">${exp.description}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${sections.experience && educationExperiences.length > 0 ? `
              <div class="section">
                <div class="section-title">EDUCACIÓN</div>
                ${educationExperiences.map((exp: any) => `
                  <div class="item">
                    <div class="item-title">${exp.title}</div>
                    <div class="item-subtitle">${exp.company} | ${exp.startDate} - ${exp.endDate || 'Presente'}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${sections.projects && profile.projects.length > 0 ? `
              <div class="section">
                <div class="section-title">PROYECTOS</div>
                ${profile.projects.slice(0, 4).map((proj: any) => `
                  <div class="item">
                    <div class="item-title">${proj.title}</div>
                    <div class="item-subtitle">${proj.technologies || ''}</div>
                    ${proj.description ? `<p style="font-size: 9px; margin-top: 3px;">${proj.description?.substring(0, 80)}...</p>` : ''}
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
              <p>${profile.bio}</p>
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
                    ${exp.description ? `<p style="font-size: 9px; margin-top: 3px;">${exp.description}</p>` : ''}
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
          
          ${sections.skills && profile.skills.length > 0 ? `
            <div class="section">
              <div class="section-title">Habilidades</div>
              <div class="skills-grid">
                ${profile.skills.map((skill: any) => `
                  <div class="skill-item">
                    <div class="skill-circle">${skill.level}%</div>
                    <div style="font-size: 9px;">${skill.name}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${sections.projects && profile.projects.length > 0 ? `
            <div class="section">
              <div class="section-title">Proyectos</div>
              ${profile.projects.slice(0, 3).map((proj: any) => `
                <div class="item" style="border-left: 3px solid ${profile.accentColor}; padding-left: 10px; margin-bottom: 10px;">
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
              <p style="color: #555; text-align: center; font-size: 10px;">${profile.bio}</p>
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
          
          ${sections.skills && profile.skills.length > 0 ? `
            <div class="section">
              <div class="section-title">Habilidades</div>
              <div class="skills-list">
                ${profile.skills.map((skill: any) => `
                  <span class="skill-tag">${skill.name}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${sections.projects && profile.projects.length > 0 ? `
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
          
          ${sections.certificates && profile.certificates.length > 0 ? `
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
