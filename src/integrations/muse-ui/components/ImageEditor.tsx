import React, { useRef, useEffect, useState } from 'react';
import { I18N } from '../constants';
import type { LangType } from '../types';

interface Props {
  initialImage: string;
  onSave: (base64: string) => void;
  onCancel: () => void;
  lang: LangType;
}

const ImageEditor: React.FC<Props> = ({ initialImage, onSave, onCancel, lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTool, setActiveTool] = useState<'brush' | 'text'>('brush');
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#EF4444'); // Default red
  const [lineWidth, setLineWidth] = useState(5);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Text Input State
  const [textInput, setTextInput] = useState<{ x: number; y: number; value: string; visible: boolean }>({
    x: 0, y: 0, value: '', visible: false
  });

  const t = I18N[lang];

  // Load image onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = initialImage;
    img.onload = () => {
      // Set canvas size to image native size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Save initial state to history
      saveState();
    };
  }, [initialImage]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limit history stack
    if (history.length > 10) {
      setHistory(prev => [...prev.slice(1), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    } else {
      setHistory(prev => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    }
  };

  const undo = () => {
    if (history.length <= 1) return; // Keep initial image
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove current state
    const prevState = newHistory[newHistory.length - 1];

    ctx.putImageData(prevState, 0, 0);
    setHistory(newHistory);
  };

  const clear = () => {
    if (history.length > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.putImageData(history[0], 0, 0);
      setHistory([history[0]]);
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool === 'text') {
      const { x, y } = getCoordinates(e);
      setTextInput({ x, y, value: '', visible: true });
      return;
    }

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || activeTool === 'text') return;
    e.preventDefault(); // Prevent scrolling on touch

    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.closePath();
        saveState();
      }
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.value.trim() || !canvasRef.current) {
      setTextInput({ ...textInput, visible: false });
      return;
    }

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.font = `bold ${lineWidth * 4 + 10}px sans-serif`;
      ctx.fillStyle = color;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.strokeText(textInput.value, textInput.x, textInput.y);
      ctx.fillText(textInput.value, textInput.x, textInput.y);
      saveState();
    }
    setTextInput({ ...textInput, visible: false });
  };

  const handleSave = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL('image/png'));
    }
  };

  // Calculate screen position for text input overlay
  const getScreenPos = (x: number, y: number) => {
    if (!canvasRef.current) return { left: 0, top: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = rect.width / canvasRef.current.width;
    const scaleY = rect.height / canvasRef.current.height;
    return {
      left: rect.left + x * scaleX,
      top: rect.top + y * scaleY
    };
  };

  const screenPos = getScreenPos(textInput.x, textInput.y);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[90vh] flex flex-col bg-stone-900 rounded-xl overflow-hidden border border-stone-700 shadow-2xl relative">

        {/* Header */}
        <div className="p-4 bg-stone-950 border-b border-stone-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-stone-200">{t.editorTitle}</h3>
          <div className="flex gap-2">
            <button
              onClick={undo}
              className="px-3 py-1.5 bg-stone-800 text-stone-300 rounded hover:bg-stone-700 text-sm"
              disabled={history.length <= 1}
            >
              {t.undo}
            </button>
            <button
              onClick={clear}
              className="px-3 py-1.5 bg-stone-800 text-stone-300 rounded hover:bg-stone-700 text-sm"
            >
              {t.clear}
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-stone-800 flex items-center justify-center p-4 relative"
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="shadow-2xl cursor-crosshair max-w-full max-h-full object-contain"
          />

          {/* Text Input Overlay */}
          {textInput.visible && (
            <div
              className="fixed p-2 bg-stone-800 rounded shadow-xl border border-stone-600 z-50 flex gap-2"
              style={{ left: screenPos.left, top: screenPos.top }}
            >
              <input
                autoFocus
                type="text"
                value={textInput.value}
                onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                placeholder={t.textPlaceholder}
                className="bg-stone-900 text-white border border-stone-700 rounded px-2 py-1 text-sm outline-none w-48"
              />
              <button onClick={handleTextSubmit} className="text-green-400 font-bold hover:text-green-300">✓</button>
              <button onClick={() => setTextInput({ ...textInput, visible: false })} className="text-red-400 font-bold hover:text-red-300">✕</button>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex flex-wrap items-center justify-between gap-4">

          <div className="flex items-center gap-6">
            {/* Tools */}
            <div className="flex bg-stone-800 rounded-lg p-1 border border-stone-700">
              <button
                onClick={() => setActiveTool('brush')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTool === 'brush' ? 'bg-stone-600 text-white' : 'text-stone-400 hover:text-stone-200'}`}
              >
                <span>🖌️</span> {t.toolBrush}
              </button>
              <button
                onClick={() => setActiveTool('text')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTool === 'text' ? 'bg-stone-600 text-white' : 'text-stone-400 hover:text-stone-200'}`}
              >
                <span>T</span> {t.toolText}
              </button>
            </div>

            {/* Color Picker */}
            <div className="flex items-center gap-2 border-l border-stone-800 pl-4">
              <span className="text-xs text-stone-500">{t.brushColor}</span>
              <div className="flex gap-1 items-center">
                {['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#FFFFFF', '#000000'].map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                {/* Native Color Picker */}
                <div className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-stone-700 ml-1">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"
                  />
                </div>
              </div>
            </div>

            {/* Size Slider */}
            <div className="flex items-center gap-2 border-l border-stone-800 pl-4">
              <span className="text-xs text-stone-500">{t.brushSize}</span>
              <input
                type="range"
                min="1"
                max="100"
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="w-24 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-stone-500 w-4">{lineWidth}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 rounded-lg font-medium text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-lg font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-lg shadow-teal-900/20"
            >
              {t.regenerate}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
