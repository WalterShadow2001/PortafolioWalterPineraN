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

type TemplateType = 'classic' | 'modern' | 'creative' | 'minimal' | 'executive' | 'corporate' | 'elegant' | 'tech';

interface SectionVisibility {
  experience: boolean;
  projects: boolean;
  skills: boolean;
  certificates: boolean;
  contact: boolean;
}

const templates: { id: TemplateType; name: string; preview: string; icon: string }[] = [
  { id: 'classic', name: 'Clásico', preview: 'Tradicional y profesional', icon: '📋' },
  { id: 'modern', name: 'Moderno', preview: 'Barra lateral con color', icon: '🎨' },
  { id: 'creative', name: 'Creativo', preview: 'Gradientes y timeline', icon: '✨' },
  { id: 'minimal', name: 'Minimalista', preview: 'Solo lo esencial', icon: '◻️' },
  { id: 'executive', name: 'Ejecutivo', preview: 'Corporativo y elegante', icon: '👔' },
  { id: 'corporate', name: 'Corporativo', preview: 'Barra lateral delgada', icon: '🏢' },
  { id: 'elegant', name: 'Elegante', preview: 'Refinado y sofisticado', icon: '✒️' },
  { id: 'tech', name: 'Tecnológico', preview: 'Estilo developer', icon: '💻' },
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
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">📄 Generar CV en PDF</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 pt-4">
          {/* Options */}
          <div className="space-y-5">
            {/* Template Selection */}
            <div>
              <h3 className="font-semibold mb-3">Selecciona una Plantilla</h3>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-sm">
                      {template.icon} {template.name}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">{template.preview}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Section Visibility */}
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
                    <Label htmlFor={key} className="cursor-pointer capitalize text-sm">
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

            <p className="text-xs text-gray-400 text-center">
              El CV se ajustará automáticamente a una página carta
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
                  __html: `<style>${getTemplateStyles(selectedTemplate, profile)}</style>${generateCVContent(profile, selectedTemplate, sections)}` 
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
  const autoFitScript = `<script>window.addEventListener('DOMContentLoaded',function(){setTimeout(function(){var cv=document.querySelector('.cv-container');if(!cv)return;var maxH=1056;var h=cv.scrollHeight;if(h>maxH){document.body.style.zoom=(maxH/h).toFixed(4)}},300)})</script>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>CV - ${profile.name}</title><style>${getTemplateStyles(template, profile)}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:letter;margin:0}}</style></head><body>${generateCVContent(profile, template, sections)}${autoFitScript}</body></html>`;
}

function getPhotoStyles(profile: any, size: number = 60, inline: boolean = false): string {
  const s = size;
  const m = inline ? '0' : '0 auto 8px';
  if (profile.photo) {
    return `.photo-circle{width:${s}px;height:${s}px;border-radius:50%;overflow:hidden;margin:${m};border:3px solid ${profile.primaryColor || '#2563eb'}}.photo-circle img{width:100%;height:100%;object-fit:cover}`;
  }
  return `.photo-circle{width:${s}px;height:${s}px;border-radius:50%;background:linear-gradient(135deg,${profile.primaryColor || '#2563eb'},${profile.secondaryColor || '#60a5fa'});display:flex;align-items:center;justify-content:center;margin:${m};color:#fff;font-size:${Math.round(s*0.4)}pt;font-weight:bold;border:3px solid ${profile.primaryColor || '#2563eb'}`;
}

function getPhotoHtml(profile: any): string {
  if (profile.photo) {
    return `<div class="photo-circle"><img src="${profile.photo}" alt="${profile.name}"></div>`;
  }
  return `<div class="photo-circle">${profile.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</div>`;
}

function getTemplateStyles(template: TemplateType, profile: any): string {
  const pc = profile.primaryColor || '#2563eb';
  const sc = profile.secondaryColor || '#60a5fa';
  const ac = profile.accentColor || '#f59e0b';
  const baseStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 8.5pt;
      line-height: 1.3;
      color: #2d2d2d;
      background: #fff;
    }
  `;

  switch (template) {
    case 'classic':
      return baseStyles + getPhotoStyles(profile, 56) + `
        .cv-container { width: 8.5in; min-height: 11in; margin: 0 auto; padding: 0.35in 0.4in; }
        .header { text-align: center; border-bottom: 2px solid ${pc}; padding-bottom: 10px; margin-bottom: 10px; }
        .name { font-size: 18pt; font-weight: 700; color: ${pc}; margin-bottom: 2px; letter-spacing: 0.5px; }
        .title { font-size: 10pt; color: #666; margin-bottom: 6px; }
        .contact-info { display: flex; justify-content: center; gap: 12px; font-size: 8pt; color: #888; flex-wrap: wrap; }
        .section { margin-bottom: 8px; }
        .section-title { font-size: 9pt; font-weight: 700; color: ${pc}; border-bottom: 1px solid ${pc}; padding-bottom: 2px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
        .item { margin-bottom: 5px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-title { font-weight: 700; font-size: 8.5pt; }
        .item-subtitle { color: #666; font-size: 7.5pt; }
        .item-date { color: #999; font-size: 7pt; }
        .item-desc { color: #555; font-size: 7.5pt; margin-top: 1px; }
        .skills-grid { display: flex; flex-wrap: wrap; gap: 4px 12px; }
        .skill-item { display: flex; align-items: center; gap: 4px; }
        .skill-bar { width: 45px; height: 3px; background: #eee; border-radius: 1.5px; }
        .skill-fill { height: 100%; background: ${pc}; border-radius: 1.5px; }
        .cert-item { font-size: 7.5pt; margin-bottom: 2px; }
      `;
    
    case 'modern':
      return baseStyles + getPhotoStyles(profile, 56) + `
        .cv-container { display: flex; width: 8.5in; min-height: 11in; }
        .sidebar { width: 30%; background: ${pc}; color: #fff; padding: 16px 12px; }
        .main { width: 70%; padding: 14px 16px; }
        .name { font-size: 13pt; font-weight: 700; text-align: center; margin-bottom: 2px; letter-spacing: 0.5px; }
        .title { font-size: 8.5pt; text-align: center; opacity: 0.9; margin-bottom: 12px; }
        .sidebar-section { margin-bottom: 10px; }
        .sidebar-title { font-size: 7.5pt; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 3px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
        .contact-item { margin-bottom: 4px; font-size: 8pt; line-height: 1.3; }
        .section { margin-bottom: 8px; }
        .section-title { font-size: 8.5pt; font-weight: 700; color: ${pc}; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 2px; border-bottom: 1.5px solid ${pc}; }
        .item { margin-bottom: 5px; }
        .item-title { font-weight: 700; font-size: 8.5pt; }
        .item-subtitle { color: #666; font-size: 7.5pt; }
        .item-date { color: #999; font-size: 7pt; }
        .item-desc { color: #555; font-size: 7.5pt; margin-top: 1px; }
        .skill-item { margin-bottom: 4px; }
        .skill-name { display: flex; justify-content: space-between; font-size: 7.5pt; margin-bottom: 1px; }
        .skill-bar { height: 3px; background: rgba(255,255,255,0.3); border-radius: 1.5px; }
        .skill-fill { height: 100%; background: #fff; border-radius: 1.5px; }
      `;
    
    case 'creative':
      return baseStyles + getPhotoStyles(profile, 50, true) + `
        .cv-container { width: 8.5in; min-height: 11in; padding: 0.3in; }
        .header { background: linear-gradient(135deg, ${pc}, ${sc}); color: #fff; padding: 14px 18px; border-radius: 6px; margin-bottom: 10px; display: flex; gap: 12px; align-items: center; }
        .header-info { flex: 1; }
        .name { font-size: 15pt; font-weight: 700; }
        .title { font-size: 9pt; opacity: 0.9; margin-bottom: 3px; }
        .contact-line { font-size: 7.5pt; opacity: 0.8; }
        .section { margin-bottom: 8px; }
        .section-title { font-size: 8.5pt; font-weight: 700; color: ${pc}; display: flex; align-items: center; gap: 6px; margin-bottom: 5px; }
        .section-title::after { content: ''; flex: 1; height: 1.5px; background: linear-gradient(to right, ${pc}, transparent); }
        .timeline { border-left: 2px solid ${pc}; padding-left: 10px; }
        .item { margin-bottom: 5px; position: relative; }
        .item::before { content: ''; position: absolute; left: -14px; top: 3px; width: 5px; height: 5px; border-radius: 50%; background: ${pc}; }
        .item-title { font-weight: 700; font-size: 8.5pt; }
        .item-subtitle { color: #666; font-size: 7.5pt; }
        .item-desc { color: #555; font-size: 7.5pt; margin-top: 1px; }
        .skills-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; }
        .skill-item { text-align: center; }
        .skill-circle { width: 30px; height: 30px; border-radius: 50%; border: 2px solid ${pc}; display: flex; align-items: center; justify-content: center; margin: 0 auto 2px; font-weight: 700; font-size: 8pt; color: ${pc}; }
        .skill-name { font-size: 7pt; }
      `;
    
    case 'minimal':
      return baseStyles + getPhotoStyles(profile, 50) + `
        .cv-container { width: 8.5in; min-height: 11in; margin: 0 auto; padding: 0.4in 0.45in; }
        .header { text-align: center; margin-bottom: 14px; }
        .name { font-size: 20pt; font-weight: 300; letter-spacing: 3px; margin-bottom: 3px; text-transform: uppercase; color: #222; }
        .title { font-size: 9pt; color: #888; letter-spacing: 2px; margin-bottom: 6px; text-transform: uppercase; }
        .contact-line { font-size: 8pt; color: #666; }
        .section { margin-bottom: 10px; }
        .section-title { font-size: 8pt; font-weight: 600; letter-spacing: 2px; color: #333; margin-bottom: 6px; text-transform: uppercase; border-bottom: 1px solid #e0e0e0; padding-bottom: 3px; }
        .item { margin-bottom: 7px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-title { font-weight: 500; font-size: 8.5pt; }
        .item-date { color: #999; font-size: 7.5pt; }
        .item-subtitle { color: #777; font-size: 7.5pt; margin-top: 1px; }
        .item-desc { color: #555; font-size: 7.5pt; margin-top: 2px; }
        .skills-list { display: flex; flex-wrap: wrap; gap: 4px; }
        .skill-tag { padding: 2px 7px; background: #f5f5f5; border-radius: 2px; font-size: 7.5pt; color: #555; }
      `;
    
    case 'executive':
      return baseStyles + getPhotoStyles(profile, 44, true) + `
        .cv-container { width: 8.5in; min-height: 11in; }
        .header-band { background: ${pc}; color: #fff; padding: 14px 20px; display: flex; align-items: center; gap: 14px; }
        .header-text { flex: 1; }
        .name { font-size: 16pt; font-weight: 700; letter-spacing: 0.5px; }
        .title { font-size: 9pt; opacity: 0.9; margin-top: 1px; }
        .contact-row { display: flex; gap: 12px; font-size: 7pt; opacity: 0.85; margin-top: 3px; flex-wrap: wrap; }
        .body-cols { display: flex; padding: 12px 16px; gap: 14px; }
        .col-left { flex: 2; }
        .col-right { flex: 1; border-left: 1px solid #e8e8e8; padding-left: 14px; }
        .section { margin-bottom: 8px; }
        .section-title { font-size: 8pt; font-weight: 700; color: ${pc}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; padding-bottom: 2px; border-bottom: 1px solid ${pc}30; }
        .item { margin-bottom: 5px; }
        .item-title { font-weight: 700; font-size: 8.5pt; }
        .item-subtitle { color: #666; font-size: 7.5pt; }
        .item-date { color: #999; font-size: 7pt; }
        .item-desc { color: #555; font-size: 7.5pt; margin-top: 1px; }
        .skill-item { margin-bottom: 3px; }
        .skill-name { font-size: 7.5pt; margin-bottom: 1px; display: flex; justify-content: space-between; }
        .skill-bar { height: 3px; background: #eee; border-radius: 1.5px; }
        .skill-fill { height: 100%; background: ${pc}; border-radius: 1.5px; }
        .cert-item { font-size: 7.5pt; margin-bottom: 3px; }
        .cert-item strong { display: block; }
      `;
    
    case 'corporate':
      return baseStyles + getPhotoStyles(profile, 48) + `
        .cv-container { width: 8.5in; min-height: 11in; border-left: 4px solid ${pc}; padding: 16px 20px; }
        .header { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e8e8e8; }
        .header-main { flex: 1; }
        .name { font-size: 16pt; font-weight: 700; color: ${pc}; margin-bottom: 1px; }
        .title { font-size: 9pt; color: #666; margin-bottom: 3px; }
        .contact-info { display: flex; gap: 10px; font-size: 7.5pt; color: #888; flex-wrap: wrap; }
        .section { margin-bottom: 8px; }
        .section-title { font-size: 8pt; font-weight: 700; color: ${pc}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; padding-left: 8px; border-left: 3px solid ${pc}; }
        .item { margin-bottom: 5px; padding-left: 8px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-title { font-weight: 700; font-size: 8.5pt; }
        .item-date { color: #999; font-size: 7pt; }
        .item-subtitle { color: #666; font-size: 7.5pt; }
        .item-desc { color: #555; font-size: 7.5pt; margin-top: 1px; }
        .skills-grid { display: flex; flex-wrap: wrap; gap: 4px; }
        .skill-tag { padding: 2px 6px; background: ${pc}12; border: 1px solid ${pc}30; border-radius: 2px; font-size: 7.5pt; color: ${pc}; }
        .cert-item { font-size: 7.5pt; margin-bottom: 2px; }
      `;
    
    case 'elegant':
      return baseStyles + getPhotoStyles(profile, 52) + `
        .cv-container { width: 8.5in; min-height: 11in; padding: 0.3in; border: 2px double ${pc}20; margin: 0; }
        .inner { border: 1px solid ${pc}15; padding: 14px 18px; min-height: calc(11in - 0.6in); }
        .header { text-align: center; margin-bottom: 10px; }
        .name { font-size: 18pt; font-weight: 300; color: #333; letter-spacing: 4px; text-transform: uppercase; }
        .name-line { display: flex; align-items: center; gap: 8px; margin: 4px auto 6px; max-width: 60%; }
        .name-line::before, .name-line::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to right, transparent, ${pc}60, transparent); }
        .name-line span { color: ${pc}; font-size: 6pt; }
        .title { font-size: 9pt; color: #777; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 6px; }
        .contact-line { font-size: 7.5pt; color: #888; }
        .section { margin-bottom: 8px; }
        .section-title { font-size: 7.5pt; font-weight: 600; letter-spacing: 2px; color: ${pc}; text-transform: uppercase; text-align: center; margin-bottom: 5px; }
        .section-title::before, .section-title::after { content: ' \\00B7  '; color: ${pc}50; }
        .section-divider { height: 1px; background: linear-gradient(to right, transparent, ${pc}30, transparent); margin: 0 auto 5px; max-width: 80%; }
        .item { margin-bottom: 5px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-title { font-weight: 600; font-size: 8.5pt; color: #333; }
        .item-date { color: #999; font-size: 7pt; font-style: italic; }
        .item-subtitle { color: #777; font-size: 7.5pt; font-style: italic; }
        .item-desc { color: #555; font-size: 7.5pt; margin-top: 1px; }
        .skills-list { display: flex; flex-wrap: wrap; justify-content: center; gap: 5px; }
        .skill-tag { padding: 2px 8px; border: 1px solid ${pc}40; border-radius: 10px; font-size: 7pt; color: ${pc}; background: ${pc}08; }
      `;
    
    case 'tech':
      return baseStyles + getPhotoStyles(profile, 42, true) + `
        .cv-container { width: 8.5in; min-height: 11in; background: #fafbfc; }
        .header { background: #1a1a2e; color: #e0e0e0; padding: 12px 18px; display: flex; align-items: center; gap: 12px; }
        .header-info { flex: 1; }
        .name { font-size: 14pt; font-weight: 700; color: #00d4ff; letter-spacing: 1px; }
        .name::before { content: '> '; color: #00d4ff60; }
        .title { font-size: 8.5pt; color: #a0a0b0; margin-top: 1px; }
        .contact-line { font-size: 7pt; color: #808090; display: flex; gap: 8px; flex-wrap: wrap; margin-top: 2px; }
        .section { margin-bottom: 7px; padding: 0 14px; }
        .section-title { font-size: 8pt; font-weight: 700; color: #1a1a2e; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; padding-bottom: 2px; border-bottom: 2px solid #00d4ff; display: flex; align-items: center; gap: 6px; }
        .section-title::before { content: '//'; color: #00d4ff80; font-family: 'Courier New', monospace; }
        .item { margin-bottom: 4px; border-left: 2px solid #00d4ff30; padding-left: 8px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-title { font-weight: 700; font-size: 8.5pt; color: #1a1a2e; }
        .item-date { color: #999; font-size: 7pt; font-family: 'Courier New', monospace; }
        .item-subtitle { color: #666; font-size: 7.5pt; }
        .item-desc { color: #555; font-size: 7.5pt; margin-top: 1px; }
        .skills-grid { display: flex; flex-wrap: wrap; gap: 3px; }
        .skill-tag { padding: 2px 6px; background: #1a1a2e; color: #00d4ff; border-radius: 2px; font-size: 7pt; font-family: 'Courier New', monospace; }
        .cert-item { font-size: 7.5pt; margin-bottom: 2px; font-family: 'Courier New', monospace; }
      `;
    
    default:
      return baseStyles;
  }
}

function generateCVContent(profile: any, template: TemplateType, sections: SectionVisibility): string {
  const work = profile.experiences?.filter((e: any) => e.type === 'work') || [];
  const edu = profile.experiences?.filter((e: any) => e.type === 'education') || [];
  const ph = getPhotoHtml(profile);
  const pc = profile.primaryColor || '#2563eb';

  const contactHtml = (style: 'sidebar' | 'row' | 'inline' = 'sidebar') => {
    const items = [
      profile.email ? `📧 ${profile.email}` : '',
      profile.phone ? `📱 ${profile.phone}` : '',
      profile.location ? `📍 ${profile.location}` : '',
      profile.website ? `🌐 ${profile.website}` : '',
    ].filter(Boolean);
    if (style === 'row') return `<div class="contact-info">${items.join('')}</div>`;
    if (style === 'inline') return `<div class="contact-line">${items.join(' &bull; ')}</div>`;
    return items.map(i => `<div class="contact-item">${i}</div>`).join('');
  };

  const workHtml = (showDesc: boolean = true) => work.map((e: any) => `<div class="item"><div class="item-header"><div class="item-title">${e.title}</div><div class="item-date">${e.startDate} - ${e.endDate || 'Presente'}</div></div><div class="item-subtitle">${e.company}${e.location ? ` · ${e.location}` : ''}</div>${showDesc && e.description ? `<div class="item-desc">${e.description}</div>` : ''}</div>`).join('');

  const eduHtml = () => edu.map((e: any) => `<div class="item"><div class="item-header"><div class="item-title">${e.title}</div><div class="item-date">${e.startDate} - ${e.endDate || 'Presente'}</div></div><div class="item-subtitle">${e.company}</div></div>`).join('');

  const projHtml = (max: number = 3) => (profile.projects || []).slice(0, max).map((p: any) => `<div class="item"><div class="item-title">${p.title}</div>${p.technologies ? `<div class="item-subtitle">${p.technologies}</div>` : ''}</div>`).join('');

  const certHtml = (style: 'normal' | 'tag' | 'simple' = 'normal') => {
    const certs = profile.certificates || [];
    if (style === 'tag') return `<div class="skills-list">${certs.map((c: any) => `<span class="skill-tag">${c.title}</span>`).join('')}</div>`;
    if (style === 'simple') return certs.map((c: any) => `<div class="cert-item"><strong>${c.title}</strong> ${c.institution ? `- ${c.institution}` : ''} ${c.issueDate ? `(${c.issueDate})` : ''}</div>`).join('');
    return certs.map((c: any) => `<div class="item"><div class="item-title">${c.title}</div><div class="item-subtitle">${c.institution || ''} ${c.issueDate ? `· ${c.issueDate}` : ''}</div></div>`).join('');
  };

  switch (template) {
    case 'classic':
      return `
        <div class="cv-container">
          <div class="header">${ph}<div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-info">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div>
          ${profile.bio ? `<div class="section"><div class="section-title">Perfil Profesional</div><p style="font-size:8pt;color:#555">${profile.bio}</p></div>` : ''}
          ${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia Laboral</div>${workHtml()}</div>` : ''}
          ${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}
          ${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="skills-grid">${profile.skills.map((s: any) => `<div class="skill-item"><span style="font-size:7.5pt;width:70px">${s.name}</span><div class="skill-bar"><div class="skill-fill" style="width:${s.level}%"></div></div><span style="font-size:7pt;color:#888">${s.level}%</span></div>`).join('')}</div></div>` : ''}
          ${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos Destacados</div>${projHtml(3)}</div>` : ''}
          ${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificaciones</div>${certHtml('normal')}</div>` : ''}
        </div>
      `;

    case 'modern':
      return `
        <div class="cv-container">
          <div class="sidebar">${ph}<div class="name">${profile.name}</div><div class="title">${profile.title}</div>
            ${sections.contact ? `<div class="sidebar-section"><div class="sidebar-title">Contacto</div>${contactHtml()}</div>` : ''}
            ${sections.skills && profile.skills?.length ? `<div class="sidebar-section"><div class="sidebar-title">Habilidades</div>${profile.skills.map((s: any) => `<div class="skill-item"><div class="skill-name"><span>${s.name}</span><span>${s.level}%</span></div><div class="skill-bar"><div class="skill-fill" style="width:${s.level}%"></div></div></div>`).join('')}</div>` : ''}
            ${sections.certificates && profile.certificates?.length ? `<div class="sidebar-section"><div class="sidebar-title">Certificados</div>${certHtml('simple')}</div>` : ''}
          </div>
          <div class="main">
            ${profile.bio ? `<div class="section"><div class="section-title">Perfil</div><p style="font-size:8pt;color:#555">${profile.bio}</p></div>` : ''}
            ${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div>${workHtml()}</div>` : ''}
            ${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}
            ${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(4)}</div>` : ''}
          </div>
        </div>
      `;

    case 'creative':
      return `
        <div class="cv-container">
          <div class="header">${ph}<div class="header-info"><div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-line">${[profile.email, profile.phone, profile.location].filter(Boolean).join(' · ')}</div>` : ''}</div></div>
          ${profile.bio ? `<div class="section"><p style="font-size:8pt;color:#555;text-align:center">${profile.bio}</p></div>` : ''}
          ${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div><div class="timeline">${work.map((e: any) => `<div class="item"><div class="item-title">${e.title}</div><div class="item-subtitle">${e.company} · ${e.startDate} - ${e.endDate || 'Presente'}</div></div>`).join('')}</div></div>` : ''}
          ${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div><div class="timeline">${edu.map((e: any) => `<div class="item"><div class="item-title">${e.title}</div><div class="item-subtitle">${e.company} · ${e.startDate} - ${e.endDate || 'Presente'}</div></div>`).join('')}</div></div>` : ''}
          ${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="skills-grid">${profile.skills.map((s: any) => `<div class="skill-item"><div class="skill-circle">${s.level}%</div><div class="skill-name">${s.name}</div></div>`).join('')}</div></div>` : ''}
          ${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(3)}</div>` : ''}
          ${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificados</div>${certHtml('tag')}</div>` : ''}
        </div>
      `;

    case 'minimal':
      return `
        <div class="cv-container">
          <div class="header">${ph}<div class="name">${profile.name.toUpperCase()}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-line">${[profile.email, profile.phone, profile.location].filter(Boolean).join(' &middot; ')}</div>` : ''}</div>
          ${profile.bio ? `<div class="section"><p style="color:#555;text-align:center;font-size:8.5pt">${profile.bio}</p></div>` : ''}
          ${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div>${workHtml()}</div>` : ''}
          ${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}
          ${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="skills-list">${profile.skills.map((s: any) => `<span class="skill-tag">${s.name}</span>`).join('')}</div></div>` : ''}
          ${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(3)}</div>` : ''}
          ${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificaciones</div>${certHtml('tag')}</div>` : ''}
        </div>
      `;

    case 'executive':
      return `
        <div class="cv-container">
          <div class="header-band">${ph}<div class="header-text"><div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-row">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div></div>
          <div class="body-cols">
            <div class="col-left">
              ${profile.bio ? `<div class="section"><div class="section-title">Perfil Profesional</div><p style="font-size:7.5pt;color:#555">${profile.bio}</p></div>` : ''}
              ${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div>${workHtml()}</div>` : ''}
              ${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}
              ${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(3)}</div>` : ''}
            </div>
            <div class="col-right">
              ${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div>${profile.skills.map((s: any) => `<div class="skill-item"><div class="skill-name"><span>${s.name}</span><span>${s.level}%</span></div><div class="skill-bar"><div class="skill-fill" style="width:${s.level}%"></div></div></div>`).join('')}</div>` : ''}
              ${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificados</div>${certHtml('simple')}</div>` : ''}
            </div>
          </div>
        </div>
      `;

    case 'corporate':
      return `
        <div class="cv-container">
          <div class="header">${ph}<div class="header-main"><div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-info">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div></div>
          ${profile.bio ? `<div class="section"><div class="section-title">Perfil Profesional</div><p style="font-size:7.5pt;color:#555">${profile.bio}</p></div>` : ''}
          ${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia Laboral</div>${workHtml()}</div>` : ''}
          ${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}
          ${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="skills-grid">${profile.skills.map((s: any) => `<span class="skill-tag">${s.name}</span>`).join('')}</div></div>` : ''}
          ${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(3)}</div>` : ''}
          ${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificaciones</div>${certHtml('simple')}</div>` : ''}
        </div>
      `;

    case 'elegant':
      return `
        <div class="cv-container"><div class="inner">
          <div class="header"><div class="name">${profile.name.toUpperCase()}</div><div class="name-line"><span>&#9670;</span></div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-line">${[profile.email, profile.phone, profile.location].filter(Boolean).join(' &middot; ')}</div>` : ''}</div>
          ${profile.bio ? `<div class="section"><div class="section-divider"></div><p style="font-size:8pt;color:#555;text-align:center;font-style:italic">${profile.bio}</p></div>` : ''}
          ${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div><div class="section-divider"></div>${workHtml()}</div>` : ''}
          ${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div><div class="section-divider"></div>${eduHtml()}</div>` : ''}
          ${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="section-divider"></div><div class="skills-list">${profile.skills.map((s: any) => `<span class="skill-tag">${s.name}</span>`).join('')}</div></div>` : ''}
          ${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div><div class="section-divider"></div>${projHtml(3)}</div>` : ''}
          ${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificaciones</div><div class="section-divider"></div>${certHtml('tag')}</div>` : ''}
        </div></div>
      `;

    case 'tech':
      return `
        <div class="cv-container">
          <div class="header">${ph}<div class="header-info"><div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-line">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div></div>
          ${profile.bio ? `<div class="section"><div class="section-title">about()</div><p style="font-size:7.5pt;color:#555">${profile.bio}</p></div>` : ''}
          ${sections.experience && work.length ? `<div class="section"><div class="section-title">experience()</div>${workHtml()}</div>` : ''}
          ${sections.experience && edu.length ? `<div class="section"><div class="section-title">education()</div>${eduHtml()}</div>` : ''}
          ${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">skills()</div><div class="skills-grid">${profile.skills.map((s: any) => `<span class="skill-tag">${s.name}</span>`).join('')}</div></div>` : ''}
          ${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">projects()</div>${projHtml(4)}</div>` : ''}
          ${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">certifications()</div>${certHtml('simple')}</div>` : ''}
        </div>
      `;

    default:
      return '';
  }
}
