'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { supabase } from '@/lib/supabase';

interface Scan {
  id: string;
  created_at: string;
  image_url: string;
  confidence: number;
  analysis_details: {
    common_name_fr?: string;
    scientific_name?: string;
    risk_level?: string;
    category?: string;
    description_fr?: string;
  } | null;
}

const RISK_STYLES: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  low: { label: 'Risque faible', color: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500' },
  medium: { label: 'Risque modéré', color: 'text-amber-700', bg: 'bg-amber-100', dot: 'bg-amber-500' },
  high: { label: 'Risque élevé', color: 'text-red-700', bg: 'bg-red-100', dot: 'bg-red-500' },
};

export default function MyScansPage() {
  const router = useRouter();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false);
        return;
      }
      setUser(user as Record<string, unknown>);
      loadScans(user.id);
    });
  }, []);

  const loadScans = async (userId: string) => {
    try {
      const res = await fetch(`/api/identifications?user_id=${userId}`);
      const json = await res.json();
      setScans(json.data || []);
    } catch {
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Mes scans</h1>
            <p className="text-gray-600">Historique de vos identifications</p>
          </div>
          <button
            onClick={() => router.push('/scanner')}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
          >
            <span>📷</span>
            Nouveau scan
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !user ? (
          <div className="text-center py-20">
            <span className="text-5xl mb-6 block">🔒</span>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Connexion requise</h2>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Créez un compte pour sauvegarder et retrouver vos scans
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/auth/register')}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
              >
                Créer un compte
              </button>
              <button
                onClick={() => router.push('/auth/login')}
                className="bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Se connecter
              </button>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Pas de compte ? Essayez le scanner sans inscription</p>
              <button
                onClick={() => router.push('/scanner')}
                className="text-emerald-600 font-medium text-sm hover:text-emerald-700"
              >
                Scanner maintenant →
              </button>
            </div>
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl mb-6 block">📷</span>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Aucun scan pour l&apos;instant</h2>
            <p className="text-gray-600 mb-6">
              Prenez votre première photo pour identifier un insecte
            </p>
            <button
              onClick={() => router.push('/scanner')}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              Commencer à scanner
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Total scans', value: scans.length },
                { label: 'Ce mois', value: scans.filter(s => new Date(s.created_at) > new Date(Date.now() - 30 * 24 * 3600000)).length },
                { label: 'Précision moy.', value: `${Math.round(scans.reduce((acc, s) => acc + s.confidence, 0) / scans.length * 100)}%` },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* List */}
            <div className="space-y-3">
              {scans.map((scan) => {
                const details = scan.analysis_details;
                const riskKey = details?.risk_level || 'medium';
                const riskStyle = RISK_STYLES[riskKey] || RISK_STYLES.medium;
                return (
                  <div
                    key={scan.id}
                    className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow"
                  >
                    {scan.image_url ? (
                      <img
                        src={scan.image_url}
                        alt="scan"
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shrink-0">
                        🪲
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {details?.common_name_fr || 'Nuisible identifié'}
                        </p>
                        <span className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${riskStyle.bg} ${riskStyle.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${riskStyle.dot}`} />
                          {riskStyle.label}
                        </span>
                      </div>
                      {details?.scientific_name && (
                        <p className="text-xs text-gray-500 italic mb-1">{details.scientific_name}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{formatDate(scan.created_at)}</span>
                        <span>·</span>
                        <span className="text-emerald-600 font-medium">
                          {Math.round(scan.confidence * 100)}% confiance
                        </span>
                        {details?.category && (
                          <>
                            <span>·</span>
                            <span>{details.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
