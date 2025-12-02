import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, Loader2, Plus, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { Watermark, ImageItem } from './types';
import { WatermarkManager } from './components/WatermarkManager';
import { ImageQueue } from './components/ImageQueue';
import { OwlLogo } from './components/icons/OwlLogo';
import { processImage } from './utils/imageProcessing';
import { createZipFromImages } from './utils/zipUtils';
import { INITIAL_WATERMARKS } from './config/defaults';

export default function App() {
  // State
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [watermarks, setWatermarks] = useState<Watermark[]>(INITIAL_WATERMARKS);
  const [selectedWatermarkId, setSelectedWatermarkId] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  // Derived
  const selectedWatermark = watermarks.find(w => w.id === selectedWatermarkId);
  const selectedImage = images.find(img => img.id === selectedImageId);

  // --- Handlers ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      const newImages: ImageItem[] = files.map(file => {
        const url = URL.createObjectURL(file);
        return {
          id: Math.random().toString(36).substring(2, 9),
          file,
          previewUrl: url,
          processedUrl: null,
          status: 'pending',
          lastWatermarkId: null,
          width: 0,
          height: 0
        };
      });

      setImages(prev => {
        const updated = [...prev, ...newImages];
        if (!selectedImageId && updated.length > 0) {
          setSelectedImageId(updated[0].id);
        }
        return updated;
      });
      
      e.target.value = '';
    }
  };

  const handleWatermarkUpload = (file: File) => {
    if (file.type !== 'image/png') {
      alert("Please upload a PNG file for watermarks.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const newWatermark: Watermark = {
        id: Date.now().toString(),
        name: file.name.replace('.png', ''),
        src,
        isDefault: false
      };
      setWatermarks(prev => [...prev, newWatermark]);
      setSelectedWatermarkId(newWatermark.id);
    };
    reader.readAsDataURL(file);
  };

  const handleWatermarkRemove = (id: string) => {
    setWatermarks(prev => prev.filter(w => w.id !== id));
    if (selectedWatermarkId === id) {
      setSelectedWatermarkId(null);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const next = prev.filter(img => img.id !== id);
      if (selectedImageId === id) {
        setSelectedImageId(next[0]?.id || null);
      }
      return next;
    });
  };

  // --- Processing Logic ---

  useEffect(() => {
    if (!selectedWatermark) return;

    // Filter images that need processing:
    // 1. Status is pending
    // 2. Status is done but watermark changed
    // 3. Status is error but watermark changed
    const imagesToProcess = images.filter(img => 
      (img.status === 'pending' || (img.status === 'done' && img.lastWatermarkId !== selectedWatermark.id) || (img.status === 'error' && img.lastWatermarkId !== selectedWatermark.id))
    );

    if (imagesToProcess.length === 0) return;

    setImages(prev => prev.map(img => 
      imagesToProcess.find(p => p.id === img.id) 
        ? { ...img, status: 'processing', error: undefined } 
        : img
    ));

    imagesToProcess.forEach(async (imgItem) => {
      try {
        const resultUrl = await processImage(
          imgItem.previewUrl,
          selectedWatermark.src
        );

        setImages(prev => prev.map(current => 
          current.id === imgItem.id 
            ? { 
                ...current, 
                processedUrl: resultUrl, 
                status: 'done', 
                lastWatermarkId: selectedWatermark.id 
              }
            : current
        ));
      } catch (err) {
        console.error("Processing error", err);
        setImages(prev => prev.map(current => 
          current.id === imgItem.id 
            ? { ...current, status: 'error', error: "Failed to process" }
            : current
        ));
      }
    });

  }, [images, selectedWatermark, selectedWatermarkId]);

  // --- Bulk Download ---

  const handleBulkDownload = async () => {
    const processedImages = images
      .filter(img => img.status === 'done' && img.processedUrl)
      .map(img => ({
        name: `${img.file.name.replace(/\.[^/.]+$/, "")}_5120px_watermarked.jpg`,
        url: img.processedUrl!
      }));

    if (processedImages.length === 0) return;

    setIsZipping(true);
    try {
      const blob = await createZipFromImages(processedImages);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'watermarked_images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Zip failed", e);
      alert("Failed to create zip file");
    } finally {
      setIsZipping(false);
    }
  };

  return (
    // Root container
    <div className="min-h-screen flex flex-col font-sans text-stone-100">
      
      {/* High Contrast Glass Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-slate-950/80 border-b border-white/20 shadow-xl">
        <div className="max-w-[1600px] mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-1 bg-white/10 rounded-full border border-white/10">
              <OwlLogo />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-md">ウォーターマークつける君</h1>
              <p className="text-xs text-[#D2E882] font-medium opacity-90">Secure High-Res Resizing</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {images.some(img => img.status === 'done') && (
               <button
                 onClick={handleBulkDownload}
                 disabled={isZipping}
                 className="flex items-center gap-2 bg-[#519554] hover:bg-[#438045] text-white border border-white/30 px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5"
               >
                 {isZipping ? <Loader2 className="animate-spin" size={16}/> : <Download size={16} />}
                 Download All
               </button>
             )}
            <label className="flex items-center gap-2 bg-[#D2E882] hover:bg-[#c0d670] text-[#1a381d] px-5 py-2.5 rounded-lg cursor-pointer text-sm font-bold shadow-[0_4px_14px_0_rgba(210,232,130,0.39)] transition-all hover:shadow-[0_6px_20px_rgba(210,232,130,0.23)] hover:-translate-y-0.5 border border-[#c3d975]">
              <Plus size={18} strokeWidth={3} />
              Add Images
              <input type="file" className="hidden" accept="image/png, image/jpeg" multiple onChange={handleImageUpload} />
            </label>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 gap-6 grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-90px)]">
        
        {/* Left Column: Watermarks & Images List (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4 order-2 lg:order-1 h-full overflow-hidden">
          {/* Watermark Manager */}
          <div className="flex-1 min-h-[250px] flex flex-col">
             <WatermarkManager 
                watermarks={watermarks}
                selectedId={selectedWatermarkId}
                onSelect={setSelectedWatermarkId}
                onAdd={handleWatermarkUpload}
                onRemove={handleWatermarkRemove}
             />
          </div>
          
          {/* Image List */}
          <div className="flex-[1.5] min-h-[300px] flex flex-col">
            <ImageQueue 
              images={images}
              selectedId={selectedImageId}
              onSelect={setSelectedImageId}
              onRemove={removeImage}
            />
          </div>
        </div>

        {/* Right Column: Preview (9 cols) - Darker Glass Card for Contrast */}
        <div className="lg:col-span-9 flex flex-col order-1 lg:order-2 h-full bg-slate-950/70 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
            {/* Preview Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
              <h2 className="text-sm font-bold text-white truncate max-w-[50%] flex items-center gap-2">
                <ImageIcon size={16} className="text-[#D2E882]"/>
                {selectedImage ? selectedImage.file.name : 'No image selected'}
              </h2>
              
              {selectedImage?.processedUrl && (
                <a
                  href={selectedImage.processedUrl}
                  download={`${selectedImage.file.name.replace(/\.[^/.]+$/, "")}_5120px_watermarked.jpg`}
                  className="flex items-center gap-2 text-[#D2E882] hover:text-[#e4f5a3] bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md text-xs font-bold transition-all border border-white/10"
                >
                  <Download size={14} />
                  Download Current
                </a>
              )}
            </div>

            {/* Canvas Area */}
            <div className="relative flex-1 flex items-center justify-center p-8 overflow-hidden checkerboard-bg">
              {/* Subtle Texture Overlay */}
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-white mix-blend-overlay"></div>

              {!selectedImage ? (
                <div className="text-center text-white/50">
                  <ImageIcon size={80} className="mx-auto mb-6 opacity-30" />
                  <p className="text-xl font-light tracking-wide">Select or upload an image to preview</p>
                </div>
              ) : selectedImage.status === 'processing' ? (
                 <div className="text-center bg-black/60 p-10 rounded-2xl backdrop-blur border border-white/20 shadow-2xl">
                    <Loader2 size={56} className="mx-auto mb-6 text-[#D2E882] animate-spin" />
                    <p className="text-white font-bold text-xl">Processing...</p>
                    <p className="text-white/70 text-sm mt-2">Resizing to 5120px & Watermarking</p>
                 </div>
              ) : selectedImage.status === 'error' ? (
                <div className="text-red-200 flex flex-col items-center bg-red-950/60 p-8 rounded-xl border border-red-500/40 backdrop-blur-md">
                  <AlertTriangle size={40} className="mb-3 text-red-500" />
                  <p className="font-bold">Error processing image</p>
                </div>
              ) : selectedImage.processedUrl ? (
                <div className="relative w-full h-full flex items-center justify-center group">
                   <img 
                      src={selectedImage.processedUrl} 
                      alt="Processed" 
                      className="max-w-full max-h-full object-contain shadow-2xl rounded-sm ring-1 ring-white/10"
                   />
                   <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-lg font-mono tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                      5120px • Watermarked
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                   {!selectedWatermark ? (
                     <div className="bg-[#519554]/20 border border-[#D2E882]/40 p-8 rounded-2xl flex flex-col items-center max-w-sm text-center backdrop-blur-md shadow-2xl">
                       <AlertTriangle className="mb-4 text-[#D2E882]" size={48}/>
                       <p className="text-white font-bold text-xl mb-1">No Watermark Selected</p>
                       <p className="text-sm text-white/80 leading-relaxed">Please add and select a watermark logo (PNG) to start processing.</p>
                     </div>
                   ) : (
                     <div className="text-white/50 font-mono">Status: Pending...</div>
                   )}
                </div>
              )}
            </div>
            
            {/* Info Footer */}
            <div className="px-4 py-2 bg-black/40 border-t border-white/10 text-xs text-white/60 flex justify-between items-center font-mono uppercase tracking-wider">
              <div className="flex items-center gap-6">
                 <span className="flex items-center gap-2">
                   <CheckCircle2 size={12} className="text-[#D2E882]"/> 
                   Output: 5120px
                 </span>
                 <span className="flex items-center gap-2">
                   <CheckCircle2 size={12} className="text-[#D2E882]"/> 
                   WM: Original Size
                 </span>
              </div>
              <div className="opacity-50">
                Mode: Parallel Processing
              </div>
            </div>
        </div>

      </main>
    </div>
  );
}