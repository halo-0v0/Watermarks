const TARGET_LONG_EDGE = 5120;

export const processImage = (
  imageSrc: string,
  watermarkSrc: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const wm = new Image();
      wm.crossOrigin = "anonymous";
      wm.onload = () => {
        try {
          // 1. Calculate new dimensions for host image
          let newWidth, newHeight;
          if (img.width > img.height) {
            newWidth = TARGET_LONG_EDGE;
            newHeight = Math.round(img.height * (TARGET_LONG_EDGE / img.width));
          } else {
            newHeight = TARGET_LONG_EDGE;
            newWidth = Math.round(img.width * (TARGET_LONG_EDGE / img.height));
          }

          // 2. Setup Canvas
          const canvas = document.createElement("canvas");
          canvas.width = newWidth;
          canvas.height = newHeight;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          // 3. Draw Resized Host Image
          // High quality scaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // 4. Calculate Watermark Dimensions & Position
          // Requirement: Maintain original size, 0 padding, bottom-left.
          const wmDrawWidth = wm.width;
          const wmDrawHeight = wm.height;

          // Position at absolute bottom-left (0, 0 from corner)
          const x = 0;
          const y = newHeight - wmDrawHeight;

          // 5. Draw Watermark
          ctx.globalAlpha = 1.0; // Ensure fully opaque (unless PNG has transparency)
          ctx.drawImage(wm, x, y, wmDrawWidth, wmDrawHeight);

          // 6. Export to JPEG
          const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
          resolve(dataUrl);
        } catch (e) {
          reject(e);
        }
      };
      wm.onerror = (e) => reject(new Error("Failed to load watermark image"));
      wm.src = watermarkSrc;
    };
    img.onerror = (e) => reject(new Error("Failed to load host image"));
    img.src = imageSrc;
  });
};