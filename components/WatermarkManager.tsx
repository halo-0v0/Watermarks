import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Watermark } from '../types';

interface WatermarkManagerProps {
  watermarks: Watermark[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (file: File) => void;
  onRemove: (id: string) => void;
}

export const WatermarkManager: React.FC<WatermarkManagerProps> = ({
  watermarks,
  selectedId,
  onSelect,
  onAdd,
  onRemove
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAdd(e.target.files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/70 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Watermarks</h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold bg-[#D2E882] hover:bg-[#c0d670] text-[#1a381d] rounded-md shadow-md transition-all hover:scale-105"
        >
          <Upload size={12} strokeWidth={3} />
          ADD NEW
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1 custom-scrollbar content-start">
        {watermarks.length === 0 && (
          <div className="col-span-2 text-center py-10 text-white/40 text-xs border-2 border-dashed border-white/10 rounded-xl bg-white/5">
            <p className="font-bold mb-1">No watermarks</p>
            <p className="text-[10px] opacity-70">Upload a PNG logo to start</p>
          </div>
        )}
        {watermarks.map((wm) => (
          <div
            key={wm.id}
            onClick={() => onSelect(wm.id)}
            className={`
              relative group cursor-pointer rounded-xl border-2 overflow-hidden aspect-square flex items-center justify-center transition-all duration-200 shadow-md
              ${selectedId === wm.id 
                ? 'border-[#D2E882] bg-black/60 shadow-[0_0_15px_-3px_rgba(210,232,130,0.3)]' 
                : 'border-white/5 bg-black/40 hover:border-white/30 hover:bg-black/50'}
            `}
          >
            {/* Darker Checkerboard background for transparency preview */}
            <div className="absolute inset-0 opacity-10"
                 style={{
                    backgroundImage: 'linear-gradient(45deg, #bbb 25%, transparent 25%), linear-gradient(-45deg, #bbb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #bbb 75%), linear-gradient(-45deg, transparent 75%, #bbb 75%)',
                    backgroundSize: '10px 10px',
                    backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px'
                 }}
            />

            <img
              src={wm.src}
              alt={wm.name}
              className="relative max-w-[80%] max-h-[80%] object-contain z-10 drop-shadow-sm"
            />
            
            {/* Selection Indicator */}
            {selectedId === wm.id && (
              <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#D2E882] rounded-full shadow-[0_0_8px_rgba(210,232,130,0.8)] z-20 ring-2 ring-black/50" />
            )}

            {!wm.isDefault && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(wm.id);
                }}
                className="absolute top-1 left-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 z-20 hover:scale-110 shadow-md"
                title="Remove watermark"
              >
                <X size={12} strokeWidth={3} />
              </button>
            )}
            
            <div className="absolute bottom-0 w-full bg-black/80 backdrop-blur-sm text-[9px] text-center py-1.5 truncate px-1 text-white font-medium z-20 border-t border-white/5">
              {wm.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};