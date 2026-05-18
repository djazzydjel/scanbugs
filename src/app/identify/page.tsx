'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ImageUploadZone from '@/components/Upload/ImageUploadZone';
import InsectCard from '@/components/InsectCard/InsectCard';
import { supabase } from '@/lib/supabase';
import { analyzeInsectImage, fileToBase64, isValidMediaFile } from '@/lib/vision-api';
import { UploadFile, UploadProgress, IdentificationResult } from '@/types';

export default function IdentifyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);
    };

    checkAuth();
  }, [router]);

  const handleUpload = async (files: UploadFile[]) => {
    if (files.length === 0) return;

    const file = files[0].file;

    // Validate file
    if (!isValidMediaFile(file)) {
      setError('Format de fichier non supporté');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier est trop volumineux (max 10 MB)');
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);
      setProgress({ loaded: 0, total: 100, percentage: 0 });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (!prev) return null;
          const newPercentage = Math.min(prev.percentage + Math.random() * 30, 90);
          return {
            ...prev,
            percentage: newPercentage,
          };
        });
      }, 200);

      // Convert file to base64
      const base64 = await fileToBase64(file);

      // Send to vision API
      const response = await analyzeInsectImage(base64, file.type);

      clearInterval(progressInterval);

      if (!response.success || !response.data) {
        setError(response.error || 'Erreur lors de l\'analyse');
        setAnalyzing(false);
        setProgress(null);
        return;
      }

      // Simulate completion
      setProgress({ loaded: 100, total: 100, percentage: 100 });

      // Create mock result (in production, this would come from your backend)
      const mockResult: IdentificationResult = {
        id: Math.random().toString(),
        user_id: user?.id || '',
        insect_id: response.data.pestId,
        confidence: response.data.confidence,
        image_url: files[0].preview,
        created_at: new Date().toISOString(),
        is_saved: false,
        insect: {
          id: response.data.pestId,
          scientific_name: 'Species sp.',
          common_name_fr: 'Insecte identifié',
          description_fr: response.data.description,
          images: [files[0].preview],
          bite_sting_images: [],
          risk_level: 'medium',
          category: 'Inconnu',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      setResult(mockResult);
    } catch (err) {
      setError('Une erreur est survenue lors de l\'analyse');
      console.error(err);
    } finally {
      setAnalyzing(false);
      setProgress(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {!result ? (
          <>
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Identifiez les nuisibles
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Téléchargez une photo ou vidéo de l'insecte et notre IA le identifiera instantanément
              </p>
            </div>

            {/* Upload Zone */}
            <div className="mb-12">
              <ImageUploadZone
                onUpload={handleUpload}
                loading={analyzing}
                progress={progress}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="max-w-2xl mx-auto mb-12 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Info Box */}
            <div className="max-w-2xl mx-auto bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3">💡 Conseils pour une meilleure identification</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>✓ Prenez une photo claire et bien éclairée</li>
                <li>✓ Montrez l'insecte sous différents angles si possible</li>
                <li>✓ Assurez-vous que l'insecte est au focus</li>
                <li>✓ Incluez l'habitat ou le contexte si pertinent</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            {/* Result Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Résultat de l'identification
              </h1>
              <p className="text-gray-600">
                Voici les informations détaillées sur l'insecte trouvé
              </p>
            </div>

            {/* Result Card */}
            <div className="max-w-2xl mx-auto mb-8">
              <InsectCard result={result} />
            </div>

            {/* Actions */}
            <div className="max-w-2xl mx-auto flex gap-4">
              <button
                onClick={() => {
                  setResult(null);
                  setError(null);
                }}
                className="flex-1 py-3 px-4 text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Scanner un autre nuisible
              </button>
              <button
                onClick={() => router.push('/library')}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Voir ma bibliothèque
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
