export interface Insect {
  id: string;
  scientific_name: string;
  common_name_fr: string;
  common_name_en?: string;
  description_fr: string;
  habitat_fr?: string;
  life_cycle_fr?: string;
  behavior_fr?: string;
  damage_risk_fr?: string;
  control_methods_fr?: string;
  images: string[];
  bite_sting_images: string[];
  bite_sting_description_fr?: string;
  risk_level: 'low' | 'medium' | 'high';
  category: string;
  created_at: string;
  updated_at: string;
}

export interface IdentificationResult {
  id: string;
  user_id: string;
  insect_id?: string;
  image_url: string;
  video_url?: string;
  confidence: number;
  analysis_details?: Record<string, unknown>;
  created_at: string;
  is_saved: boolean;
  insect?: Insect;
  ai_result?: AIAnalysisResult;
}

export interface AIAnalysisResult {
  identified: boolean;
  common_name_fr?: string;
  common_name_en?: string;
  scientific_name?: string;
  confidence: number;
  risk_level?: 'low' | 'medium' | 'high';
  category?: string;
  description_fr?: string;
  habitat_fr?: string;
  damage_risk_fr?: string;
  control_methods_fr?: string;
  characteristics?: string[];
  reason?: string;
}

export interface UploadFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface SavedScan {
  id: string;
  user_id: string;
  identification_id: string;
  category?: string;
  notes?: string;
  created_at: string;
  identification?: IdentificationResult;
}
