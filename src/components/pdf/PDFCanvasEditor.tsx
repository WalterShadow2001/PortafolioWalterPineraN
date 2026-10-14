'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  Check, Sparkles, Layout, Type, Maximize2, Settings
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { createRoot } from 'react-dom/client';
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
  const [activeTab, setActiveTab] = useState<'templates' | 'sections' | 'colors' | 'options'>('templates');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.52);
  const [fitStatus, setFitStatus] = useState<'checking' | 'fits' | 'overflow' | 'adjusted'>('checking');
  const [showMobilePanel, setShowMobilePanel] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  // Nuevas opciones de impresión
  const [density, setDensity] = useState<'extra-compact' | 'compact' | 'normal' | 'spacious'>('compact');
  const [paperSize, setPaperSize] = useState<'letter' | 'a4'>('letter');
  const [pageCount, setPageCount] = useState<'auto' | '1' | '2'>('auto');
  const previewRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Auto-fit preview on mount and resize
  useEffect(() => {
    if (!open) return;
    const fitPreview = () => {
      const container = previewRef.current;
      if (!container) return;
      const availableWidth = container.clientWidth - 48; // padding
      const availableHeight = container.clientHeight - 48;
      const scaleW = availableWidth / 816;
      const scaleH = availableHeight / 1056;
      const newScale = Math.min(scaleW, scaleH, 0.75);
      setPreviewScale(Math.max(newScale, 0.15));
    };
    setTimeout(fitPreview, 100);
    window.addEventListener('resize', fitPreview);
    return () => window.removeEventListener('resize', fitPreview);
  }, [open, isMobile]);
  const renderRef = useRef<HTMLDivElement>(null);

  // Update color overrides when profile changes
  useEffect(() => {
    if (profile && profile.primaryColor) {
      setColorOverrides({
        primary: profile.primaryColor,
        secondary: profile.secondaryColor || '#60a5fa',
        accent: profile.accentColor || '#f59e0b',
        text: '#2d2d2d',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.primaryColor, profile?.secondaryColor, profile?.accentColor]);

  // Check content height whenever template/sections/colors/density change (solo informativo)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (renderRef.current) {
        const h = renderRef.current.scrollHeight;
        const maxH = 1056; // 11 inches at 96dpi (1 página Letter)
        if (h <= maxH) {
          setFitStatus('fits');
        } else {
          setFitStatus('overflow');
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedTemplate, sections, colorOverrides, density]);

  // Create a modified profile with color overrides
  const modifiedProfile = {
    ...profile,
    primaryColor: colorOverrides.primary,
    secondaryColor: colorOverrides.secondary,
    accentColor: colorOverrides.accent,
  };

  // Generate QR code SVG string for embedding in PDF HTML
  const generateQRSvgString = (url: string, size: number, fgColor: string): Promise<string> => {
    return new Promise((resolve) => {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.visibility = 'hidden';
      document.body.appendChild(container);
      const root = createRoot(container);
      root.render(
        <QRCodeSVG value={url} size={size} bgColor="#ffffff" fgColor={fgColor} level="M" />
      );
      setTimeout(() => {
        const svgEl = container.querySelector('svg');
        const svgString = svgEl ? svgEl.outerHTML : '';
        root.unmount();
        document.body.removeChild(container);
        resolve(svgString);
      }, 150);
    });
  };

  const handlePrint = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate QR code for the portfolio URL
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://portafolio-walter-pineran.vercel.app';
    const qrSvg = await generateQRSvgString(siteUrl, 80, colorOverrides.primary);
    const siteHost = siteUrl.replace('https://', '').replace('http://', '');
    const qrColumnHtml = `
      <div class="cv-qr-section">
        <div class="cv-qr-code">${qrSvg}</div>
        <div class="cv-qr-text">
          <div class="cv-qr-title">Escanea para ver portafolio</div>
          <div class="cv-qr-url">${siteHost}</div>
        </div>
      </div>
    `;
    const qrBottomHtml = `
      <div class="cv-qr-section cv-qr-bottom">
        <div class="cv-qr-code">${qrSvg}</div>
        <div class="cv-qr-text">
          <div class="cv-qr-title">Escanea para ver portafolio</div>
          <div class="cv-qr-url">${siteHost}</div>
        </div>
      </div>
    `;

    // Función para generar el HTML completo con una densidad dada
    const generateHtmlWithDensity = (testDensity: 'extra-compact' | 'compact' | 'normal' | 'spacious') => {
      const testStyles = getTemplateStyles(selectedTemplate, modifiedProfile, colorOverrides, testDensity);
      const testContent = generateCVContent(modifiedProfile, selectedTemplate, sections, colorOverrides, qrColumnHtml, qrBottomHtml);

      const pageDimensions = paperSize === 'a4'
        ? { w: 794, h: 1123, cssSize: 'A4', margin: '1.4cm' }
        : { w: 816, h: 1056, cssSize: 'letter', margin: '1.5cm' };

      const testQrStyles = `.cv-qr-section{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;margin-top:14px;padding:12px 10px;border:1px solid rgba(0,0,0,0.08);border-radius:8px;background:rgba(255,255,255,0.6)}.cv-qr-code{padding:4px;background:#fff;border-radius:5px;line-height:0;box-shadow:0 1px 4px rgba(0,0,0,0.1)}.cv-qr-text{text-align:center}.cv-qr-title{font-size:9pt;font-weight:600;letter-spacing:0.5px;opacity:0.55}.cv-qr-url{font-size:8pt;font-family:monospace;opacity:0.4;margin-top:1px}.cv-qr-bottom{flex-direction:row;justify-content:flex-end;gap:8px;padding:8px 12px;margin-top:10px}`;

      const printStyles = `
        .cv-container { width: 100%; max-width: ${pageDimensions.w}px; margin: 0 auto; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
          @page { size: ${pageDimensions.cssSize}; margin: ${pageDimensions.margin}; }
          .cv-container { width: 100%; max-width: none; }
          /* page-break-inside: avoid solo en items pequeños */
          .item { page-break-inside: avoid; }
          h1, h2, h3, h4, .section-title { page-break-after: avoid; }
        }
        @media screen {
          body { background: #f3f4f6; padding: 20px; }
          .cv-container { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        }
      `;

      return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>CV - ${profile?.name}</title><style>${testStyles}${testQrStyles}${printStyles}body{margin:0;padding:0}</style></head><body><div class="cv-container">${testContent}</div></body></html>`;
    };

    // PASO 1: Medir contenido con densidad actual
    const measureContent = (html: string): { totalHeight: number; pageHeight: number } => {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = paperSize === 'a4' ? '794px' : '816px';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
      iframe.contentDocument?.open();
      iframe.contentDocument?.write(html);
      iframe.contentDocument?.close();

      const pageHeight = paperSize === 'a4' ? 1123 : 1056;

      return new Promise((resolve) => {
        setTimeout(() => {
          const container = iframe.contentDocument?.querySelector('.cv-container');
          const totalHeight = container ? container.scrollHeight : 0;
          document.body.removeChild(iframe);
          resolve({ totalHeight, pageHeight });
        }, 500);
      }) as any;
    };

    // PASO 2: Probar densidades hasta encontrar una que quepa en 2 páginas
    // Orden de prueba: del más espacioso al más compacto
    let finalDensity = density;
    const densitiesToTry: ('extra-compact' | 'compact' | 'normal' | 'spacious')[] = [
      'spacious', 'normal', 'compact', 'extra-compact'
    ];

    // Medir con densidad actual primero
    const testHtml = generateHtmlWithDensity(finalDensity);
    const measurement = await measureContent(testHtml);
    const maxTwoPagesHeight = measurement.pageHeight * 2.0; // exactamente 2 páginas

    if (measurement.totalHeight > maxTwoPagesHeight) {
      // Excede 2 páginas: probar densidades más compactas
      const currentIdx = densitiesToTry.indexOf(density);
      for (let i = currentIdx + 1; i < densitiesToTry.length; i++) {
        const tryDensity = densitiesToTry[i];
        const tryHtml = generateHtmlWithDensity(tryDensity);
        const tryMeasurement = await measureContent(tryHtml);
        if (tryMeasurement.totalHeight <= maxTwoPagesHeight) {
          finalDensity = tryDensity;
          break;
        }
        // Si llegamos al último y sigue sin caber, usar extra-compact
        if (i === densitiesToTry.length - 1) {
          finalDensity = 'extra-compact';
        }
      }
    }

    // Generar HTML final con la densidad óptima
    const finalHtml = generateHtmlWithDensity(finalDensity);
    printWindow.document.write(finalHtml);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => { printWindow.print(); }, 800);
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
  const zoomOut = () => setPreviewScale(s => Math.max(s - 0.05, 0.15));

  const colorPresets = [
    { primary: '#2563eb', secondary: '#60a5fa', accent: '#f59e0b', name: 'Azul' },
    { primary: '#059669', secondary: '#34d399', accent: '#fbbf24', name: 'Verde' },
    { primary: '#dc2626', secondary: '#f87171', accent: '#fbbf24', name: 'Rojo' },
    { primary: '#7c3aed', secondary: '#a78bfa', accent: '#f472b6', name: 'Violeta' },
    { primary: '#1a1a2e', secondary: '#16213e', accent: '#00d4ff', name: 'Tech' },
    { primary: '#d97706', secondary: '#fbbf24', accent: '#92400e', name: 'Dorado' },
    { primary: '#0f766e', secondary: '#2dd4bf', accent: '#f97316', name: 'Teal' },
    { primary: '#be185d', secondary: '#f472b6', accent: '#9333ea', name: 'Rosa' },
  ];

  const tabButtons = [
    { id: 'templates' as const, icon: Layout, label: 'Plantillas' },
    { id: 'sections' as const, icon: Type, label: 'Secciones' },
    { id: 'colors' as const, icon: Palette, label: 'Colores' },
    { id: 'options' as const, icon: Settings, label: 'Opciones' },
  ];

  const actionArea = (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-blue-900/40 text-blue-300">
        <Maximize2 size={14} />
        <span>Máx 2 hojas · Letra {density === 'extra-compact' ? '10pt' : density === 'compact' ? '11pt' : density === 'normal' ? '12pt' : '14pt'} · {paperSize === 'letter' ? 'Carta' : 'A4'}</span>
      </div>
      <Button
        onClick={() => { setIsGenerating(true); handlePrint(); setTimeout(() => setIsGenerating(false), 1000); }}
        disabled={isGenerating}
        className="w-full gap-2 py-4 md:py-6 text-sm md:text-base font-semibold shadow-lg hover:shadow-xl transition-all"
        style={{
          background: `linear-gradient(135deg, ${colorOverrides.primary}, ${colorOverrides.secondary})`,
          color: 'white'
        }}
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Abriendo...
          </>
        ) : (
          <>
            <FileDown size={16} />
            Imprimir / Guardar PDF
          </>
        )}
      </Button>
      {isMobile ? (
        <p className="text-xs text-slate-500 text-center">
          Se abrirá una nueva pestaña. Usa el menú del navegador para guardar como PDF.
        </p>
      ) : (
        <p className="text-xs text-slate-500 text-center">
          En el diálogo de impresión selecciona "Guardar como PDF"
        </p>
      )}
    </div>
  );

  const tabContent = (compact: boolean = false) => (
    <>
      {activeTab === 'templates' && (
        <div className="space-y-3 md:space-y-4">
          {['Profesional', 'Creativo', 'Minimalista'].map(category => (
            <div key={category}>
              <h4 className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 md:mb-2">{category}</h4>
              <div className={`grid gap-1.5 md:gap-2 ${compact ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {templates.filter(t => t.category === category).map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-2 md:p-2.5 rounded-lg border text-left transition-all group ${
                      selectedTemplate === template.id
                        ? 'border-blue-400 bg-blue-500/15 ring-1 md:ring-2 ring-blue-400/30 shadow-sm shadow-blue-500/10'
                        : 'border-slate-600/50 bg-slate-800 hover:border-blue-400/50 hover:shadow-sm'
                    }`}
                  >
                    <span className={compact ? 'text-sm' : 'text-base'}>{template.icon}</span>
                    <p className={`text-[10px] md:text-xs font-medium mt-0.5 md:mt-1 ${
                      selectedTemplate === template.id ? 'text-blue-300' : 'text-slate-300'
                    }`}>{template.name}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {activeTab === 'sections' && (
        <div className="space-y-2 md:space-y-3">
          {Object.entries({ experience: 'Experiencia', projects: 'Proyectos', skills: 'Habilidades', certificates: 'Certificados', contact: 'Contacto' }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between p-2.5 md:p-3 rounded-lg bg-slate-800 border border-slate-700/50">
              <Label className={`cursor-pointer ${compact ? 'text-xs' : 'text-sm'} text-slate-300`}>{label}</Label>
              <Checkbox
                checked={sections[key as keyof SectionVisibility]}
                onCheckedChange={(checked) => setSections(prev => ({ ...prev, [key]: !!checked }))}
              />
            </div>
          ))}
        </div>
      )}
      {activeTab === 'colors' && (
        <div className="space-y-3 md:space-y-4">
          <div className={`grid gap-2 md:gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2'}`}>
            {[
              { key: 'primary', label: 'Primario' },
              { key: 'secondary', label: 'Secundario' },
              { key: 'accent', label: 'Acento' },
              { key: 'text', label: 'Texto' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorOverrides[key as keyof ColorOverrides]}
                  onChange={(e) => setColorOverrides(prev => ({ ...prev, [key]: e.target.value }))}
                  className={`${compact ? 'w-7 h-7' : 'w-8 h-8'} rounded border border-slate-600 cursor-pointer bg-transparent`}
                />
                <div>
                  <Label className="text-[10px] md:text-xs text-slate-400">{label}</Label>
                  {!compact && <p className="text-[10px] text-slate-500 font-mono">{colorOverrides[key as keyof ColorOverrides]}</p>}
                </div>
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 md:mb-2">Presets de Color</h4>
            <div className={`grid gap-1.5 md:gap-2 ${compact ? 'grid-cols-4' : 'grid-cols-5'}`}>
              {colorPresets.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => setColorOverrides({ primary: preset.primary, secondary: preset.secondary, accent: preset.accent, text: '#2d2d2d' })}
                  className="group relative"
                  title={preset.name}
                >
                  <div className={`${compact ? 'h-8' : 'h-10'} rounded-lg border border-slate-600/50 overflow-hidden hover:border-blue-400 transition-colors hover:shadow-sm`}>
                    <div className="flex h-full">
                      <div className="flex-1" style={{ backgroundColor: preset.primary }} />
                      <div className="flex-1" style={{ backgroundColor: preset.secondary }} />
                      <div className={compact ? 'w-1.5' : 'w-2'} style={{ backgroundColor: preset.accent }} />
                    </div>
                  </div>
                  <span className={`text-slate-400 group-hover:text-slate-200 text-center block mt-0.5 ${compact ? 'text-[8px]' : 'text-[9px]'}`}>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {activeTab === 'options' && (
        <div className="space-y-4 md:space-y-5">
          {/* Densidad de contenido */}
          <div>
            <h4 className={`text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ${compact ? 'text-[10px]' : ''}`}>Densidad del contenido</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'extra-compact', name: 'Extra Compacto', desc: '10pt, máximo ajuste', icon: '📑' },
                { id: 'compact', name: 'Compacto', desc: '11pt, ajustado', icon: '📄' },
                { id: 'normal', name: 'Normal', desc: '12pt, balanceado', icon: '📋' },
                { id: 'spacious', name: 'Espacioso', desc: '14pt, más aire', icon: '📃' },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDensity(d.id as any)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    density === d.id
                      ? 'border-blue-400 bg-blue-500/15 ring-1 md:ring-2 ring-blue-400/30'
                      : 'border-slate-600/50 bg-slate-800 hover:border-blue-400/50'
                  }`}
                >
                  <span className="text-base block mb-1">{d.icon}</span>
                  <p className={`font-medium ${compact ? 'text-[10px]' : 'text-xs'} ${density === d.id ? 'text-blue-300' : 'text-slate-300'}`}>{d.name}</p>
                  <p className={`text-slate-500 ${compact ? 'text-[9px]' : 'text-[10px]'} mt-0.5`}>{d.desc}</p>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
              💡 Si el contenido excede 2 páginas, se usará automáticamente una densidad más compacta.
            </p>
          </div>

          {/* Tamaño de papel */}
          <div>
            <h4 className={`text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ${compact ? 'text-[10px]' : ''}`}>Tamaño de papel</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'letter', name: 'Carta', desc: '216×279mm (8.5×11")', icon: '📐' },
                { id: 'a4', name: 'A4', desc: '210×297mm', icon: '📏' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPaperSize(p.id as any)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    paperSize === p.id
                      ? 'border-blue-400 bg-blue-500/15 ring-1 md:ring-2 ring-blue-400/30'
                      : 'border-slate-600/50 bg-slate-800 hover:border-blue-400/50'
                  }`}
                >
                  <span className="text-base block mb-1">{p.icon}</span>
                  <p className={`font-medium ${compact ? 'text-[10px]' : 'text-xs'} ${paperSize === p.id ? 'text-blue-300' : 'text-slate-300'}`}>{p.name}</p>
                  <p className={`text-slate-500 ${compact ? 'text-[9px]' : 'text-[10px]'} mt-0.5`}>{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Información de páginas */}
          <div className="p-3 rounded-lg bg-slate-800 border border-slate-700/50">
            <div className="flex items-start gap-2">
              <div className="text-blue-400 mt-0.5">
                <Maximize2 size={14} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-300 mb-1">Impresión multi-página</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  El PDF se generará con tipografía legible (mínimo 12pt). Si el contenido no cabe en una hoja, se extenderá automáticamente a 2 o más páginas sin comprimir el texto.
                </p>
              </div>
            </div>
          </div>

          {/* Resumen de configuración */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-[10px] text-blue-300 font-medium mb-2">CONFIGURACIÓN ACTUAL</p>
            <div className="space-y-1 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Plantilla:</span>
                <span className="font-medium">{templates.find(t => t.id === selectedTemplate)?.name || selectedTemplate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Densidad:</span>
                <span className="font-medium capitalize">{density === 'extra-compact' ? 'Extra Compacto' : density} ({density === 'extra-compact' ? '10pt' : density === 'compact' ? '11pt' : density === 'normal' ? '12pt' : '14pt'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Papel:</span>
                <span className="font-medium">{paperSize === 'letter' ? 'Carta (216×279mm)' : 'A4 (210×297mm)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Páginas:</span>
                <span className="font-medium text-blue-300">Máximo 2 (ajuste automático)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const cvPreviewContent = (
    <div
      ref={renderRef}
      className="cv-render-container"
      style={{ width: 816, height: 'auto', overflow: 'visible' }}
      dangerouslySetInnerHTML={{
        __html: `<style>${getTemplateStyles(selectedTemplate, modifiedProfile, colorOverrides, density)}.cv-qr-section{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;margin-top:14px;padding:12px 10px;border:1px solid rgba(0,0,0,0.08);border-radius:8px;background:rgba(255,255,255,0.6)}.cv-qr-code{padding:4px;background:#fff;border-radius:5px;line-height:0;box-shadow:0 1px 4px rgba(0,0,0,0.1)}.cv-qr-text{text-align:center}.cv-qr-title{font-size:9pt;font-weight:600;letter-spacing:0.5px;opacity:0.55}.cv-qr-url{font-size:8pt;font-family:monospace;opacity:0.4;margin-top:1px}.cv-qr-bottom{flex-direction:row;justify-content:flex-end;gap:8px;padding:8px 12px;margin-top:10px}</style>${generateCVContent(modifiedProfile, selectedTemplate, sections, colorOverrides, `<div class="cv-qr-section"><div class="cv-qr-code" style="width:80px;height:80px;background:repeating-conic-gradient(${colorOverrides?.primary || '#2563eb'} 0% 25%,#fff 0% 50%) 50%/10px 10px;border-radius:4px"></div><div class="cv-qr-text"><div class="cv-qr-title">Escanea para ver portafolio</div><div class="cv-qr-url">portafolio-walter-pineran.vercel.app</div></div></div>`, `<div class="cv-qr-section cv-qr-bottom"><div class="cv-qr-code" style="width:80px;height:80px;background:repeating-conic-gradient(${colorOverrides?.primary || '#2563eb'} 0% 25%,#fff 0% 50%) 50%/10px 10px;border-radius:4px"></div><div class="cv-qr-text"><div class="cv-qr-title">Escanea para ver portafolio</div><div class="cv-qr-url">portafolio-walter-pineran.vercel.app</div></div></div>`)}`
      }}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[100vw] max-w-[100vw] max-h-[100vh] w-[100vw] h-[100vh] p-0 gap-0 overflow-hidden rounded-none border-0" showCloseButton={true} style={{ background: '#0f172a' }}>
        <DialogHeader className="px-4 md:px-6 pt-3 md:pt-4 pb-2 md:pb-3 border-b border-slate-700/50 bg-slate-900 flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-sm md:text-lg flex items-center gap-2 text-white">
            <Layout size={18} className="text-blue-400" />
            Generador de CV
          </DialogTitle>
          {isMobile && (
            <button
              onClick={() => setShowMobilePanel(!showMobilePanel)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 shadow-md"
              style={{
                backgroundColor: showMobilePanel ? 'rgba(59,130,246,0.2)' : colorOverrides.primary,
                color: showMobilePanel ? '#60a5fa' : '#ffffff'
              }}
            >
              {showMobilePanel ? <><Eye size={16} /> Vista Previa</> : <><Palette size={16} /> Opciones</>}
            </button>
          )}
        </DialogHeader>

        {isMobile ? (
          <div className="flex flex-col h-[calc(100vh-48px)]">
            {showMobilePanel ? (
              <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
                <div className="flex border-b border-slate-700/50 bg-slate-800">
                  {tabButtons.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-2.5 px-2 text-xs font-medium flex flex-col items-center gap-0.5 transition-all border-b-2 ${
                        activeTab === tab.id
                          ? 'text-blue-400 border-blue-400 bg-slate-700/50'
                          : 'text-slate-400 border-transparent hover:text-slate-200'
                      }`}
                    >
                      <tab.icon size={14} />
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto p-3 pb-20">
                  {tabContent(true)}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-700/50 bg-slate-900 space-y-2">
                  {actionArea}
                  <button
                    onClick={() => setShowMobilePanel(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-600 text-slate-300 text-sm font-medium hover:bg-slate-800 active:scale-95 transition-all"
                  >
                    <Eye size={16} />
                    Ver Vista Previa
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col bg-slate-950 relative" ref={previewRef}>
                <div className="flex-1 overflow-auto flex justify-center p-3">
                  <div className="relative" style={{ width: 816 * previewScale, height: 1056 * previewScale }}>
                    <div
                      className="absolute rounded shadow-2xl bg-white"
                      style={{ width: 816, height: 1056, transform: `scale(${previewScale})`, transformOrigin: 'top left' }}
                    >
                      {cvPreviewContent}
                    </div>
                  </div>
                </div>
                {/* Floating button to switch back to options */}
                <button
                  onClick={() => setShowMobilePanel(true)}
                  className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-3 rounded-full shadow-xl text-white font-bold text-sm active:scale-95 transition-all"
                  style={{ backgroundColor: colorOverrides.primary }}
                >
                  <Palette size={18} />
                  Opciones
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-[calc(100vh-56px)]">
            <div className="w-[460px] border-r border-slate-700/50 flex flex-col bg-slate-900">
              <div className="flex border-b border-slate-700/50 bg-slate-800">
                {tabButtons.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 px-2 text-xs font-medium flex flex-col items-center gap-1 transition-all border-b-2 ${
                      activeTab === tab.id
                        ? 'text-blue-400 border-blue-400 bg-slate-700/50'
                        : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-700/30'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {tabContent(false)}
              </div>
              <div className="p-4 border-t border-slate-700/50 bg-slate-900 space-y-3">
                {actionArea}
              </div>
            </div>
            <div className="flex-1 flex flex-col bg-slate-950" ref={previewRef}>
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700/50">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Eye size={14} />
                  <span>Vista Previa</span>
                  <span className="text-xs text-slate-500 hidden md:inline">Carta (8.5" × 11")</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={zoomOut} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors">
                    <ZoomOut size={14} />
                  </button>
                  <span className="text-xs text-slate-400 w-12 text-center">{Math.round(previewScale * 100)}%</span>
                  <button onClick={zoomIn} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors">
                    <ZoomIn size={14} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto flex justify-center p-6">
                <div className="relative" style={{ width: 816 * previewScale, height: 1056 * previewScale }}>
                  <div
                    className="absolute rounded shadow-2xl bg-white"
                    style={{ width: 816, height: 1056, transform: `scale(${previewScale})`, transformOrigin: 'top left' }}
                  >
                    {cvPreviewContent}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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

function getTemplateStyles(template: TemplateType, profile: any, colorOverrides?: ColorOverrides, density: 'extra-compact' | 'compact' | 'normal' | 'spacious' = 'normal'): string {
  const pc = colorOverrides?.primary || profile.primaryColor || '#2563eb';
  const sc = colorOverrides?.secondary || profile.secondaryColor || '#60a5fa';
  const ac = colorOverrides?.accent || profile.accentColor || '#f59e0b';
  const tc = colorOverrides?.text || '#2d2d2d';

  // Factores de escala según densidad.
  // extra-compact = 10pt body, muy compacto (para CV con mucho contenido)
  // compact = 11pt body, compacto
  // normal = 12pt body, balanceado (default cambiado para garantizar 2 páginas)
  // spacious = 14pt body, más aire
  const densityConfig = {
    'extra-compact': {
      bodySize: '10pt',
      headingSize: '14pt',
      sectionSize: '11pt',
      itemTitleSize: '11pt',
      metaSize: '9pt',
      smallSize: '8pt',
      sectionMargin: '5px',
      itemMargin: '3px',
      lineSpacing: '1.2',
      padding: '16px',
    },
    compact: {
      bodySize: '11pt',
      headingSize: '15pt',
      sectionSize: '12pt',
      itemTitleSize: '12pt',
      metaSize: '10pt',
      smallSize: '9pt',
      sectionMargin: '6px',
      itemMargin: '4px',
      lineSpacing: '1.25',
      padding: '20px',
    },
    normal: {
      bodySize: '12pt',
      headingSize: '16pt',
      sectionSize: '13pt',
      itemTitleSize: '13pt',
      metaSize: '10pt',
      smallSize: '9pt',
      sectionMargin: '8px',
      itemMargin: '6px',
      lineSpacing: '1.3',
      padding: '24px',
    },
    spacious: {
      bodySize: '14pt',
      headingSize: '20pt',
      sectionSize: '16pt',
      itemTitleSize: '15pt',
      metaSize: '12pt',
      smallSize: '11pt',
      sectionMargin: '18px',
      itemMargin: '14px',
      lineSpacing: '1.6',
      padding: '40px',
    },
  }[density];

  const baseStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: ${densityConfig.bodySize}; line-height: ${densityConfig.lineSpacing}; color: ${tc}; background: #fff; }
    .cv-container { color: ${tc}; padding: ${densityConfig.padding}; }
    .section { margin-bottom: ${densityConfig.sectionMargin}; }
    .section-title { font-size: ${densityConfig.sectionSize}; font-weight: 700; margin-bottom: 8px; }
    .item { margin-bottom: ${densityConfig.itemMargin}; }
    .item-title { font-size: ${densityConfig.itemTitleSize}; font-weight: 700; color: ${tc}; }
    .item-subtitle { font-size: ${densityConfig.metaSize}; color: ${tc}; opacity: 0.7; }
    .item-date { font-size: ${densityConfig.metaSize}; color: ${tc}; opacity: 0.6; }
    .item-desc { font-size: ${densityConfig.bodySize}; color: ${tc}; opacity: 0.8; line-height: ${densityConfig.lineSpacing}; margin-top: 4px; }
    .contact-info { font-size: ${densityConfig.metaSize}; }
    .cert-item { font-size: ${densityConfig.bodySize}; margin-bottom: 6px; color: ${tc}; }
  `;

  switch (template) {
    case 'classic':
      return baseStyles + getPhotoStyles(profile, 100) + `
        .header { text-align: center; border-bottom: 2px solid ${pc}; padding-bottom: 12px; margin-bottom: 14px; }
        .name { font-size: ${densityConfig.headingSize}; font-weight: 700; color: ${pc}; margin-bottom: 4px; letter-spacing: 0.5px; }
        .title { font-size: ${densityConfig.sectionSize}; color: ${tc}; opacity: 0.7; margin-bottom: 8px; }
        .contact-info { display: flex; justify-content: center; gap: 16px; color: ${tc}; opacity: 0.7; flex-wrap: wrap; }
        .section-title { color: ${pc}; border-bottom: 1px solid ${pc}; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
        .skills-grid { display: flex; flex-wrap: wrap; gap: 8px 16px; }
        .skill-item { display: flex; align-items: center; gap: 6px; font-size: ${densityConfig.bodySize}; }
        .skill-bar { width: 60px; height: 5px; background: ${sc}30; border-radius: 2px; }
        .skill-fill { height: 100%; background: ${pc}; border-radius: 2px; }
      `;

    case 'modern':
      return baseStyles + getPhotoStyles(profile, 100) + `
        .cv-container { display: flex; padding: 0; }
        .sidebar { width: 32%; background: ${pc}; color: #fff; padding: ${densityConfig.padding}; }
        .main { width: 68%; padding: ${densityConfig.padding}; }
        .name { font-size: ${densityConfig.headingSize}; font-weight: 700; text-align: center; margin-bottom: 4px; letter-spacing: 0.5px; }
        .title { font-size: ${densityConfig.sectionSize}; text-align: center; opacity: 0.9; margin-bottom: 16px; }
        .sidebar-section { margin-bottom: 16px; }
        .sidebar-title { font-size: ${densityConfig.sectionSize}; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
        .contact-item { margin-bottom: 6px; font-size: ${densityConfig.bodySize}; line-height: 1.4; }
        .section-title { font-size: ${densityConfig.sectionSize}; font-weight: 700; color: ${pc}; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 4px; border-bottom: 2px solid ${pc}; }
        .skill-item { margin-bottom: 8px; }
        .skill-name { display: flex; justify-content: space-between; font-size: ${densityConfig.bodySize}; margin-bottom: 3px; }
        .skill-bar { height: 5px; background: rgba(255,255,255,0.3); border-radius: 2px; }
        .skill-fill { height: 100%; background: #fff; border-radius: 2px; }
      `;

    case 'creative':
      return baseStyles + getPhotoStyles(profile, 90, true) + `
        .header { background: linear-gradient(135deg, ${pc}, ${sc}); color: #fff; padding: 18px 22px; border-radius: 8px; margin-bottom: 14px; display: flex; gap: 16px; align-items: center; }
        .header-info { flex: 1; }
        .name { font-size: ${densityConfig.headingSize}; font-weight: 700; }
        .title { font-size: ${densityConfig.sectionSize}; opacity: 0.9; margin-bottom: 4px; }
        .contact-line { font-size: ${densityConfig.metaSize}; opacity: 0.85; }
        .section-title { font-size: ${densityConfig.sectionSize}; font-weight: 700; color: ${pc}; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .section-title::after { content: ''; flex: 1; height: 2px; background: linear-gradient(to right, ${pc}, transparent); }
        .timeline { border-left: 3px solid ${pc}; padding-left: 14px; }
        .item { margin-bottom: ${densityConfig.itemMargin}; position: relative; }
        .item::before { content: ''; position: absolute; left: -18px; top: 6px; width: 7px; height: 7px; border-radius: 50%; background: ${pc}; }
        .skills-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .skill-item { text-align: center; }
        .skill-circle { width: 40px; height: 40px; border-radius: 50%; border: 2px solid ${pc}; display: flex; align-items: center; justify-content: center; margin: 0 auto 4px; font-weight: 700; font-size: ${densityConfig.metaSize}; color: ${pc}; }
        .skill-name { font-size: ${densityConfig.smallSize}; color: ${tc}; }
      `;

    case 'minimal':
      return baseStyles + getPhotoStyles(profile, 90) + `
        .header { text-align: center; margin-bottom: 18px; }
        .name { font-size: ${densityConfig.headingSize}; font-weight: 300; letter-spacing: 3px; margin-bottom: 4px; text-transform: uppercase; color: ${tc}; }
        .title { font-size: ${densityConfig.sectionSize}; color: ${tc}; opacity: 0.5; letter-spacing: 2px; margin-bottom: 8px; text-transform: uppercase; }
        .contact-line { font-size: ${densityConfig.metaSize}; color: ${tc}; opacity: 0.7; }
        .section-title { font-size: ${densityConfig.sectionSize}; font-weight: 600; letter-spacing: 2px; color: ${tc}; margin-bottom: 8px; text-transform: uppercase; border-bottom: 1px solid ${tc}20; padding-bottom: 4px; }
        .item { margin-bottom: ${densityConfig.itemMargin}; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
        .skills-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-tag { padding: 4px 10px; background: ${tc}08; border-radius: 4px; font-size: ${densityConfig.metaSize}; color: ${tc}; border: 1px solid ${tc}15; }
      `;

    case 'executive':
      return baseStyles + getPhotoStyles(profile, 95) + `
        .header { text-align: center; border-bottom: 3px double ${pc}; padding-bottom: 14px; margin-bottom: 16px; }
        .name { font-size: ${densityConfig.headingSize}; font-weight: 700; color: ${pc}; margin-bottom: 4px; letter-spacing: 1px; }
        .title { font-size: ${densityConfig.sectionSize}; color: ${tc}; opacity: 0.6; margin-bottom: 8px; letter-spacing: 1px; }
        .contact-info { display: flex; justify-content: center; gap: 16px; color: ${tc}; opacity: 0.7; flex-wrap: wrap; font-size: ${densityConfig.metaSize}; }
        .section-title { font-size: ${densityConfig.sectionSize}; font-weight: 700; color: ${pc}; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 2px; }
        .section-title::before { content: '— '; color: ${pc}; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
        .skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 20px; }
        .skill-item { display: flex; justify-content: space-between; font-size: ${densityConfig.bodySize}; }
      `;

    case 'corporate':
      return baseStyles + getPhotoStyles(profile, 80) + `
        .cv-container { display: flex; padding: 0; }
        .sidebar { width: 25%; background: ${pc}08; border-right: 3px solid ${pc}; padding: ${densityConfig.padding}; }
        .main { width: 75%; padding: ${densityConfig.padding}; }
        .name { font-size: ${densityConfig.headingSize}; font-weight: 700; color: ${pc}; margin-bottom: 4px; }
        .title { font-size: ${densityConfig.sectionSize}; color: ${tc}; opacity: 0.6; margin-bottom: 12px; }
        .sidebar-title { font-size: ${densityConfig.metaSize}; font-weight: 700; color: ${pc}; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
        .contact-item { margin-bottom: 6px; font-size: ${densityConfig.metaSize}; color: ${tc}; }
        .section-title { font-size: ${densityConfig.sectionSize}; font-weight: 700; color: ${pc}; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 4px; border-bottom: 2px solid ${pc}; }
        .skills-list { display: flex; flex-direction: column; gap: 6px; }
        .skill-item { font-size: ${densityConfig.metaSize}; padding: 4px 8px; background: ${pc}10; border-left: 3px solid ${pc}; border-radius: 2px; }
      `;

    case 'elegant':
      return baseStyles + getPhotoStyles(profile, 100) + `
        .header { text-align: center; margin-bottom: 20px; position: relative; }
        .header::after { content: ''; display: block; width: 60px; height: 2px; background: ${pc}; margin: 12px auto 0; }
        .name { font-size: ${densityConfig.headingSize}; font-weight: 400; color: ${tc}; margin-bottom: 4px; letter-spacing: 2px; font-family: Georgia, serif; }
        .title { font-size: ${densityConfig.sectionSize}; color: ${pc}; font-style: italic; margin-bottom: 8px; }
        .contact-info { display: flex; justify-content: center; gap: 16px; color: ${tc}; opacity: 0.6; flex-wrap: wrap; font-size: ${densityConfig.metaSize}; }
        .section-title { font-size: ${densityConfig.sectionSize}; font-weight: 400; color: ${tc}; margin-bottom: 10px; text-align: center; letter-spacing: 3px; text-transform: uppercase; font-family: Georgia, serif; }
        .section-title::before, .section-title::after { content: '— '; color: ${pc}; }
        .item { margin-bottom: ${densityConfig.itemMargin}; padding-left: 16px; border-left: 1px solid ${pc}40; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
      `;

    case 'tech':
      return baseStyles + getPhotoStyles(profile, 80) + `
        .header { background: ${tc}; color: #fff; padding: 16px 20px; border-radius: 4px; margin-bottom: 14px; border-left: 4px solid ${pc}; }
        .name { font-size: ${densityConfig.headingSize}; font-weight: 700; color: ${pc}; font-family: 'Courier New', monospace; }
        .title { font-size: ${densityConfig.sectionSize}; color: #fff; opacity: 0.8; margin-bottom: 6px; font-family: 'Courier New', monospace; }
        .contact-info { display: flex; gap: 12px; flex-wrap: wrap; font-size: ${densityConfig.metaSize}; color: ${pc}; font-family: 'Courier New', monospace; }
        .section { background: ${tc}03; padding: 12px; border-radius: 4px; margin-bottom: ${densityConfig.sectionMargin}; border-left: 3px solid ${pc}; }
        .section-title { font-size: ${densityConfig.sectionSize}; font-weight: 700; color: ${pc}; margin-bottom: 8px; font-family: 'Courier New', monospace; }
        .item { margin-bottom: ${densityConfig.itemMargin}; padding: 6px 0; border-bottom: 1px dashed ${tc}20; }
        .item:last-child { border-bottom: none; }
        .skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
        .skill-tag { padding: 4px 10px; background: ${tc}; color: #fff; border-radius: 3px; font-size: ${densityConfig.smallSize}; font-family: 'Courier New', monospace; text-align: center; }
      `;

    case 'infographic':
      return baseStyles + getPhotoStyles(profile, 80) + `
        .header { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; padding: 16px; background: linear-gradient(135deg, ${pc}15, ${sc}15); border-radius: 8px; }
        .header-info { flex: 1; }
        .name { font-size: ${densityConfig.headingSize}; font-weight: 700; color: ${pc}; }
        .title { font-size: ${densityConfig.sectionSize}; color: ${tc}; opacity: 0.7; margin-bottom: 6px; }
        .contact-info { display: flex; gap: 12px; flex-wrap: wrap; font-size: ${densityConfig.metaSize}; }
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: ${densityConfig.sectionMargin}; }
        .stat-card { background: ${pc}10; padding: 10px; border-radius: 6px; text-align: center; border: 1px solid ${pc}30; }
        .stat-number { font-size: ${densityConfig.headingSize}; font-weight: 700; color: ${pc}; }
        .stat-label { font-size: ${densityConfig.smallSize}; color: ${tc}; opacity: 0.7; margin-top: 2px; }
        .section-title { font-size: ${densityConfig.sectionSize}; font-weight: 700; color: ${pc}; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
        .section-title::before { content: '▸'; color: ${pc}; }
        .timeline { border-left: 3px solid ${pc}; padding-left: 14px; }
        .item { margin-bottom: ${densityConfig.itemMargin}; position: relative; }
        .item::before { content: ''; position: absolute; left: -18px; top: 8px; width: 8px; height: 8px; border-radius: 50%; background: ${pc}; border: 2px solid #fff; box-shadow: 0 0 0 2px ${pc}; }
      `;

    case 'bold':
      return baseStyles + getPhotoStyles(profile, 90) + `
        .header { margin-bottom: 16px; }
        .name { font-size: ${densityConfig.headingSize}; font-weight: 900; color: ${tc}; line-height: 1.1; margin-bottom: 4px; }
        .name span { color: ${pc}; }
        .title { font-size: ${densityConfig.sectionSize}; font-weight: 600; color: ${pc}; margin-bottom: 8px; }
        .contact-info { display: flex; gap: 12px; flex-wrap: wrap; font-size: ${densityConfig.metaSize}; color: ${tc}; }
        .section-title { font-size: ${densityConfig.sectionSize}; font-weight: 900; color: #fff; background: ${pc}; padding: 6px 14px; border-radius: 4px; display: inline-block; margin-bottom: 10px; }
        .item { margin-bottom: ${densityConfig.itemMargin}; padding: 10px; border-left: 4px solid ${pc}; background: ${pc}08; border-radius: 0 6px 6px 0; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
        .skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 16px; }
        .skill-item { display: flex; align-items: center; gap: 8px; font-size: ${densityConfig.bodySize}; }
        .skill-bar { flex: 1; height: 8px; background: ${tc}15; border-radius: 4px; overflow: hidden; }
        .skill-fill { height: 100%; background: ${pc}; border-radius: 4px; }
      `;

    case 'compact':
      return baseStyles + getPhotoStyles(profile, 70) + `
        .header { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; border-bottom: 2px solid ${pc}; padding-bottom: 10px; }
        .header-info { flex: 1; }
        .name { font-size: ${densityConfig.headingSize}; font-weight: 700; color: ${tc}; }
        .title { font-size: ${densityConfig.sectionSize}; color: ${pc}; margin-bottom: 4px; }
        .contact-info { display: flex; gap: 8px; flex-wrap: wrap; font-size: ${densityConfig.metaSize}; color: ${tc}; opacity: 0.7; }
        .section-title { font-size: ${densityConfig.sectionSize}; font-weight: 700; color: ${pc}; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid ${pc}40; padding-bottom: 2px; }
        .item { margin-bottom: ${densityConfig.itemMargin}; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; flex-wrap: wrap; }
        .item-title { font-size: ${densityConfig.itemTitleSize}; font-weight: 700; color: ${tc}; }
        .item-subtitle { font-size: ${densityConfig.metaSize}; color: ${pc}; }
        .item-date { font-size: ${densityConfig.smallSize}; color: ${tc}; opacity: 0.6; }
        .item-desc { font-size: ${densityConfig.metaSize}; color: ${tc}; opacity: 0.8; margin-top: 2px; line-height: 1.3; }
        .skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 12px; }
        .skill-item { font-size: ${densityConfig.metaSize}; padding: 3px 8px; background: ${pc}10; border-radius: 3px; }
      `;

    case 'professional':
      return baseStyles + getPhotoStyles(profile, 95) + `
        .header { text-align: center; border-top: 4px solid ${pc}; border-bottom: 1px solid ${pc}40; padding: 16px 0; margin-bottom: 16px; }
        .name { font-size: ${densityConfig.headingSize}; font-weight: 700; color: ${tc}; margin-bottom: 4px; }
        .title { font-size: ${densityConfig.sectionSize}; color: ${pc}; font-weight: 600; margin-bottom: 8px; }
        .contact-info { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; font-size: ${densityConfig.metaSize}; color: ${tc}; }
        .section { margin-bottom: ${densityConfig.sectionMargin}; }
        .section-title { font-size: ${densityConfig.sectionSize}; font-weight: 700; color: ${pc}; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid ${pc}; display: flex; align-items: center; gap: 8px; }
        .section-title::before { content: ''; width: 8px; height: 8px; background: ${pc}; border-radius: 50%; }
        .item { margin-bottom: ${densityConfig.itemMargin}; padding: 8px 12px; background: ${pc}05; border-radius: 6px; border-left: 3px solid ${pc}; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
        .skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 20px; }
        .skill-item { display: flex; align-items: center; gap: 8px; font-size: ${densityConfig.bodySize}; }
        .skill-bar { flex: 1; height: 6px; background: ${pc}20; border-radius: 3px; overflow: hidden; }
        .skill-fill { height: 100%; background: linear-gradient(to right, ${pc}, ${sc}); border-radius: 3px; }
      `;

    default:
      return baseStyles;
  }
}


// ===================== CONTENT =====================

function generateCVContent(profile: any, template: TemplateType, sections: SectionVisibility, colorOverrides?: ColorOverrides, qrColumnHtml?: string, qrBottomHtml?: string): string {
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
      return `<div class="cv-container"><div class="header">${ph}<div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-info">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div>${profile.bio ? `<div class="section"><div class="section-title">Perfil Profesional</div><p style="font-size:8pt;color:${tc};opacity:0.7">${profile.bio}</p></div>` : ''}${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia Laboral</div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="skills-grid">${profile.skills.map((s: any) => `<div class="skill-item"><span style="font-size:7.5pt;width:70px;color:${tc}">${s.name}</span><div class="skill-bar"><div class="skill-fill" style="width:${s.level}%"></div></div><span style="font-size:7pt;color:${tc};opacity:0.5">${s.level}%</span></div>`).join('')}</div></div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos Destacados</div>${projHtml(3)}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificaciones</div>${certHtml('normal')}</div>` : ''}${qrBottomHtml || ''}</div>`;

    case 'modern':
      return `<div class="cv-container"><div class="sidebar">${ph}<div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="sidebar-section"><div class="sidebar-title">Contacto</div>${contactHtml()}</div>` : ''}${sections.skills && profile.skills?.length ? `<div class="sidebar-section"><div class="sidebar-title">Habilidades</div>${profile.skills.map((s: any) => `<div class="skill-item"><div class="skill-name"><span>${s.name}</span><span>${s.level}%</span></div><div class="skill-bar"><div class="skill-fill" style="width:${s.level}%"></div></div></div>`).join('')}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="sidebar-section"><div class="sidebar-title">Certificados</div>${certHtml('simple')}</div>` : ''}${qrColumnHtml || ''}</div><div class="main">${profile.bio ? `<div class="section"><div class="section-title">Perfil</div><p style="font-size:8pt;color:${tc};opacity:0.7">${profile.bio}</p></div>` : ''}${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(4)}</div>` : ''}</div></div>`;

    case 'creative':
      return `<div class="cv-container"><div class="header">${ph}<div class="header-info"><div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-line">${[profile.email, profile.phone, profile.location].filter(Boolean).join(' · ')}</div>` : ''}</div></div>${profile.bio ? `<div class="section"><p style="font-size:8pt;color:${tc};opacity:0.7;text-align:center">${profile.bio}</p></div>` : ''}${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div><div class="timeline">${work.map((e: any) => `<div class="item"><div class="item-title">${e.title}</div><div class="item-subtitle">${e.company} · ${e.startDate} - ${e.endDate || 'Presente'}</div></div>`).join('')}</div></div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div><div class="timeline">${edu.map((e: any) => `<div class="item"><div class="item-title">${e.title}</div><div class="item-subtitle">${e.company} · ${e.startDate} - ${e.endDate || 'Presente'}</div></div>`).join('')}</div></div>` : ''}${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="skills-grid">${profile.skills.map((s: any) => `<div class="skill-item"><div class="skill-circle">${s.level}%</div><div class="skill-name">${s.name}</div></div>`).join('')}</div></div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(3)}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificados</div>${certHtml('tag')}</div>` : ''}${qrBottomHtml || ''}</div>`;

    case 'minimal':
      return `<div class="cv-container"><div class="header">${ph}<div class="name">${profile.name.toUpperCase()}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-line">${[profile.email, profile.phone, profile.location].filter(Boolean).join(' &middot; ')}</div>` : ''}</div>${profile.bio ? `<div class="section"><p style="color:${tc};opacity:0.7;text-align:center;font-size:8.5pt">${profile.bio}</p></div>` : ''}${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="skills-list">${profile.skills.map((s: any) => `<span class="skill-tag">${s.name}</span>`).join('')}</div></div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(3)}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificaciones</div>${certHtml('tag')}</div>` : ''}${qrBottomHtml || ''}</div>`;

    case 'executive':
      return `<div class="cv-container"><div class="header-band">${ph}<div class="header-text"><div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-row">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div></div><div class="body-cols"><div class="col-left">${profile.bio ? `<div class="section"><div class="section-title">Perfil Profesional</div><p style="font-size:7.5pt;color:${tc};opacity:0.7">${profile.bio}</p></div>` : ''}${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(3)}</div>` : ''}</div><div class="col-right">${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div>${profile.skills.map((s: any) => `<div class="skill-item"><div class="skill-name"><span>${s.name}</span><span>${s.level}%</span></div><div class="skill-bar"><div class="skill-fill" style="width:${s.level}%"></div></div></div>`).join('')}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificados</div>${certHtml('simple')}</div>` : ''}${qrColumnHtml || ''}</div></div></div>`;

    case 'corporate':
      return `<div class="cv-container"><div class="header">${ph}<div class="header-main"><div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-info">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div></div>${profile.bio ? `<div class="section"><div class="section-title">Perfil Profesional</div><p style="font-size:7.5pt;color:${tc};opacity:0.7">${profile.bio}</p></div>` : ''}${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia Laboral</div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="skills-grid">${profile.skills.map((s: any) => `<span class="skill-tag">${s.name}</span>`).join('')}</div></div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(3)}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificaciones</div>${certHtml('simple')}</div>` : ''}${qrBottomHtml || ''}</div>`;

    case 'elegant':
      return `<div class="cv-container"><div class="inner"><div class="header">${ph}<div class="name">${profile.name.toUpperCase()}</div><div class="name-line"><span>&#9670;</span></div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-line">${[profile.email, profile.phone, profile.location].filter(Boolean).join(' &middot; ')}</div>` : ''}</div>${profile.bio ? `<div class="section"><div class="section-divider"></div><p style="font-size:8pt;color:${tc};opacity:0.7;text-align:center;font-style:italic">${profile.bio}</p></div>` : ''}${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div><div class="section-divider"></div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div><div class="section-divider"></div>${eduHtml()}</div>` : ''}${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="section-divider"></div><div class="skills-list">${profile.skills.map((s: any) => `<span class="skill-tag">${s.name}</span>`).join('')}</div></div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div><div class="section-divider"></div>${projHtml(3)}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificaciones</div><div class="section-divider"></div>${certHtml('tag')}</div>` : ''}${qrBottomHtml || ''}</div></div>`;

    case 'tech':
      return `<div class="cv-container"><div class="header">${ph}<div class="header-info"><div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-line">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div></div>${profile.bio ? `<div class="section"><div class="section-title">about()</div><p style="font-size:7.5pt;color:#555">${profile.bio}</p></div>` : ''}${sections.experience && work.length ? `<div class="section"><div class="section-title">experience()</div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">education()</div>${eduHtml()}</div>` : ''}${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">skills()</div><div class="skills-grid">${profile.skills.map((s: any) => `<span class="skill-tag">${s.name}</span>`).join('')}</div></div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">projects()</div>${projHtml(4)}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">certifications()</div>${certHtml('simple')}</div>` : ''}${qrBottomHtml || ''}</div>`;

    case 'infographic':
      return `<div class="cv-container"><div class="header">${ph}<div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-row">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div>${profile.bio ? `<div style="font-size:8pt;color:${tc};opacity:0.7;text-align:center;margin-bottom:8px">${profile.bio}</div>` : ''}<div class="cols"><div class="col-left">${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(3)}</div>` : ''}</div><div class="col-right">${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="skills-visual">${profile.skills.map((s: any) => {
        const level = s.level || 50;
        const bg = level >= 80 ? pc : level >= 60 ? sc : `${tc}40`;
        return `<span class="skill-pill" style="background:${bg}">${s.name}</span>`;
      }).join('')}</div></div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificados</div>${certHtml('badge')}</div>` : ''}${qrColumnHtml || ''}</div></div></div>`;

    case 'bold':
      return `<div class="cv-container"><div class="header">${ph}<div class="header-info"><div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-row">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div></div><div class="body-content"><div class="cols"><div class="col-main">${profile.bio ? `<div class="section"><div class="section-title">Perfil</div><p style="font-size:8pt;color:${tc};opacity:0.7">${profile.bio}</p></div>` : ''}${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(4)}</div>` : ''}</div><div class="col-side">${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Skills</div>${profile.skills.map((s: any) => `<div class="skill-bar-full"><div class="skill-label"><span>${s.name}</span><span>${s.level}%</span></div><div class="skill-track"><div class="skill-progress" style="width:${s.level}%"></div></div></div>`).join('')}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificados</div>${certHtml('simple')}</div>` : ''}${qrColumnHtml || ''}</div></div></div>`;

    case 'compact':
      return `<div class="cv-container"><div class="header">${ph}<div class="header-info"><div class="name">${profile.name}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-row">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div></div>${profile.bio ? `<div style="font-size:7.5pt;color:${tc};opacity:0.7;margin-bottom:6px">${profile.bio}</div>` : ''}<div class="cols"><div class="col-left">${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div>${workHtml(false)}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(4)}</div>` : ''}</div><div class="col-right">${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div><div class="skills-grid">${profile.skills.map((s: any) => `<span class="skill-tag">${s.name}</span>`).join('')}</div></div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificados</div>${certHtml('simple')}</div>` : ''}${qrColumnHtml || ''}</div></div></div>`;

    case 'professional':
      return `<div class="cv-container"><div class="header">${ph}<div class="header-text"><div class="name">${profile.name.split(' ').map((n: string, i: number) => i === 0 ? n : `<span class="name-accent">${n}</span>`).join(' ')}</div><div class="title">${profile.title}</div>${sections.contact ? `<div class="contact-row">${[profile.email ? `📧 ${profile.email}` : '', profile.phone ? `📱 ${profile.phone}` : '', profile.location ? `📍 ${profile.location}` : ''].filter(Boolean).join('')}</div>` : ''}</div></div>${profile.bio ? `<div class="summary">${profile.bio}</div>` : ''}<div class="cols"><div class="col-left">${sections.experience && work.length ? `<div class="section"><div class="section-title">Experiencia</div>${workHtml()}</div>` : ''}${sections.experience && edu.length ? `<div class="section"><div class="section-title">Educación</div>${eduHtml()}</div>` : ''}${sections.projects && profile.projects?.length ? `<div class="section"><div class="section-title">Proyectos</div>${projHtml(3)}</div>` : ''}</div><div class="col-right">${sections.skills && profile.skills?.length ? `<div class="section"><div class="section-title">Habilidades</div>${profile.skills.map((s: any) => `<div class="skill-item"><div class="skill-name"><span>${s.name}</span><span>${s.level}%</span></div><div class="skill-bar"><div class="skill-fill" style="width:${s.level}%"></div></div></div>`).join('')}</div>` : ''}${sections.certificates && profile.certificates?.length ? `<div class="section"><div class="section-title">Certificados</div>${certHtml('simple')}</div>` : ''}${qrColumnHtml || ''}</div></div></div>`;

    default:
      return '';
  }
}
