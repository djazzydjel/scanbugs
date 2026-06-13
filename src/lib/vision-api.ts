import { AIAnalysisResult, UploadFile } from '@/types';

export function isValidMediaFile(file: File): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/mov',
    'video/avi',
  ];
  return validTypes.includes(file.type);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g. "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function analyzeInsectImage(
  base64: string,
  mimeType: string
): Promise<{ success: boolean; data?: AIAnalysisResult; error?: string }> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, mimeType }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || 'Erreur lors de l\'analyse' };
    }

    const data = await response.json();
    return { success: true, data: data.result };
  } catch (error) {
    console.error('Vision API error:', error);
    return { success: false, error: 'Impossible de contacter le service d\'analyse' };
  }
}
