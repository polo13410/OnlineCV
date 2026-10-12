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
  projects?: Project[]
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
  time: string
  level: string
}

export interface SkillCategory {
  name: string
  skills: Skill[]
}

export interface Passion {
  name: string
  type: string
}

export type ProjectKind = 'github' | 'association'
export type ProjectStatus = 'released' | 'in-progress'
export type ProjectLinkType = 'repo' | 'live' | 'download'

export interface ProjectLink {
  type: ProjectLinkType
  url: string
}

export interface Project {
  name: string
  kind: ProjectKind
  status: ProjectStatus
  icon: string // path under src/assets
  createdAt: string // ISO date, orders the timeline
  updatedAt: string // ISO date, fallback when GitHub can't be reached
  summary: string
  tags: string[]
  links: ProjectLink[]
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
