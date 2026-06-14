'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileDown, Palette, Eye, ZoomIn, ZoomOut, RotateCcw,
  Check, Sparkles, Layout, Type, Maximize2
} from 'lucide-react';
// Using browser print for PDF generation - most reliable single-page solution

type TemplateType = 'classic' | 'modern' | 'creative' | 'minimal' | 'executive' | 'corporate' | 'elegant' | 'tech' | 'infographic' | 'bold' | 'compact' | 'professional';

interface SectionVisibility {
  experience: boolean;
  projects: boolean;
  skills: boolean;
  certificates: boolean;
  contact: boolean;
}

interface ColorOverrides {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
}

const templates: { id: TemplateType; name: string; icon: string; category: string }[] = [
  { id: 'classic', name: 'Clásico', icon: '📋', category: 'Profesional' },
  { id: 'modern', name: 'Moderno', icon: '🎨', category: 'Profesional' },
  { id: 'executive', name: 'Ejecutivo', icon: '👔', category: 'Profesional' },
  { id: 'corporate', name: 'Corporativo', icon: '🏢', category: 'Profesional' },
  { id: 'creative', name: 'Creativo', icon: '✨', category: 'Creativo' },
  { id: 'elegant', name: 'Elegante', icon: '✒️', category: 'Creativo' },
  { id: 'infographic', name: 'Infografía', icon: '📊', category: 'Creativo' },
  { id: 'bold', name: 'Audaz', icon: '🔥', category: 'Creativo' },
  { id: 'minimal', name: 'Minimalista', icon: '◻️', category: 'Minimalista' },
  { id: 'tech', name: 'Tecnológico', icon: '💻', category: 'Minimalista' },
  { id: 'compact', name: 'Compacto', icon: '📝', category: 'Minimalista' },
  { id: 'professional', name: 'Profesional+', icon: '💼', category: 'Minimalista' },
];

interface PDFCanvasEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: any;
}

export function PDFCanvasEditor({ open, onOpenChange, profile }: PDFCanvasEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('classic');
  const [sections, setSections] = useState<SectionVisibility>({
    experience: true,
    projects: true,
    skills: true,
    certificates: true,
    contact: true,
  });
  const [colorOverrides, setColorOverrides] = useState<ColorOverrides>({
    primary: profile?.primaryColor || '#2563eb',
    secondary: profile?.secondaryColor || '#60a5fa',
    accent: profile?.accentColor || '#f59e0b',
    text: '#2d2d2d',
  });
  const [activeTab, setActiveTab] = useState<'templates' | 'sections' | 'colors'>('templates');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.52);
  const [fitStatus, setFitStatus] = useState<'checking' | 'fits' | 'overflow' | 'adjusted'>('checking');
  const previewRef = useRef<HTMLDivElement>(null);
  const renderRef = useRef<HTMLDivElement>(null);

  // Update color overrides when profile changes
  useEffect(() => {
    if (profile) {
      setColorOverrides({
        primary: profile.primaryColor || '#2563eb',
        secondary: profile.secondaryColor || '#60a5fa',
        accent: profile.accentColor || '#f59e0b',
        text: '#2d2d2d',
      });
    }
  }, [profile?.primaryColor, profile?.secondaryColor, profile?.accentColor]);

  // Check fit status whenever template/sections/colors change
  useEffect(() => {
    setFitStatus('checking');
    const timer = setTimeout(() => {
      if (renderRef.current) {
        const h = renderRef.current.scrollHeight;
        const maxH = 1056; // 11 inches at 96dpi
        if (h <= maxH) {
          setFitStatus('fits');
        } else if (h <= maxH * 1.15) {
          setFitStatus('adjusted');
        } else {
          setFitStatus('overflow');
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedTemplate, sections, colorOverrides]);

  // Create a modified profile with color overrides
  const modifiedProfile = {
    ...profile,
    primaryColor: colorOverrides.primary,
    secondaryColor: colorOverrides.secondary,
    accentColor: colorOverrides.accent,
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styles = getTemplateStyles(selectedTemplate, modifiedProfile);
    const content = generateCVContent(modifiedProfile, selectedTemplate, sections, colorOverrides);
    const maxH = 1056;

    const autoFitScript = `
      <script>
        (function(){
          function fit(){
            var cv = document.querySelector('.cv-container');
            if(!cv) return;
            var h = cv.scrollHeight;
            var maxH = ${maxH};
            if(h > maxH){
              var zoom = (maxH / h).toFixed(4);
              document.body.style.zoom = zoom;
            }
          }
          window.addEventListener('DOMContentLoaded', function(){ setTimeout(fit, 200); setTimeout(fit, 600); });
          window.addEventListener('load', function(){ setTimeout(fit, 300); });
        })();
      </script>
    `;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>CV - ${profile?.name}</title><style>${styles}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:letter;margin:0}}</style></head><body>${content}${autoFitScript}</body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 600);
  };

  const resetColors = () => {
    setColorOverrides({
      primary: profile?.primaryColor || '#2563eb',
      secondary: profile?.secondaryColor || '#60a5fa',
      accent: profile?.accentColor || '#f59e0b',
      text: '#2d2d2d',
    });
  };

  const zoomIn = () => setPreviewScale(s => Math.min(s + 0.05, 0.8));
  const zoomOut = () => setPreviewScale(s => Math.max(s - 0.05, 0.3));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden" showCloseButton={true}>
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-gray-100">
          <DialogTitle className="text-lg flex items-center gap-2">
            <Layout size={20} className="text-blue-600" />
            Generador de CV Inteligente
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[calc(95vh-80px)]">
          {/* Left Sidebar - Controls */}
          <div className="w-[320px] border-r border-gray-100 flex flex-col bg-gray-50/50">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 bg-white">
              {[
                { id: 'templates' as const, icon: Layout, label: 'Plantillas' },
                { id: 'sections' as const, icon: Type, label: 'Secciones' },
                { id: 'colors' as const, icon: Palette, label: 'Colores' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-2 text-xs font-medium flex flex-col items-center gap-1 transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'templates' && (
                <div className="space-y-4">
                  {['Profesional', 'Creativo', 'Minimalista'].map(category => (
                    <div key={category}>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{category}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {templates.filter(t => t.category === category).map(template => (
                          <button
                            key={template.id}
                            onClick={() => setSelectedTemplate(template.id)}
                            className={`p-2.5 rounded-lg border text-left transition-all group ${
                              selectedTemplate === template.id
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-sm'
                                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                            }`}
                          >
                            <span className="text-base">{template.icon}</span>
                            <p className={`text-xs font-medium mt-1 ${
                              selectedTemplate === template.id ? 'text-blue-700' : 'text-gray-700'
                            }`}>{template.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'sections' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 mb-4">Selecciona las secciones que aparecerán en tu CV</p>
                  {[
                    { key: 'experience', label: 'Experiencia y Educación', icon: '💼' },
                    { key: 'projects', label: 'Proyectos', icon: '📁' },
                    { key: 'skills', label: 'Habilidades', icon: '💻' },
                    { key: 'certificates', label: 'Certificados', icon: '🏆' },
                    { key: 'contact', label: 'Contacto', icon: '📧' },
                  ].map(item => (
                    <div key={item.key} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      sections[item.key as keyof SectionVisibility]
                        ? 'border-blue-200 bg-blue-50/50'
                        : 'border-gray-200 bg-white'
                    }`}>
                      <Checkbox
                        id={`sec-${item.key}`}
                        checked={sections[item.key as keyof SectionVisibility]}
                        onCheckedChange={(checked) =>
                          setSections({ ...sections, [item.key]: checked as boolean })
                        }
                      />
                      <Label htmlFor={`sec-${item.key}`} className="cursor-pointer flex items-center gap-2 text-sm flex-1">
                        <span>{item.icon}</span>
                        <span className={sections[item.key as keyof SectionVisibility] ? 'text-gray-800' : 'text-gray-400'}>
                          {item.label}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'colors' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500">Personaliza los colores del CV</p>
                    <button
                      onClick={resetColors}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <RotateCcw size={10} /> Reset
                    </button>
                  </div>
                  {[
                    { key: 'primary', label: 'Color Principal', desc: 'Títulos y acentos' },
                    { key: 'secondary', label: 'Color Secundario', desc: 'Barras y detalles' },
                    { key: 'accent', label: 'Color Acento', desc: 'Resaltados' },
                    { key: 'text', label: 'Color de Texto', desc: 'Texto principal' },
                  ].map(item => (
                    <div key={item.key} className="p-3 rounded-lg border border-gray-200 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{item.label}</p>
                          <p className="text-xs text-gray-400">{item.desc}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-500">
                            {colorOverrides[item.key as keyof ColorOverrides]}
                          </span>
                          <label className="w-8 h-8 rounded-lg border-2 border-gray-200 overflow-hidden cursor-pointer hover:border-blue-400 transition-colors relative">
                            <input
                              type="color"
                              value={colorOverrides[item.key as keyof ColorOverrides]}
                              onChange={(e) => setColorOverrides({ ...colorOverrides, [item.key]: e.target.value })}
                              className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                            />
                            <div
                              className="w-full h-full"
                              style={{ backgroundColor: colorOverrides[item.key as keyof ColorOverrides] }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Quick Color Presets */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Paletas rápidas</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { primary: '#2563eb', secondary: '#60a5fa', accent: '#f59e0b', text: '#1f2937', name: 'Azul' },
                        { primary: '#059669', secondary: '#34d399', accent: '#fbbf24', text: '#1f2937', name: 'Verde' },
                        { primary: '#dc2626', secondary: '#f87171', accent: '#fbbf24', text: '#1f2937', name: 'Rojo' },
                        { primary: '#7c3aed', secondary: '#a78bfa', accent: '#f472b6', text: '#1f2937', name: 'Violeta' },
                        { primary: '#1a1a2e', secondary: '#16213e', accent: '#00d4ff', text: '#2d2d2d', name: 'Tech' },
                        { primary: '#d97706', secondary: '#fbbf24', accent: '#92400e', text: '#1f2937', name: 'Dorado' },
                        { primary: '#0f766e', secondary: '#2dd4bf', accent: '#f97316', text: '#1f2937', name: 'Teal' },
                        { primary: '#be185d', secondary: '#f472b6', accent: '#9333ea', text: '#1f2937', name: 'Rosa' },
                      ].map(preset => (
                        <button
                          key={preset.name}
                          onClick={() => setColorOverrides({ primary: preset.primary, secondary: preset.secondary, accent: preset.accent, text: preset.text })}
                          className="group relative"
                          title={preset.name}
                        >
                          <div className="h-10 rounded-lg border border-gray-200 overflow-hidden hover:border-blue-400 transition-colors hover:shadow-sm">
                            <div className="flex h-full">
                              <div className="flex-1" style={{ backgroundColor: preset.primary }} />
                              <div className="flex-1" style={{ backgroundColor: preset.secondary }} />
                              <div className="w-2" style={{ backgroundColor: preset.accent }} />
                            </div>
                          </div>
                          <span className="text-[9px] text-gray-500 group-hover:text-gray-700 text-center block mt-0.5">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Area */}
            <div className="p-4 border-t border-gray-200 bg-white space-y-3">
              {/* Fit Status Indicator */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                fitStatus === 'fits' ? 'bg-green-50 text-green-700' :
                fitStatus === 'adjusted' ? 'bg-yellow-50 text-yellow-700' :
                fitStatus === 'overflow' ? 'bg-red-50 text-red-700' :
                'bg-gray-50 text-gray-500'
              }`}>
                {fitStatus === 'fits' && <><Check size={14} /> Ajustado a una página</>}
                {fitStatus === 'adjusted' && <><Sparkles size={14} /> Se ajustará automáticamente</>}
                {fitStatus === 'overflow' && <><Maximize2 size={14} /> Se ajustará al imprimir</>}
                {fitStatus === 'checking' && <span className="animate-pulse">Verificando...</span>}
              </div>

              {/* Print Button */}
              <Button
                onClick={() => { setIsGenerating(true); handlePrint(); setTimeout(() => setIsGenerating(false), 1000); }}
                disabled={isGenerating}
                className="w-full gap-2 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                style={{
                  background: `linear-gradient(135deg, ${colorOverrides.primary}, ${colorOverrides.secondary})`,
                  color: 'white'
                }}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Abriendo impresión...
                  </>
                ) : (
                  <>
                    <FileDown size={18} />
                    Imprimir CV en PDF
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-400 text-center">
                En el diálogo de impresión selecciona "Guardar como PDF"
              </p>
            </div>
          </div>

          {/* Right Area - Canvas Preview */}
          <div className="flex-1 flex flex-col bg-gray-100">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Eye size={14} />
                <span>Vista Previa</span>
                <span className="text-xs text-gray-400">Carta (8.5" × 11")</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={zoomOut} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
                  <ZoomOut size={14} />
                </button>
                <span className="text-xs text-gray-500 w-12 text-center">{Math.round(previewScale * 100)}%</span>
                <button onClick={zoomIn} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>

            {/* Canvas Preview Area */}
            <div className="flex-1 overflow-auto flex justify-center p-6">
              <div className="relative" style={{ width: 816 * previewScale, height: 1056 * previewScale }}>
                {/* Letter-size shadow */}
                <div
                  className="absolute rounded shadow-2xl bg-white"
                  style={{ width: 816, height: 1056, transform: `scale(${previewScale})`, transformOrigin: 'top left' }}
                >
                  {/* Hidden render container at full size for PDF generation */}
                  <div
                    ref={renderRef}
                    className="cv-render-container"
                    style={{ width: 816, height: 'auto', overflow: 'hidden' }}
                    dangerouslySetInnerHTML={{
                      __html: `<style>${getTemplateStyles(selectedTemplate, modifiedProfile, colorOverrides)}</style>${generateCVContent(modifiedProfile, selectedTemplate, sections, colorOverrides)}`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===================== STYLES =====================

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

function getTemplateStyles(template: TemplateType, profile: any, colorOverrides?: ColorOverrides): string {
  const pc = colorOverrides?.primary || profile.primaryColor || '#2563eb';
  const sc = colorOverrides?.secondary || profile.secondaryColor || '#60a5fa';
  const ac = colorOverrides?.accent || profile.accentColor || '#f59e0b';
  const tc = colorOverrides?.text || '#2d2d2d';

  const baseStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 8.5pt; line-height: 1.3; color: ${tc}; background: #fff; }
    .cv-container { color: ${tc}; }
  `;

  switch (template) {
    case 'classic':
      return baseStyles + getPhotoStyles(profile, 56) + `
        .cv-container { width: 816px; padding: 28px 32px; }
        .header { text-align: center; border-bottom: 2px solid ${pc}; padding-bottom: 10px; margin-bottom: 10px; }
        .name { font-size: 18pt; font-weight: 700; color: ${pc}; margin-bottom: 2px; letter-spacing: 0.5px; }
        .title { font-size: 10pt; color: ${tc}; opacity: 0.7; margin-bottom: 6px; }
        .contact-info { display: flex; justify-content: center; gap: 12px; font-size: 8pt; color: ${tc}; opacity: 0.6; flex-wrap: wrap; }
        .section { margin-bottom: 8px; }
        .section-title { font-size: 9pt; font-weight: 700; color: ${pc}; border-bottom: 1px solid ${pc}; padding-bottom: 2px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
        .item { margin-bottom: 5px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-title { font-weight: 700; font-size: 8.5pt; color: ${tc}; }
        .item-subtitle { color: ${tc}; opacity: 0.6; font-size: 7.5pt; }
        .item-date { color: ${tc}; opacity: 0.5; font-size: 7pt; }
        .item-desc { color: ${tc}; opacity: 0.7; font-size: 7.5pt; margin-top: 1px; }
        .skills-grid { display: flex; flex-wrap: wrap; gap: 4px 12px; }
        .skill-item { display: flex; align-items: center; gap: 4px; }
        .skill-bar { width: 45px; height: 3px; background: ${sc}30; border-radius: 1.5px; }
        .skill-fill { height: 100%; background: ${pc}; border-radius: 1.5px; }
        .cert-item { font-size: 7.5pt; margin-bottom: 2px; color: ${tc}; }
      `;

    case 'modern':
      return baseStyles + getPhotoStyles(profile, 56) + `
        .cv-container { display: flex; width: 816px; }
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
        .item-title { font-weight: 700; font-size: 8.5pt; color: ${tc}; }
        .item-subtitle { color: ${tc}; opacity: 0.6; font-size: 7.5pt; }
        .item-date { color: ${tc}; opacity: 0.5; font-size: 7pt; }
        .item-desc { color: ${tc}; opacity: 0.7; font-size: 7.5pt; margin-top: 1px; }
        .skill-item { margin-bottom: 4px; }
        .skill-name { display: flex; justify-content: space-between; font-size: 7.5pt; margin-bottom: 1px; }
        .skill-bar { height: 3px; background: rgba(255,255,255,0.3); border-radius: 1.5px; }
        .skill-fill { height: 100%; background: #fff; border-radius: 1.5px; }
      `;

    case 'creative':
      return baseStyles + getPhotoStyles(profile, 50, true) + `
        .cv-container { width: 816px; padding: 24px; }
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
        .item-title { font-weight: 700; font-size: 8.5pt; color: ${tc}; }
        .item-subtitle { color: ${tc}; opacity: 0.6; font-size: 7.5pt; }
        .item-desc { color: ${tc}; opacity: 0.7; font-size: 7.5pt; margin-top: 1px; }
        .skills-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; }
        .skill-item { text-align: center; }
        .skill-circle { width: 30px; height: 30px; border-radius: 50%; border: 2px solid ${pc}; display: flex; align-items: center; justify-content: center; margin: 0 auto 2px; font-weight: 700; font-size: 8pt; color: ${pc}; }
        .skill-name { font-size: 7pt; color: ${tc}; }
      `;

    case 'minimal':
      return baseStyles + getPhotoStyles(profile, 50) + `
        .cv-container { width: 816px; padding: 32px 36px; }
        .header { text-align: center; margin-bottom: 14px; }
        .name { font-size: 20pt; font-weight: 300; letter-spacing: 3px; margin-bottom: 3px; text-transform: uppercase; color: ${tc}; }
        .title { font-size: 9pt; color: ${tc}; opacity: 0.5; letter-spacing: 2px; margin-bottom: 6px; text-transform: uppercase; }
        .contact-line { font-size: 8pt; color: ${tc}; opacity: 0.6; }
        .section { margin-bottom: 10px; }
        .section-title { font-size: 8pt; font-weight: 600; letter-spacing: 2px; color: ${tc}; margin-bottom: 6px; text-transform: uppercase; border-bottom: 1px solid ${tc}20; padding-bottom: 3px; }
        .item { margin-bottom: 7px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-title { font-weight: 500; font-size: 8.5pt; color: ${tc}; }
        .item-date { color: ${tc}; opacity: 0.4; font-size: 7.5pt; }
        .item-subtitle { color: ${tc}; opacity: 0.5; font-size: 7.5pt; margin-top: 1px; }
        .item-desc { color: ${tc}; opacity: 0.7; font-size: 7.5pt; margin-top: 2px; }
        .skills-list { display: flex; flex-wrap: wrap; gap: 4px; }
        .skill-tag { padding: 2px 7px; background: ${tc}08; border-radius: 2px; font-size: 7.5pt; color: ${tc}; border: 1px solid ${tc}15; }
      `;

    case 'executive':
      return baseStyles + getPhotoStyles(profile, 44, true) + `
        .cv-container { width: 816px; }
        .header-band { background: ${pc}; color: #fff; padding: 14px 20px; display: flex; align-items: center; gap: 14px; }
        .header-text { flex: 1; }
        .name { font-size: 16pt; font-weight: 700; letter-spacing: 0.5px; }
        .title { font-size: 9pt; opacity: 0.9; margin-top: 1px; }
        .contact-row { display: flex; gap: 12px; font-size: 7pt; opacity: 0.85; margin-top: 3px; flex-wrap: wrap; }
        .body-cols { display: flex; padding: 12px 16px; gap: 14px; }
        .col-left { flex: 2; }
        .col-right { flex: 1; border-left: 1px solid ${tc}15; padding-left: 14px; }
        .section { margin-bottom: 8px; }
        .section-title { font-size: 8pt; font-weight: 700; color: ${pc}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; padding-bottom: 2px; border-bottom: 1px solid ${pc}30; }
        .item { margin-bottom: 5px; }
        .item-title { font-weight: 700; font-size: 8.5pt; color: ${tc}; }
        .item-subtitle { color: ${tc}; opacity: 0.6; font-size: 7.5pt; }
        .item-date { color: ${tc}; opacity: 0.5; font-size: 7pt; }
        .item-desc { color: ${tc}; opacity: 0.7; font-size: 7.5pt; margin-top: 1px; }
        .skill-item { margin-bottom: 3px; }
        .skill-name { font-size: 7.5pt; margin-bottom: 1px; display: flex; justify-content: space-between; color: ${tc}; }
        .skill-bar { height: 3px; background: ${tc}10; border-radius: 1.5px; }
        .skill-fill { height: 100%; background: ${pc}; border-radius: 1.5px; }
        .cert-item { font-size: 7.5pt; margin-bottom: 3px; color: ${tc}; }
        .cert-item strong { display: block; }
      `;

    case 'corporate':
      return baseStyles + getPhotoStyles(profile, 48) + `
        .cv-container { width: 816px; border-left: 4px solid ${pc}; padding: 16px 20px; }
        .header { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid ${tc}15; }
        .header-main { flex: 1; }
        .name { font-size: 16pt; font-weight: 700; color: ${pc}; margin-bottom: 1px; }
        .title { font-size: 9pt; color: ${tc}; opacity: 0.6; margin-bottom: 3px; }
        .contact-info { display: flex; gap: 10px; font-size: 7.5pt; color: ${tc}; opacity: 0.5; flex-wrap: wrap; }
        .section { margin-bottom: 8px; }
        .section-title { font-size: 8pt; font-weight: 700; color: ${pc}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; padding-left: 8px; border-left: 3px solid ${pc}; }
        .item { margin-bottom: 5px; padding-left: 8px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-title { font-weight: 700; font-size: 8.5pt; color: ${tc}; }
        .item-date { color: ${tc}; opacity: 0.5; font-size: 7pt; }
        .item-subtitle { color: ${tc}; opacity: 0.6; font-size: 7.5pt; }
        .item-desc { color: ${tc}; opacity: 0.7; font-size: 7.5pt; margin-top: 1px; }
        .skills-grid { display: flex; flex-wrap: wrap; gap: 4px; }
        .skill-tag { padding: 2px 6px; background: ${pc}12; border: 1px solid ${pc}30; border-radius: 2px; font-size: 7.5pt; color: ${pc}; }
        .cert-item { font-size: 7.5pt; margin-bottom: 2px; color: ${tc}; }
      `;

    case 'elegant':
      return baseStyles + getPhotoStyles(profile, 52) + `
        .cv-container { width: 816px; padding: 24px; border: 2px double ${pc}20; margin: 0; }
        .inner { border: 1px solid ${pc}15; padding: 14px 18px; }
        .header { text-align: center; margin-bottom: 10px; }
        .name { font-size: 18pt; font-weight: 300; color: ${tc}; letter-spacing: 4px; text-transform: uppercase; }
        .name-line { display: flex; align-items: center; gap: 8px; margin: 4px auto 6px; max-width: 60%; }
        .name-line::before, .name-line::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to right, transparent, ${pc}60, transparent); }
        .name-line span { color: ${pc}; font-size: 6pt; }
        .title { font-size: 9pt; color: ${tc}; opacity: 0.5; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 6px; }
        .contact-line { font-size: 7.5pt; color: ${tc}; opacity: 0.5; }
        .section { margin-bottom: 8px; }
        .section-title { font-size: 7.5pt; font-weight: 600; letter-spacing: 2px; color: ${pc}; text-transform: uppercase; text-align: center; margin-bottom: 5px; }
        .section-title::before, .section-title::after { content: ' \\00B7  '; color: ${pc}50; }
        .section-divider { height: 1px; background: linear-gradient(to right, transparent, ${pc}30, transparent); margin: 0 auto 5px; max-width: 80%; }
        .item { margin-bottom: 5px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-title { font-weight: 600; font-size: 8.5pt; color: ${tc}; }
        .item-date { color: ${tc}; opacity: 0.5; font-size: 7pt; font-style: italic; }
        .item-subtitle { color: ${tc}; opacity: 0.5; font-size: 7.5pt; font-style: italic; }
        .item-desc { color: ${tc}; opacity: 0.7; font-size: 7.5pt; margin-top: 1px; }
        .skills-list { display: flex; flex-wrap: wrap; justify-content: center; gap: 5px; }
        .skill-tag { padding: 2px 8px; border: 1px solid ${pc}40; border-radius: 10px; font-size: 7pt; color: ${pc}; background: ${pc}08; }
      `;

    case 'tech':
      return baseStyles + getPhotoStyles(profile, 42, true) + `
        .cv-container { width: 816px; background: #fafbfc; }
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

    case 'infographic':
      return baseStyles + getPhotoStyles(profile, 50) + `
        .cv-container { width: 816px; padding: 24px; }
        .header { text-align: center; margin-bottom: 12px; padding: 14px; background: linear-gradient(135deg, ${pc}10, ${sc}10); border-radius: 8px; }
        .name { font-size: 16pt; font-weight: 700; color: ${pc}; }
        .title { font-size: 9pt; color: ${tc}; opacity: 0.6; }
        .contact-row { display: flex; justify-content: center; gap: 16px; font-size: 7.5pt; color: ${tc}; opacity: 0.6; margin-top: 4px; flex-wrap: wrap; }
        .cols { display: flex; gap: 14px; }
        .col-left { flex: 1.2; }
        .col-right { flex: 1; }
        .section { margin-bottom: 8px; }
        .section-title { font-size: 8.5pt; font-weight: 700; color: ${pc}; margin-bottom: 5px; padding: 3px 8px; background: ${pc}12; border-radius: 3px; display: inline-block; }
        .item { margin-bottom: 5px; padding-left: 10px; border-left: 2px solid ${pc}40; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-title { font-weight: 700; font-size: 8.5pt; color: ${tc}; }
        .item-date { color: ${tc}; opacity: 0.5; font-size: 7pt; }
        .item-subtitle { color: ${tc}; opacity: 0.6; font-size: 7.5pt; }
        .item-desc { color: ${tc}; opacity: 0.7; font-size: 7.5pt; margin-top: 1px; }
        .skills-visual { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-pill { padding: 3px 8px; border-radius: 12px; font-size: 7.5pt; color: #fff; font-weight: 600; }
        .cert-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border: 1px solid ${ac}40; border-radius: 3px; font-size: 7pt; color: ${ac}; background: ${ac}08; margin: 2px; }
      `;

    case 'bold':
      return baseStyles + getPhotoStyles(profile, 48, true) + `
        .cv-container { width: 816px; }
        .header { background: ${pc}; color: #fff; padding: 18px 24px; display: flex; align-items: center; gap: 14px; }
        .header-info { flex: 1; }
        .name { font-size: 18pt; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        .title { font-size: 10pt; opacity: 0.9; font-weight: 300; }
        .contact-row { display: flex; gap: 12px; font-size: 7.5pt; margin-top: 4px; flex-wrap: wrap; opacity: 0.85; }
        .body-content { padding: 14px 20px; }
        .cols { display: flex; gap: 16px; }
        .col-main { flex: 2; }
        .col-side { flex: 1; }
        .section { margin-bottom: 8px; }
        .section-title { font-size: 10pt; font-weight: 800; color: ${pc}; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; }
        .item { margin-bottom: 6px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-title { font-weight: 700; font-size: 9pt; color: ${tc}; }
        .item-date { color: ${tc}; opacity: 0.5; font-size: 7pt; }
        .item-subtitle { color: ${tc}; opacity: 0.6; font-size: 8pt; }
        .item-desc { color: ${tc}; opacity: 0.7; font-size: 7.5pt; margin-top: 1px; }
        .skill-bar-full { margin-bottom: 4px; }
        .skill-label { font-size: 7.5pt; font-weight: 600; color: ${tc}; margin-bottom: 1px; display: flex; justify-content: space-between; }
        .skill-track { height: 4px; background: ${tc}10; border-radius: 2px; overflow: hidden; }
        .skill-progress { height: 100%; background: linear-gradient(90deg, ${pc}, ${sc}); border-radius: 2px; }
        .cert-item { font-size: 7.5pt; margin-bottom: 3px; padding-left: 8px; border-left: 2px solid ${ac}; color: ${tc}; }
      `;

    case 'compact':
      return baseStyles + getPhotoStyles(profile, 40, true) + `
        .cv-container { width: 816px; padding: 18px 22px; }
        .header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1.5px solid ${pc}; }
        .header-info { flex: 1; }
        .name { font-size: 14pt; font-weight: 700; color: ${pc}; }
        .title { font-size: 8pt; color: ${tc}; opacity: 0.6; }
        .contact-row { display: flex; gap: 8px; font-size: 7pt; color: ${tc}; opacity: 0.5; flex-wrap: wrap; }
        .cols { display: flex; gap: 12px; }
        .col-left { flex: 2; }
        .col-right { flex: 1; border-left: 1px solid ${tc}10; padding-left: 12px; }
        .section { margin-bottom: 6px; }
        .section-title { font-size: 7.5pt; font-weight: 700; color: ${pc}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
        .item { margin-bottom: 3px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-title { font-weight: 700; font-size: 8pt; color: ${tc}; }
        .item-date { color: ${tc}; opacity: 0.4; font-size: 6.5pt; }
        .item-subtitle { color: ${tc}; opacity: 0.5; font-size: 7pt; }
        .item-desc { color: ${tc}; opacity: 0.6; font-size: 7pt; margin-top: 1px; }
        .skills-grid { display: flex; flex-wrap: wrap; gap: 3px; }
        .skill-tag { padding: 1px 5px; background: ${pc}10; border-radius: 2px; font-size: 6.5pt; color: ${pc}; }
        .cert-item { font-size: 7pt; margin-bottom: 2px; color: ${tc}; }
      `;

    case 'professional':
      return baseStyles + getPhotoStyles(profile, 50) + `
        .cv-container { width: 816px; padding: 24px 28px; }
        .header { display: flex; gap: 14px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 2px solid ${pc}; }
        .header-text { flex: 1; }
        .name { font-size: 16pt; font-weight: 700; color: ${tc}; }
        .name-accent { color: ${pc}; }
        .title { font-size: 9pt; color: ${tc}; opacity: 0.6; margin-top: 1px; }
        .contact-row { display: flex; gap: 10px; font-size: 7.5pt; color: ${tc}; opacity: 0.5; margin-top: 4px; flex-wrap: wrap; }
        .summary { font-size: 8pt; color: ${tc}; opacity: 0.7; margin-bottom: 8px; line-height: 1.4; }
        .cols { display: flex; gap: 14px; }
        .col-left { flex: 2; }
        .col-right { flex: 1; }
        .section { margin-bottom: 8px; }
        .section-title { font-size: 8.5pt; font-weight: 700; color: ${pc}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; padding-bottom: 2px; border-bottom: 1px solid ${pc}30; }
        .item { margin-bottom: 5px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-title { font-weight: 700; font-size: 8.5pt; color: ${tc}; }
        .item-date { color: ${tc}; opacity: 0.5; font-size: 7pt; }
        .item-subtitle { color: ${tc}; opacity: 0.6; font-size: 7.5pt; }
        .item-desc { color: ${tc}; opacity: 0.7; font-size: 7.5pt; margin-top: 1px; }
        .skill-item { margin-bottom: 4px; }
        .skill-name { font-size: 7.5pt; margin-bottom: 1px; display: flex; justify-content: space-between; color: ${tc}; }
        .skill-bar { height: 3px; background: ${tc}10; border-radius: 1.5px; }
        .skill-fill { height: 100%; background: ${pc}; border-radius: 1.5px; }
        .cert-item { font-size: 7.5pt; margin-bottom: 3px; color: ${tc}; }
      `;

    default:
      return baseStyles;
  }
}

// ===================== CONTENT =====================

function generateCVContent(profile: any, template: TemplateType, sections: SectionVisibility, colorOverrides?: ColorOverrides): string {
  const work = profile.experiences?.filter((e: any) => e.type === 'work') || [];
  const edu = profile.experiences?.filter((e: any) => e.type === 'education') || [];
  const ph = getPhotoHtml(profile);
  const pc = colorOverrides?.primary || profile.primaryColor || '#2563eb';
  const sc = colorOverrides?.secondary || profile.secondaryColor || '#60a5fa';
  const ac = colorOverrides?.accent || profile.accentColor || '#f59e0b';
  const tc = colorOverrides?.text || '#2d2d2d';

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

  const certHtml = (style: 'normal' | 'tag' | 'simple' | 'badge' = 'normal') => {
    const certs = profile.certificates || [];
    if (style === 'tag') return `<div class="skills-list">${certs.map((c: any) => `<span class="skill-tag">${c.title}</span>`).join('')}</div>`;
    if (style === 'badge') return `<div>${certs.map((c: any) => `<span class="cert-badge">${c.title}</span>`).join('')}</div>`;
    if (style === 'simple') return certs.map((c: any) => `<div class="cert-item"><strong>${c.title}</strong> ${c.institution ? `- ${c.institution}` : ''} ${c.issueDate ? `(${c.issueDate})` : ''}</div>`).join('');
    return certs.map((c: any) => `<div class="item"><div class="item-title">${c.title}</div><div class="item-subtitle">${c.institution || ''} ${c.issueDate ? `· ${c.issueDate}` : ''}</div></div>`).join('');
  };

  switch (template) {
    case 'classic':
      return `<div class="cv-container"><div class="header">${ph}<div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-info">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div>${profile.bio ? `<div class="section"><div class="section-title">Perfil Profesional</div><p style="font-size:8pt;color:${tc};opacity:0.7">${profile.bio}</p></div>` : ''}${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia Laboral</div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="skills-grid">${profile.skills.map((s: any) => `<div class="skill-item"><span style="font-size:7.5pt;width:70px;color:${tc}">${s.name}</span><div class="skill-bar"><div class="skill-fill" style="width:${s.level}%"></div></div><span style="font-size:7pt;color:${tc};opacity:0.5">${s.level}%</span></div>`).join('')}</div></div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos Destacados</div>${projHtml(3)}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificaciones</div>${certHtml('normal')}</div>` : ''}</div>`;

    case 'modern':
      return `<div class="cv-container"><div class="sidebar">${ph}<div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="sidebar-section"><div class="sidebar-title">Contacto</div>${contactHtml()}</div>` : ''}${sections.skills && profile.skills?.length ? `<div class="sidebar-section"><div class="sidebar-title">Habilidades</div>${profile.skills.map((s: any) => `<div class="skill-item"><div class="skill-name"><span>${s.name}</span><span>${s.level}%</span></div><div class="skill-bar"><div class="skill-fill" style="width:${s.level}%"></div></div></div>`).join('')}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="sidebar-section"><div class="sidebar-title">Certificados</div>${certHtml('simple')}</div>` : ''}</div><div class="main">${profile.bio ? `<div class="section"><div class="section-title">Perfil</div><p style="font-size:8pt;color:${tc};opacity:0.7">${profile.bio}</p></div>` : ''}${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(4)}</div>` : ''}</div></div>`;

    case 'creative':
      return `<div class="cv-container"><div class="header">${ph}<div class="header-info"><div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-line">${[profile.email, profile.phone, profile.location].filter(Boolean).join(' · ')}</div>` : ''}</div></div>${profile.bio ? `<div class="section"><p style="font-size:8pt;color:${tc};opacity:0.7;text-align:center">${profile.bio}</p></div>` : ''}${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div><div class="timeline">${work.map((e: any) => `<div class="item"><div class="item-title">${e.title}</div><div class="item-subtitle">${e.company} · ${e.startDate} - ${e.endDate || 'Presente'}</div></div>`).join('')}</div></div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div><div class="timeline">${edu.map((e: any) => `<div class="item"><div class="item-title">${e.title}</div><div class="item-subtitle">${e.company} · ${e.startDate} - ${e.endDate || 'Presente'}</div></div>`).join('')}</div></div>` : ''}${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="skills-grid">${profile.skills.map((s: any) => `<div class="skill-item"><div class="skill-circle">${s.level}%</div><div class="skill-name">${s.name}</div></div>`).join('')}</div></div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(3)}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificados</div>${certHtml('tag')}</div>` : ''}</div>`;

    case 'minimal':
      return `<div class="cv-container"><div class="header">${ph}<div class="name">${profile.name.toUpperCase()}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-line">${[profile.email, profile.phone, profile.location].filter(Boolean).join(' &middot; ')}</div>` : ''}</div>${profile.bio ? `<div class="section"><p style="color:${tc};opacity:0.7;text-align:center;font-size:8.5pt">${profile.bio}</p></div>` : ''}${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="skills-list">${profile.skills.map((s: any) => `<span class="skill-tag">${s.name}</span>`).join('')}</div></div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(3)}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificaciones</div>${certHtml('tag')}</div>` : ''}</div>`;

    case 'executive':
      return `<div class="cv-container"><div class="header-band">${ph}<div class="header-text"><div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-row">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div></div><div class="body-cols"><div class="col-left">${profile.bio ? `<div class="section"><div class="section-title">Perfil Profesional</div><p style="font-size:7.5pt;color:${tc};opacity:0.7">${profile.bio}</p></div>` : ''}${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(3)}</div>` : ''}</div><div class="col-right">${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div>${profile.skills.map((s: any) => `<div class="skill-item"><div class="skill-name"><span>${s.name}</span><span>${s.level}%</span></div><div class="skill-bar"><div class="skill-fill" style="width:${s.level}%"></div></div></div>`).join('')}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificados</div>${certHtml('simple')}</div>` : ''}</div></div></div>`;

    case 'corporate':
      return `<div class="cv-container"><div class="header">${ph}<div class="header-main"><div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-info">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div></div>${profile.bio ? `<div class="section"><div class="section-title">Perfil Profesional</div><p style="font-size:7.5pt;color:${tc};opacity:0.7">${profile.bio}</p></div>` : ''}${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia Laboral</div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="skills-grid">${profile.skills.map((s: any) => `<span class="skill-tag">${s.name}</span>`).join('')}</div></div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(3)}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificaciones</div>${certHtml('simple')}</div>` : ''}</div>`;

    case 'elegant':
      return `<div class="cv-container"><div class="inner"><div class="header"><div class="name">${profile.name.toUpperCase()}</div><div class="name-line"><span>&#9670;</span></div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-line">${[profile.email, profile.phone, profile.location].filter(Boolean).join(' &middot; ')}</div>` : ''}</div>${profile.bio ? `<div class="section"><div class="section-divider"></div><p style="font-size:8pt;color:${tc};opacity:0.7;text-align:center;font-style:italic">${profile.bio}</p></div>` : ''}${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div><div class="section-divider"></div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div><div class="section-divider"></div>${eduHtml()}</div>` : ''}${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="section-divider"></div><div class="skills-list">${profile.skills.map((s: any) => `<span class="skill-tag">${s.name}</span>`).join('')}</div></div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div><div class="section-divider"></div>${projHtml(3)}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificaciones</div><div class="section-divider"></div>${certHtml('tag')}</div>` : ''}</div></div>`;

    case 'tech':
      return `<div class="cv-container"><div class="header">${ph}<div class="header-info"><div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-line">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div></div>${profile.bio ? `<div class="section"><div class="section-title">about()</div><p style="font-size:7.5pt;color:#555">${profile.bio}</p></div>` : ''}${sections.experience && work.length ? `<div class="section"><div class="section-title">experience()</div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">education()</div>${eduHtml()}</div>` : ''}${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">skills()</div><div class="skills-grid">${profile.skills.map((s: any) => `<span class="skill-tag">${s.name}</span>`).join('')}</div></div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">projects()</div>${projHtml(4)}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">certifications()</div>${certHtml('simple')}</div>` : ''}</div>`;

    case 'infographic':
      return `<div class="cv-container"><div class="header">${ph}<div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-row">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div>${profile.bio ? `<div style="font-size:8pt;color:${tc};opacity:0.7;text-align:center;margin-bottom:8px">${profile.bio}</div>` : ''}<div class="cols"><div class="col-left">${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(3)}</div>` : ''}</div><div class="col-right">${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="skills-visual">${profile.skills.map((s: any) => {
        const level = s.level || 50;
        const bg = level >= 80 ? pc : level >= 60 ? sc : `${tc}40`;
        return `<span class="skill-pill" style="background:${bg}">${s.name}</span>`;
      }).join('')}</div></div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificados</div>${certHtml('badge')}</div>` : ''}</div></div></div>`;

    case 'bold':
      return `<div class="cv-container"><div class="header">${ph}<div class="header-info"><div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-row">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div></div><div class="body-content"><div class="cols"><div class="col-main">${profile.bio ? `<div class="section"><div class="section-title">Perfil</div><p style="font-size:8pt;color:${tc};opacity:0.7">${profile.bio}</p></div>` : ''}${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(4)}</div>` : ''}</div><div class="col-side">${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Skills</div>${profile.skills.map((s: any) => `<div class="skill-bar-full"><div class="skill-label"><span>${s.name}</span><span>${s.level}%</span></div><div class="skill-track"><div class="skill-progress" style="width:${s.level}%"></div></div></div>`).join('')}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificados</div>${certHtml('simple')}</div>` : ''}</div></div></div></div>`;

    case 'compact':
      return `<div class="cv-container"><div class="header">${ph}<div class="header-info"><div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-row">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div></div>${profile.bio ? `<div style="font-size:7.5pt;color:${tc};opacity:0.7;margin-bottom:6px">${profile.bio}</div>` : ''}<div class="cols"><div class="col-left">${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div>${workHtml(false)}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(4)}</div>` : ''}</div><div class="col-right">${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="skills-grid">${profile.skills.map((s: any) => `<span class="skill-tag">${s.name}</span>`).join('')}</div></div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificados</div>${certHtml('simple')}</div>` : ''}</div></div></div>`;

    case 'professional':
      return `<div class="cv-container"><div class="header">${ph}<div class="header-text"><div class="name">${profile.name.split(' ').map((n: string, i: number) => i === 0 ? n : `<span class="name-accent">${n}</span>`).join(' ')}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-row">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div></div>${profile.bio ? `<div class="summary">${profile.bio}</div>` : ''}<div class="cols"><div class="col-left">${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(3)}</div>` : ''}</div><div class="col-right">${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div>${profile.skills.map((s: any) => `<div class="skill-item"><div class="skill-name"><span>${s.name}</span><span>${s.level}%</span></div><div class="skill-bar"><div class="skill-fill" style="width:${s.level}%"></div></div></div>`).join('')}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificados</div>${certHtml('simple')}</div>` : ''}</div></div></div>`;

    default:
      return '';
  }
}
