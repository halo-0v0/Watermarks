import JSZip from 'jszip';

export const createZipFromImages = async (
  images: { name: string; url: string }[]
): Promise<Blob> => {
  const zip = new JSZip();

  // Fetch all images and add to zip
  const promises = images.map(async (img) => {
    try {
      const response = await fetch(img.url);
      const blob = await response.blob();
      zip.file(img.name, blob);
    } catch (e) {
      console.error(`Failed to add ${img.name} to zip`, e);
    }
  });

  await Promise.all(promises);

  return await zip.generateAsync({ type: 'blob' });
};
