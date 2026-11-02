/**
 * Utility for robust, cross-browser, iframe-compatible MP3 file downloads.
 * Fetches the audio data as a Blob and triggers an Object URL download anchor,
 * bypassing iframe sandboxing navigation blocks.
 */
export async function downloadAudioMp3(
  audioUrl: string,
  preferredFilename?: string,
  onProgress?: (isDownloading: boolean) => void
): Promise<void> {
  onProgress?.(true);

  try {
    // Append download=1 query parameter if not already present
    const cleanUrl = audioUrl.startsWith('http') || audioUrl.startsWith('/')
      ? audioUrl
      : `/${audioUrl}`;
    const targetUrl = cleanUrl.includes('?') ? `${cleanUrl}&download=1` : `${cleanUrl}?download=1`;

    // Fetch the binary stream
    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`Servidor respondeu com status ${response.status}`);
    }

    const blob = await response.blob();
    // Ensure blob MIME is audio/mpeg
    const mp3Blob = new Blob([blob], { type: 'audio/mpeg' });

    // Clean and normalize the filename
    let filename = preferredFilename || 'locucao-super-ia.mp3';
    filename = filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // strip diacritics
      .replace(/[^a-zA-Z0-9_.-]/g, '-')
      .replace(/-+/g, '-');
    if (!filename.toLowerCase().endsWith('.mp3')) {
      filename += '.mp3';
    }

    // Create object URL and trigger programmatic click
    const objectUrl = window.URL.createObjectURL(mp3Blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    link.setAttribute('download', filename);
    link.style.position = 'fixed';
    link.style.left = '-9999px';
    link.style.top = '-9999px';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(objectUrl);
      onProgress?.(false);
    }, 1500);
  } catch (err) {
    console.warn('[Audio Download] Blob download failed, falling back to window.open:', err);
    onProgress?.(false);
    const fallbackUrl = audioUrl.includes('?') ? `${audioUrl}&download=1` : `${audioUrl}?download=1`;
    window.open(fallbackUrl, '_blank');
  }
}
