'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Insect } from '@/types';

const RISK_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: 'Faible', color: 'text-green-700', bg: 'bg-green-100' },
  medium: { label: 'Modéré', color: 'text-amber-700', bg: 'bg-amber-100' },
  high: { label: 'Élevé', color: 'text-red-700', bg: 'bg-red-100' },
};

export default function LibraryPage() {
  const [insects, setInsects] = useState<Insect[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [selected, setSelected] = useState<Insect | null>(null);

  useEffect(() => {
    fetchInsects();
  }, [category, riskLevel]);

  const fetchInsects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (riskLevel) params.set('risk_level', riskLevel);
      const res = await fetch(`/api/insects?${params}`);
      const json = await res.json();
      setInsects(json.data || []);
    } catch {
      setInsects([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = insects.filter((insect) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      insect.common_name_fr?.toLowerCase().includes(s) ||
      insect.scientific_name?.toLowerCase().includes(s) ||
      insect.category?.toLowerCase().includes(s)
    );
  });

  const categories = [...new Set(insects.map((i) => i.category))].filter(Boolean).sort();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Selected insect modal/detail */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 flex items-center justify-between px-6 py-4 rounded-t-3xl sm:rounded-t-2xl">
              <div>
                <h2 className="font-bold text-lg text-gray-900">{selected.common_name_fr}</h2>
                <p className="text-sm text-gray-500 italic">{selected.scientific_name}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Risk badge */}
              <div className="flex flex-wrap gap-2">
                <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full ${RISK_LABELS[selected.risk_level]?.bg} ${RISK_LABELS[selected.risk_level]?.color}`}>
                  Risque {RISK_LABELS[selected.risk_level]?.label}
                </span>
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                  {selected.category}
                </span>
              </div>

              {selected.description_fr && (
                <Section title="Description" icon="📋" content={selected.description_fr} />
              )}
              {selected.habitat_fr && (
                <Section title="Habitat" icon="🏠" content={selected.habitat_fr} />
              )}
              {selected.life_cycle_fr && (
                <Section title="Cycle de vie" icon="🔄" content={selected.life_cycle_fr} />
              )}
              {selected.behavior_fr && (
                <Section title="Comportement" icon="🧠" content={selected.behavior_fr} />
              )}
              {selected.damage_risk_fr && (
                <Section title="Risques & dégâts" icon="⚠️" content={selected.damage_risk_fr} />
              )}
              {selected.control_methods_fr && (
                <Section title="Méthodes de contrôle" icon="🛡️" content={selected.control_methods_fr} />
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Bibliothèque</h1>
          <p className="text-gray-600">Base de données des insectes et nuisibles</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un nuisible..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-700 min-w-[150px]"
          >
            <option value="">Toutes catégories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-700 min-w-[150px]"
          >
            <option value="">Tous les niveaux</option>
            <option value="low">Risque faible</option>
            <option value="medium">Risque modéré</option>
            <option value="high">Risque élevé</option>
          </select>
        </div>

        {/* Count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-5">
            {filtered.length} nuisible{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
            {search || category || riskLevel ? ' (filtré)' : ' dans la base de données'}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block">🔎</span>
            <p className="text-gray-500 font-medium">Aucun résultat trouvé</p>
            <p className="text-sm text-gray-400 mt-1">Essayez avec d&apos;autres termes ou filtres</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((insect) => {
              const risk = RISK_LABELS[insect.risk_level] || RISK_LABELS.medium;
              return (
                <button
                  key={insect.id}
                  onClick={() => setSelected(insect)}
                  className="text-left bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-emerald-200 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-emerald-100 transition-colors">
                      🪲
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${risk.bg} ${risk.color}`}>
                      {risk.label}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                    {insect.common_name_fr}
                  </h3>
                  <p className="text-xs text-gray-500 italic mb-2">{insect.scientific_name}</p>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {insect.description_fr}
                  </p>
                  <span className="inline-block mt-3 text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                    {insect.category}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, icon, content }: { title: string; icon: string; content: string }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-2">
        <span>{icon}</span> {title}
      </h3>
      <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">{content}</p>
    </div>
  );
}
