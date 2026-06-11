
import React, { useRef } from 'react';
import type { DesignSystem, LangType } from '../types';

interface Props {
  designSystem: DesignSystem;
  lang: LangType;
  editable?: boolean;
  onUpdate?: (newDs: DesignSystem) => void;
}

const DesignSpecRenderer: React.FC<Props> = ({ designSystem, lang, editable, onUpdate }) => {
  const { palette, typography, measurements, styles, components, globalStyleConstraint } = designSystem;
  const containerRef = useRef<HTMLDivElement>(null);

  const handleUpdate = (path: string, value: any) => {
      if (!onUpdate) return;
      const newDs = JSON.parse(JSON.stringify(designSystem));
      
      const keys = path.split('.');
      let current = newDs;
      for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      onUpdate(newDs);
  };

  const drawToCanvas = () => {
      if (!containerRef.current) return;
      
      try {
          const clone = containerRef.current.cloneNode(true) as HTMLElement;
          // Ensure clone has explicit background and font
          clone.style.width = '1000px';
          clone.style.height = '1200px';
          clone.style.backgroundColor = '#f8f9fa';
          clone.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
          
          // Collect styles from the current document to embed
          const styleSheets = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
            .map(node => node.outerHTML)
            .join('\n');

          const svgString = new XMLSerializer().serializeToString(clone);
          const svgData = `
            <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1200">
              <foreignObject width="100%" height="100%">
                <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;background:#f8f9fa;color:black;">
                    ${styleSheets}
                    ${svgString}
                </div>
              </foreignObject>
            </svg>
          `;
          
          const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          
          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = 1000;
              canvas.height = 1200;
              const ctx = canvas.getContext("2d");
              if(ctx) {
                  ctx.fillStyle = '#f8f9fa';
                  ctx.fillRect(0,0,1000,1200);
                  ctx.drawImage(img, 0, 0);
                  const pngUrl = canvas.toDataURL("image/png");
                  const link = document.createElement("a");
                  link.href = pngUrl;
                  link.download = "design-spec.png";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
              }
          };
          img.onerror = (e) => {
              console.error("Image loading failed", e);
              alert(lang === 'zh' ? '导出图片失败，尝试下载JSON。' : 'Image export failed, downloading JSON.');
              fallbackToJson();
          };
          img.src = url;
      } catch (e) {
          console.error("Image export exception", e);
          alert(lang === 'zh' ? '导出错误，将下载JSON备份。' : 'Export error, downloading JSON backup.');
          fallbackToJson();
      }
  };

  const fallbackToJson = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(designSystem, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", "design_spec.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const InputOrText = ({ 
      value, 
      path, 
      className = "",
      type = "text"
  }: { value: string | number, path: string, className?: string, type?: string }) => {
      if (editable) {
          return (
              <input 
                type={type}
                value={value}
                onChange={(e) => handleUpdate(path, e.target.value)}
                className={`bg-transparent border-b border-stone-300 focus:border-teal-500 focus:outline-none px-1 ${className}`}
                onMouseDown={(e) => e.stopPropagation()} 
              />
          );
      }
      return <span className={className}>{value}</span>;
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-[#f8f9fa] text-stone-800 p-8 overflow-y-auto font-sans shadow-inner relative">
      
      {/* Action Bar */}
      {editable && (
          <div className="absolute top-4 right-4 z-10 print:hidden" data-html2canvas-ignore="true">
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    drawToCanvas();
                }}
                className="bg-teal-600 text-white px-4 py-2 rounded shadow hover:bg-teal-500 text-xs font-bold"
                onMouseDown={(e) => e.stopPropagation()}
              >
                  {lang === 'zh' ? '保存为图片' : 'Save as Image'}
              </button>
          </div>
      )}

      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        <div className="border-b-2 border-stone-200 pb-4">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Design System Specification</h1>
          <p className="text-stone-500 mt-2">Auto-generated Standardization Guide</p>
        </div>

        {/* Global Constraint */}
        <section className="bg-stone-200/50 p-4 rounded-lg border-l-4 border-teal-500">
            <h3 className="text-xs font-bold uppercase text-stone-500 mb-2">Global Style Constraint</h3>
            {editable ? (
                <textarea 
                    value={globalStyleConstraint || ''}
                    onChange={(e) => handleUpdate('globalStyleConstraint', e.target.value)}
                    className="w-full bg-transparent text-sm text-stone-800 focus:outline-none resize-y min-h-[60px]"
                    onMouseDown={(e) => e.stopPropagation()}
                />
            ) : (
                <p className="text-sm text-stone-800 italic">{globalStyleConstraint || 'No global constraints defined.'}</p>
            )}
        </section>

        {/* 1. Colors */}
        <section>
          <h2 className="text-xl font-bold mb-6 text-stone-700 uppercase tracking-wider flex items-center gap-2">
            <span className="w-4 h-4 bg-teal-500 rounded-full"></span> Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {palette.map((color, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div 
                  className="w-full aspect-video rounded-lg shadow-sm border border-stone-200 relative group overflow-hidden" 
                  style={{ backgroundColor: color.hex }}
                >
                    {editable && (
                        <input 
                            type="color" 
                            value={color.hex}
                            onChange={(e) => handleUpdate(`palette.${idx}.hex`, e.target.value)}
                            // Changed: Ensure z-index is high and full size
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            onMouseDown={(e) => e.stopPropagation()}
                        />
                    )}
                </div>
                <div className="flex flex-col">
                  <InputOrText value={color.name} path={`palette.${idx}.name`} className="font-bold text-sm text-stone-800 block w-full" />
                  <InputOrText value={color.hex} path={`palette.${idx}.hex`} className="font-mono text-xs text-stone-500 uppercase block w-full" />
                  <InputOrText value={color.usage} path={`palette.${idx}.usage`} className="text-[10px] text-stone-400 mt-1 block w-full" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Typography */}
        <section>
          <h2 className="text-xl font-bold mb-6 text-stone-700 uppercase tracking-wider flex items-center gap-2">
            <span className="w-4 h-4 bg-teal-500 rounded-full"></span> Typography
          </h2>
          <div className="space-y-6">
            {typography.map((type, idx) => (
              <div key={idx} className="flex items-baseline border-b border-stone-100 pb-4 last:border-0">
                <div className="w-32 flex-shrink-0 text-xs text-stone-400 font-mono flex flex-col gap-1">
                  <InputOrText value={type.name} path={`typography.${idx}.name`} />
                  <div className="flex gap-1">
                      <InputOrText value={type.size} path={`typography.${idx}.size`} className="w-12" />
                      / 
                      <InputOrText value={type.weight} path={`typography.${idx}.weight`} className="w-12" />
                  </div>
                </div>
                <div className="flex-1 text-stone-800" style={{ fontSize: type.size, fontWeight: type.weight }}>
                  The quick brown fox jumps over the lazy dog.
                </div>
                <div className="w-48 text-xs text-stone-500 text-right">
                    <InputOrText value={type.usage} path={`typography.${idx}.usage`} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Measurements & Styles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section>
              <h2 className="text-xl font-bold mb-6 text-stone-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-4 h-4 bg-green-500 rounded-full"></span> Properties
              </h2>
              <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-6">
                  {/* Dimensions */}
                  <div className="space-y-4">
                      <h4 className="text-xs font-bold text-stone-400 uppercase">Dimensions</h4>
                      <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Border Radius</span>
                          <div className="flex items-center gap-2">
                              <div className="w-8 h-8 border-2 border-stone-800" style={{ borderRadius: measurements.borderRadius }}></div>
                              <InputOrText value={measurements.borderRadius} path="measurements.borderRadius" className="text-xs bg-stone-100 px-2 py-1 rounded w-20 text-center" />
                          </div>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Spacing Unit</span>
                          <div className="flex items-center gap-2">
                              <div className="h-4 bg-pink-300" style={{ width: measurements.spacingUnit }}></div>
                              <InputOrText value={measurements.spacingUnit} path="measurements.spacingUnit" className="text-xs bg-stone-100 px-2 py-1 rounded w-20 text-center" />
                          </div>
                      </div>
                  </div>
                  <hr className="border-stone-100" />
                  {/* Shadows */}
                  <div className="space-y-4">
                      <h4 className="text-xs font-bold text-stone-400 uppercase">Shadows</h4>
                      {styles.shadows && Object.entries(styles.shadows).map(([key, val]) => (
                          <div key={key} className="flex justify-between items-center">
                              <span className="text-sm font-medium capitalize">{key}</span>
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-white rounded" style={{ boxShadow: val as string }}></div>
                                  <InputOrText value={val as string} path={`styles.shadows.${key}`} className="text-[10px] bg-stone-100 px-2 py-1 rounded w-32 font-mono truncate" />
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
            </section>

            {/* 4. Components Preview */}
            <section>
              <h2 className="text-xl font-bold mb-6 text-stone-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-4 h-4 bg-cyan-500 rounded-full"></span> Components
              </h2>
              <div className="bg-stone-100 p-8 rounded-xl flex flex-col gap-6 items-start justify-center min-h-[300px]">
                  <div className="w-full">
                      <span className="text-[10px] text-stone-400 block mb-2">Primary Button</span>
                      <button 
                        style={{ 
                            backgroundColor: components.buttonPrimary.bg,
                            color: components.buttonPrimary.text,
                            borderRadius: components.buttonPrimary.radius,
                            padding: `${measurements.spacingUnit} calc(${measurements.spacingUnit} * 2)`,
                            boxShadow: styles.shadows?.medium || 'none',
                            border: 'none',
                            fontWeight: 'bold',
                            cursor: 'default'
                        }}
                      >
                        Primary Button
                      </button>
                  </div>
                  <div className="w-full">
                    <span className="text-[10px] text-stone-400 block mb-2">Content Card</span>
                    <div
                        style={{
                            backgroundColor: components.card.bg,
                            border: components.card.border,
                            borderRadius: components.card.radius,
                            padding: `calc(${measurements.spacingUnit} * 1.5)`,
                            boxShadow: styles.shadows?.medium || 'none',
                            width: '100%'
                        }}
                    >
                        <h4 style={{ marginBottom: measurements.gap, fontWeight: 'bold' }}>Card Component</h4>
                        <p className="text-sm opacity-80">Standardized card using generated tokens.</p>
                    </div>
                  </div>
              </div>
            </section>
        </div>
      </div>
    </div>
  );
};

export default DesignSpecRenderer;
