import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Tu es un entomologiste expert et spécialiste de la lutte antiparasitaire.
Analyse l'image fournie et identifie tout insecte, araignée, ou nuisible visible.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte supplémentaire, avec exactement cette structure:
{
  "identified": true,
  "common_name_fr": "nom commun en français",
  "common_name_en": "English common name",
  "scientific_name": "nom scientifique latin",
  "confidence": 0.0 à 1.0,
  "risk_level": "low" ou "medium" ou "high",
  "category": "catégorie en français (ex: Fourmis, Cafards, Araignées, Moustiques...)",
  "description_fr": "Description détaillée en français (2-3 phrases)",
  "habitat_fr": "Habitat et environnement en français",
  "damage_risk_fr": "Risques et dommages potentiels en français",
  "control_methods_fr": "Méthodes de contrôle et traitement en français",
  "characteristics": ["caractéristique 1", "caractéristique 2", "caractéristique 3"]
}

Si aucun insecte ou nuisible n'est visible dans l'image, réponds avec:
{
  "identified": false,
  "reason": "Explication en français de pourquoi l'identification est impossible",
  "confidence": 0.0
}

Règles pour risk_level:
- "low": pas de danger direct (fourmis de jardin, coccinelles, etc.)
- "medium": nuisance modérée (mouches, moustiques, fourmis de maison, etc.)
- "high": danger sérieux ou risque sanitaire élevé (cafards, punaises de lit, guêpes, tiques, etc.)`;

export async function POST(request: NextRequest) {
  try {
    const { image, mimeType } = await request.json();

    if (!image || !mimeType) {
      return NextResponse.json({ error: 'Image et type MIME requis' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Clé API non configurée' }, { status: 500 });
    }

    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const mediaType = validImageTypes.includes(mimeType)
      ? (mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif')
      : 'image/jpeg';

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: image,
              },
            },
            {
              type: 'text',
              text: 'Identifie le nuisible dans cette image et réponds en JSON.',
            },
          ],
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'Réponse invalide du modèle' }, { status: 500 });
    }

    let result;
    try {
      // Extract JSON from the response (sometimes model adds markdown)
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      result = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ error: 'Impossible de parser la réponse' }, { status: 500 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    console.error('Analyze API error:', error);
    const message = error instanceof Error ? error.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
