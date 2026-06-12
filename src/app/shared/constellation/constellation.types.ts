export interface ConstellationCard {
  id: string;
  title: string;
  /** Taille de bulle ; absent → taille par défaut (soft skills, passions) */
  years?: number;
  /** Sous-texte court localisé (ex. "6 années") */
  meta?: string;
  /** Phrase longue → panneau détail ; absent → bulle non cliquable */
  detail?: string;
  /** Futurs tags GitHub (feature 3) ; vide pour l'instant */
  tags?: string[];
  /** Carte custom projetée via ng-template (ex. 'spotify') */
  templateId?: string;
  /** Teinte de la bulle (projection de levelKey) */
  emphasis?: 'high' | 'medium' | 'low';
}

export interface ConstellationCategory {
  id: string;
  label: string;
  cards: ConstellationCard[];
}

export type ConstellationState =
  | { kind: 'rest' }
  | { kind: 'deployed'; categoryId: string }
  | { kind: 'detail'; categoryId: string; cardId: string };
