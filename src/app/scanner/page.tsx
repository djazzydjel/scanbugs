'use client';

import { useState } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ImageUploadZone from '@/components/Upload/ImageUploadZone';
import InsectCard from '@/components/InsectCard/InsectCard';
import { analyzeInsectImage, fileToBase64, isValidMediaFile } from '@/lib/vision-api';
import { UploadFile, UploadProgress, IdentificationResult, AIAnalysisResult } from '@/types';

export default function ScannerPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleUpload = async (files: UploadFile[]) => {
    if (files.length === 0) return;

    const file = files[0].file;

    if (!isValidMediaFile(file)) {
      setError('Format de fichier non supporté. Utilisez JPG, PNG, WEBP ou GIF.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier est trop volumineux (max 10 MB)');
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);
      setResult(null);
      setSaved(false);
      setProgress({ loaded: 0, total: 100, percentage: 0 });

      // Animate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (!prev || prev.percentage >= 85) return prev;
          return { ...prev, percentage: Math.min(prev.percentage + Math.random() * 15, 85) };
        });
      }, 300);

      const base64 = await fileToBase64(file);
      const response = await analyzeInsectImage(base64, file.type);

      clearInterval(progressInterval);
      setProgress({ loaded: 100, total: 100, percentage: 100 });

      await new Promise((r) => setTimeout(r, 400));

      if (!response.success || !response.data) {
        setError(response.error || 'Erreur lors de l\'analyse');
        return;
      }

      const aiResult = response.data as AIAnalysisResult;

      if (!aiResult.identified) {
        setError(aiResult.reason || 'Aucun insecte détecté dans l\'image. Essayez avec une photo plus claire.');
        return;
      }

      const identificationResult: IdentificationResult = {
        id: Math.random().toString(36).slice(2),
        user_id: '',
        confidence: aiResult.confidence,
        image_url: files[0].preview,
        created_at: new Date().toISOString(),
        is_saved: false,
        ai_result: aiResult,
        insect: {
          id: '',
          scientific_name: aiResult.scientific_name || '',
          common_name_fr: aiResult.common_name_fr || 'Insecte identifié',
          common_name_en: aiResult.common_name_en,
          description_fr: aiResult.description_fr || '',
          habitat_fr: aiResult.habitat_fr,
          damage_risk_fr: aiResult.damage_risk_fr,
          control_methods_fr: aiResult.control_methods_fr,
          images: [files[0].preview],
          bite_sting_images: [],
          risk_level: aiResult.risk_level || 'medium',
          category: aiResult.category || 'Inconnu',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      setResult(identificationResult);
    } catch (err) {
      setError('Une erreur est survenue lors de l\'analyse');
      console.error(err);
    } finally {
      setAnalyzing(false);
      setProgress(null);
    }
  };

  const handleSave = () => {
    setSaved(true);
    // In production: POST to /api/identifications or /api/saved
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {!result ? (
          <>
            {/* Page header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 text-emerald-600 font-semibold text-sm mb-4 bg-emerald-50 px-4 py-2 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
                Scanner IA Vision
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
                Identifiez les nuisibles
              </h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Téléchargez une photo de l&apos;insecte et notre IA l&apos;identifie instantanément
              </p>
            </div>

            {/* Upload zone */}
            <div className="mb-8">
              <ImageUploadZone onUpload={handleUpload} loading={analyzing} progress={progress} />
            </div>

            {/* Error */}
            {error && (
              <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <span className="text-red-500 text-xl shrink-0">⚠️</span>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Tips */}
            <div className="max-w-2xl mx-auto bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
              <h3 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                <span>💡</span> Conseils pour une meilleure identification
              </h3>
              <ul className="space-y-2 text-sm text-emerald-800">
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Photo nette et bien éclairée</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Insecte visible et au centre</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Différents angles si possible</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Contexte ou habitat visible</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            {/* Result */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full font-semibold text-sm mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Identification réussie
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Résultat de l&apos;analyse</h1>
              <p className="text-gray-600">Informations complètes sur le nuisible identifié</p>
            </div>

            <div className="max-w-2xl mx-auto mb-6">
              <InsectCard result={result} onSave={handleSave} saved={saved} />
            </div>

            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { setResult(null); setError(null); setSaved(false); }}
                className="flex-1 py-3 px-4 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-colors"
              >
                Scanner un autre nuisible
              </button>
              <button
                onClick={() => window.location.href = '/my-scans'}
                className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold text-sm transition-colors"
              >
                Voir mes scans
              </button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
