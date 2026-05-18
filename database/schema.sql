-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insects/Pests database
CREATE TABLE IF NOT EXISTS insects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scientific_name TEXT NOT NULL,
  common_name_fr TEXT NOT NULL,
  common_name_en TEXT,
  description_fr TEXT NOT NULL,
  habitat_fr TEXT,
  life_cycle_fr TEXT,
  behavior_fr TEXT,
  damage_risk_fr TEXT,
  control_methods_fr TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  bite_sting_images TEXT[] DEFAULT ARRAY[]::TEXT[],
  bite_sting_description_fr TEXT,
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Identifications (scan results)
CREATE TABLE IF NOT EXISTS identifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insect_id UUID NOT NULL REFERENCES insects(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  video_url TEXT,
  confidence DECIMAL(3, 2) CHECK (confidence >= 0 AND confidence <= 1),
  analysis_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved identifications (user library)
CREATE TABLE IF NOT EXISTS saved_identifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  identification_id UUID NOT NULL REFERENCES identifications(id) ON DELETE CASCADE,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, identification_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_identifications_user_id ON identifications(user_id);
CREATE INDEX IF NOT EXISTS idx_identifications_insect_id ON identifications(insect_id);
CREATE INDEX IF NOT EXISTS idx_saved_identifications_user_id ON saved_identifications(user_id);
CREATE INDEX IF NOT EXISTS idx_insects_category ON insects(category);
CREATE INDEX IF NOT EXISTS idx_insects_risk_level ON insects(risk_level);

-- Sample pest data (French common pests)
INSERT INTO insects (scientific_name, common_name_fr, common_name_en, description_fr, habitat_fr, life_cycle_fr, behavior_fr, damage_risk_fr, control_methods_fr, risk_level, category) VALUES
(
  'Formica rufa',
  'Fourmi rouge des bois',
  'Red wood ant',
  'Grande fourmi rouille avec abdomen noir. Longueur 4-9mm. Espèce sociale vivant en colonies dans les bois et jardins.',
  'Forêts, jardins, zones herbacées',
  'Cycle annuel avec reine vivant plusieurs années',
  'Très agressive quand le nid est menacé. Secrète de l''acide formique',
  'Peu de dégâts directs, peut être nuisible en cas de forte population',
  'Destruction mécanique du nid, barrières physiques',
  'low',
  'Fourmis'
),
(
  'Lasius niger',
  'Fourmi noire commune',
  'Common black garden ant',
  'Petite fourmi noire brillante. Longueur 3-5mm. Très commune dans les habitations et jardins.',
  'Urbain, jardins, maisons',
  'Reproducteurs volants en juillet-août',
  'Omnivore, attirée par les aliments sucrés. Forme des chemins de fourragement',
  'Peut contaminer la nourriture et envahir les habitations',
  'Élimination des sources alimentaires, pièges à phéromones',
  'medium',
  'Fourmis'
),
(
  'Blatta orientalis',
  'Cafard oriental',
  'Oriental cockroach',
  'Cafard de taille moyenne (20-25mm), brun-noir brillant. Ailes rudimentaires chez la femelle.',
  'Zones humides, tuyauteries, caves',
  'Nymphe en 6-12 mois selon conditions',
  'Nocturne, préfère zones fraîches et humides',
  'Vecteur de maladies, contamination alimentaire',
  'Insecticides, pièges, élimination sources d''humidité',
  'high',
  'Cafards'
),
(
  'Cimex lectularius',
  'Punaise de lit',
  'Bed bug',
  'Petit insecte rougeâtre de 4-5mm. Aplati, ovale. Ressemble légèrement à une lentille.',
  'Chambres, lits, meubles, hôtels',
  'Cycle complet en 4-12 semaines',
  'Hématophage (se nourrit de sang). Nocturne, très discret',
  'Démangeaisons intenses, impacts psychologiques importants',
  'Traitement thermique, insecticides, nettoyage en profondeur',
  'high',
  'Punaises'
),
(
  'Musca domestica',
  'Mouche domestique',
  'Housefly',
  'Mouche grise de 6-8mm. Deux grandes ailes, corps robuste. Yeux rouges.',
  'Urbain, habitations, établissements alimentaires',
  'Œuf à adulte en 7-10 jours',
  'Attirée par odeurs et aliments. Vole rapidement',
  'Vecteur de maladies (salmonellose, etc), contamination alimentaire',
  'Pièges adhésifs, insecticides, hygiène alimentaire stricte',
  'high',
  'Mouches'
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE identifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_identifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own identifications" ON identifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create identifications" ON identifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view saved identifications" ON saved_identifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create saved identifications" ON saved_identifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved identifications" ON saved_identifications
  FOR DELETE USING (auth.uid() = user_id);
