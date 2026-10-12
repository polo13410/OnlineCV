// Language-neutral skill registry. Experiences reference skills by id (SkillId),
// so an unknown tag is a compile error. Key order = display order inside a category.

export type SkillLevel = 'advanced' | 'good' | 'intermediate' | 'basics' | 'notions' | 'beginner' | 'daily';
export type SkillCategoryId = 'languages' | 'frameworks' | 'data' | 'devops' | 'practices' | 'ai';
export type Localized = string | { fr: string; en: string };

export interface SkillDef {
  category: SkillCategoryId;
  label: Localized;
  short?: string; // compact label for card tags
  years: number;
  level: SkillLevel;
  note?: Localized; // replaces the "context : level" line
}

export const SKILL_CATEGORIES: SkillCategoryId[] = ['languages', 'frameworks', 'data', 'devops', 'practices', 'ai'];

export const SKILLS = {
  // Languages
  typescript: { category: 'languages', label: 'TypeScript (& JavaScript)', short: 'TypeScript', years: 6, level: 'advanced' },
  csharp:     { category: 'languages', label: 'C#', years: 3, level: 'good' },
  java:       { category: 'languages', label: 'Java', years: 3, level: 'good' },
  python:     { category: 'languages', label: 'Python', years: 4, level: 'intermediate' },
  php:        { category: 'languages', label: 'PHP', years: 1, level: 'basics' },
  htmlcss:    { category: 'languages', label: 'HTML / CSS', years: 5, level: 'good' },

  // Frameworks & libraries
  nodejs:     { category: 'frameworks', label: 'Node.js', years: 5, level: 'advanced' },
  dotnet:     { category: 'frameworks', label: '.NET', years: 2, level: 'intermediate' },
  spring:     { category: 'frameworks', label: 'Spring', years: 1, level: 'beginner' },
  vue:        { category: 'frameworks', label: 'Vue.js', years: 3, level: 'intermediate' },
  angular:    { category: 'frameworks', label: 'Angular', years: 1, level: 'basics' },
  react:      { category: 'frameworks', label: 'React', years: 3, level: 'intermediate' },
  laravel:    { category: 'frameworks', label: 'Laravel', years: 1, level: 'beginner' },
  nestjs:     { category: 'frameworks', label: 'NestJS', years: 1, level: 'intermediate' },
  tailwind:   { category: 'frameworks', label: 'Tailwind CSS', short: 'Tailwind', years: 1, level: 'basics' },

  // Databases
  sql:        { category: 'data', label: 'SQL (PostgreSQL, MySQL, MS SQL)', short: 'SQL', years: 9, level: 'good' },
  prisma:     { category: 'data', label: 'Prisma', years: 1, level: 'basics' },
  supabase:   { category: 'data', label: 'Supabase', years: 1, level: 'basics' },

  // DevOps & cloud
  cicd:       { category: 'devops', label: 'CI/CD (GitHub Actions, CircleCI, SeedCI)', short: 'CI/CD', years: 4, level: 'good' },
  terraform:  { category: 'devops', label: 'Terraform (IaC)', short: 'Terraform', years: 2, level: 'good' },
  docker:     { category: 'devops', label: 'Docker', years: 2, level: 'intermediate' },
  aws:        { category: 'devops', label: 'AWS', years: 3, level: 'advanced' },
  gcp:        { category: 'devops', label: 'Google Cloud Platform', short: 'GCP', years: 2, level: 'advanced' },
  netlify:    { category: 'devops', label: 'Netlify', years: 1, level: 'notions' },

  // Methods & practices
  agile:      { category: 'practices', label: { fr: 'Méthodes Agile', en: 'Agile methodologies' }, short: 'Agile', years: 5, level: 'daily' },
  testing:    {
    category: 'practices',
    label: { fr: 'Tests & qualité logicielle', en: 'Testing & Software Quality' },
    short: 'Tests',
    years: 4,
    level: 'good',
    note: { fr: 'tests unitaires, intégration, contrôle qualité', en: 'unit testing, integration testing, quality control' },
  },
  architecture: {
    category: 'practices',
    label: { fr: 'Architecture applicative', en: 'Application Architecture' },
    short: 'Architecture',
    years: 4,
    level: 'good',
    note: { fr: 'applications modulaires, scalables et maintenables', en: 'modular, scalable and maintainable applications' },
  },

  // AI
  mcp:        { category: 'ai', label: 'MCP (Model Context Protocol)', short: 'MCP', years: 1, level: 'advanced' },
  rag:        { category: 'ai', label: 'RAG (Retrieval-Augmented Generation)', short: 'RAG', years: 1, level: 'good' },
  agenticAi:  { category: 'ai', label: { fr: 'IA Agentique', en: 'Agentic AI' }, years: 1, level: 'good' },
} as const satisfies Record<string, SkillDef>;

export type SkillId = keyof typeof SKILLS;

export function localize(value: Localized, lang: 'fr' | 'en'): string {
  return typeof value === 'string' ? value : value[lang];
}
