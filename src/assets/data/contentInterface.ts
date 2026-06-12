export interface CVDataContent {
  language: string
  header: Header
  details: Details
  skillCategories: SkillCategory[]
  softskills: string[]
  passions: Passion[]
  profile: string
  experiences?: Experiences
  educations?: Education[]
}

export interface Header {
  name: string
  surname: string
  title: string
  address: string
  phone: string
  mail: string
}

export interface Details {
  birth: string
  licenses: string[]
}

export interface Skill {
  lang: string
  time: string          // affichage localisé ("6 années")
  level: string         // phrase longue → panneau détail
  years: number         // valeur numérique (taille de bulle)
  levelKey: 'advanced' | 'intermediate' | 'beginner'
}

export interface SkillCategory {
  name: string
  skills: Skill[]
}

export interface Passion {
  name: string
  type: string
}

export interface Experiences {
  pro: Experience[]
  stage: Experience[]
}

export interface Experience {
  title: string
  company: string
  location: string
  dfrom: string
  to: string
  descriptions: string[]
}

export interface Education {
  title: string
  school: string
  location: string
  dfrom: string
  to: string
  descriptions: string[]
}

export interface MagneticScrollItem {
  title:        string;
  organisation: string; // company name or school name
  location:     string;
  dateFrom:     string;
  dateTo:       string;
  descriptions: string[];
}

export interface MagneticScrollSection {
  overline: string;
  title:    string;
  items:    MagneticScrollItem[];
}
