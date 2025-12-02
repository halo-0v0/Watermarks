import React from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, Download, Image as ImageIcon } from 'lucide-react';
import { ImageItem } from '../types';

interface ImageQueueProps {
  images: ImageItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export const ImageQueue: React.FC<ImageQueueProps> = ({
  images,
  selectedId,
  onSelect,
  onRemove
}) => {
  const handleDownload = (e: React.MouseEvent, img: ImageItem) => {
    e.stopPropagation();
    if (!img.processedUrl) return;
    
    const link = document.createElement('a');
    link.href = img.processedUrl;
    const originalName = img.file.name.replace(/\.[^/.]+$/, "");
    link.download = `${originalName}_5120px_watermarked.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/40 p-8 border-2 border-dashed border-white/10 rounded-2xl bg-slate-950/70 backdrop-blur-xl">
        <ImageIcon size={48} className="mb-3 opacity-40" />
        <p className="text-xs font-bold uppercase tracking-wider">No images selected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950/70 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-xl">
      <div className="p-4 border-b border-white/10 bg-black/20 z-10 flex justify-between items-center">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Images ({images.length})</h3>
        <button 
           className="text-[10px] text-[#D2E882] hover:underline"
           onClick={() => {/* Implement clear all if needed */}}
        >
          
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {images.map((img) => (
          <div
            key={img.id}
            onClick={() => onSelect(img.id)}
            className={`
              relative group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border transition-all duration-200
              ${selectedId === img.id 
                ? 'bg-white/10 border-[#D2E882]/50 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]' 
                : 'bg-black/40 border-transparent hover:bg-black/60 hover:border-white/10'}
            `}
          >
            {/* Thumbnail */}
            <div className="relative w-14 h-14 shrink-0 bg-black/50 rounded-lg overflow-hidden border border-white/10 shadow-sm">
              <img 
                src={img.processedUrl || img.previewUrl} 
                alt={img.file.name}
                className={`w-full h-full object-cover transition-opacity ${img.status === 'processing' ? 'opacity-40' : 'opacity-100'}`}
              />
              {img.status === 'processing' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                  <Loader2 size={20} className="text-[#D2E882] animate-spin" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold truncate mb-1 ${selectedId === img.id ? 'text-white' : 'text-white/80'}`}>
                {img.file.name}
              </p>
              <div className="flex items-center gap-2">
                {img.status === 'done' && <span className="text-[10px] text-[#D2E882] flex items-center gap-1 font-bold bg-[#D2E882]/10 px-1.5 py-0.5 rounded-sm"><CheckCircle2 size={10}/> READY</span>}
                {img.status === 'error' && <span className="text-[10px] text-red-400 flex items-center gap-1 font-bold bg-red-900/30 px-1.5 py-0.5 rounded-sm"><AlertCircle size={10}/> ERROR</span>}
                {img.status === 'pending' && <span className="text-[10px] text-white/40 font-mono uppercase">Pending</span>}
                {img.status === 'processing' && <span className="text-[10px] text-[#D2E882] font-mono uppercase animate-pulse">Processing...</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2 border-l border-white/10">
              {img.status === 'done' && (
                <button
                  onClick={(e) => handleDownload(e, img)}
                  className="p-1.5 text-white/70 hover:text-[#D2E882] hover:bg-white/10 rounded-md transition-colors"
                  title="Download"
                >
                  <Download size={16} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(img.id);
                }}
                className="p-1.5 text-white/70 hover:text-red-400 hover:bg-red-900/50 rounded-md transition-colors"
                title="Remove"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};