'use client';

import { useCallback, useState } from 'react';
import { UploadFile, UploadProgress } from '@/types';

interface Props {
  onUpload: (files: UploadFile[]) => void;
  loading?: boolean;
  progress?: UploadProgress | null;
}

export default function ImageUploadZone({ onUpload, loading, progress }: Props) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    const url = URL.createObjectURL(file);
    setPreview(url);
    const uploadFile: UploadFile = {
      id: Math.random().toString(36).slice(2),
      file,
      preview: url,
      status: 'pending',
    };
    onUpload([uploadFile]);
  }, [onUpload]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 overflow-hidden ${
          dragging
            ? 'border-emerald-400 bg-emerald-50'
            : loading
            ? 'border-emerald-300 bg-emerald-50'
            : 'border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50'
        }`}
        style={{ minHeight: '320px' }}
      >
        {/* Preview image */}
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}

        {/* Scanning overlay */}
        {loading && preview && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-10">
            {/* Scan frame corners */}
            <div className="relative w-48 h-48">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-sm" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-sm" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-sm" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-400 rounded-br-sm" />
              {/* Scanline */}
              <div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                style={{
                  animation: 'scan 1.8s ease-in-out infinite',
                  top: progress ? `${progress.percentage}%` : '0%',
                }}
              />
            </div>
            <p className="text-white font-semibold mt-4">Analyse en cours...</p>
            {progress && (
              <div className="mt-3 w-48">
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <p className="text-emerald-300 text-xs text-center mt-1">{Math.round(progress.percentage)}%</p>
              </div>
            )}
          </div>
        )}

        {/* Default state (no preview) */}
        {!preview && !loading && (
          <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
              dragging ? 'bg-emerald-100' : 'bg-white border-2 border-gray-200'
            }`}>
              <svg className={`w-10 h-10 ${dragging ? 'text-emerald-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-1">
              {dragging ? 'Relâchez pour analyser' : 'Glisser-déposer une image'}
            </p>
            <p className="text-sm text-gray-500 mb-6">ou</p>
            <label className="cursor-pointer bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors text-sm">
              Parcourir les fichiers
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4"
                className="hidden"
                onChange={onFileInput}
              />
            </label>
            <p className="mt-4 text-xs text-gray-400">
              JPG, PNG, WEBP, GIF · Max 10 MB
            </p>
          </div>
        )}

        {/* Image loaded but not scanning: show replace button */}
        {preview && !loading && (
          <div className="absolute bottom-4 right-4 z-10">
            <label className="cursor-pointer bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg font-medium text-sm shadow-md hover:bg-white transition-colors border border-gray-200">
              Changer l'image
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={onFileInput}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
