'use client';

import { IdentificationResult } from '@/types';

interface Props {
  result: IdentificationResult;
  onSave?: () => void;
  saved?: boolean;
}

const RISK_COLORS = {
  low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'Risque faible', dot: 'bg-green-500' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', label: 'Risque modéré', dot: 'bg-amber-500' },
  high: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'Risque élevé', dot: 'bg-red-500' },
};

export default function InsectCard({ result, onSave, saved }: Props) {
  const ai = result.ai_result;
  const insect = result.insect;
  const name = ai?.common_name_fr || insect?.common_name_fr || 'Inconnu';
  const scientific = ai?.scientific_name || insect?.scientific_name || '';
  const description = ai?.description_fr || insect?.description_fr || '';
  const risk = (ai?.risk_level || insect?.risk_level || 'medium') as 'low' | 'medium' | 'high';
  const habitat = ai?.habitat_fr || insect?.habitat_fr || '';
  const damage = ai?.damage_risk_fr || insect?.damage_risk_fr || '';
  const control = ai?.control_methods_fr || insect?.control_methods_fr || '';
  const characteristics = ai?.characteristics || [];
  const confidence = Math.round(result.confidence * 100);
  const riskStyle = RISK_COLORS[risk];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header with image */}
      {result.image_url && (
        <div className="relative h-56 bg-gray-100">
          <img
            src={result.image_url}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white leading-tight">{name}</h2>
            {scientific && (
              <p className="text-sm text-white/80 italic mt-0.5">{scientific}</p>
            )}
          </div>
          {/* Risk badge */}
          <div className={`absolute top-4 right-4 flex items-center gap-1.5 ${riskStyle.bg} ${riskStyle.text} px-3 py-1.5 rounded-full text-sm font-semibold border ${riskStyle.border}`}>
            <span className={`w-2 h-2 rounded-full ${riskStyle.dot}`} />
            {riskStyle.label}
          </div>
        </div>
      )}

      <div className="p-6">
        {/* If no image header, show name here */}
        {!result.image_url && (
          <div className="mb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
                {scientific && <p className="text-sm text-gray-500 italic mt-0.5">{scientific}</p>}
              </div>
              <span className={`shrink-0 flex items-center gap-1.5 ${riskStyle.bg} ${riskStyle.text} px-3 py-1.5 rounded-full text-sm font-semibold border ${riskStyle.border}`}>
                <span className={`w-2 h-2 rounded-full ${riskStyle.dot}`} />
                {riskStyle.label}
              </span>
            </div>
          </div>
        )}

        {/* Confidence */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-gray-600">Confiance de l&apos;IA</span>
            <span className="text-sm font-bold text-emerald-600">{confidence}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        {/* Key characteristics */}
        {characteristics.length > 0 && (
          <div className="mb-5">
            <div className="flex flex-wrap gap-2">
              {characteristics.map((c, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="mb-5 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
          </div>
        )}

        {/* Info sections */}
        <div className="space-y-4">
          {habitat && (
            <InfoRow icon="🏠" label="Habitat" value={habitat} />
          )}
          {damage && (
            <InfoRow icon="⚠️" label="Risques" value={damage} />
          )}
          {control && (
            <InfoRow icon="🛡️" label="Traitement" value={control} />
          )}
        </div>

        {/* Save button */}
        {onSave && (
          <button
            onClick={onSave}
            className={`mt-6 w-full py-3 rounded-xl font-semibold text-sm transition-all ${
              saved
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {saved ? '✓ Sauvegardé dans ma bibliothèque' : 'Sauvegarder dans mes scans'}
          </button>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-lg shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-gray-700 leading-relaxed">{value}</p>
      </div>
    </div>
  );
}
