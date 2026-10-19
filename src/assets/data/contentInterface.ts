import { SkillId } from './skills';

export interface CVDataContent {
  language: string;
  header: Header;
  details: Details;
  softskills: string[];
  passions: Passion[];
  profile: string;
  experiences?: Experiences;
  educations?: Education[];
  projects?: Project[];
}

export interface Header {
  name: string;
  surname: string;
  title: string;
  phone: string;
  mail: string;
}

export interface Details {
  birth: string;
  licenses: string[];
}

export interface Passion {
  description: string;
  name: string;
  type: string;
}

export type ProjectKind = 'github' | 'association';
export type ProjectStatus = 'released' | 'in-progress' | 'beta';
export type ProjectLinkType = 'repo' | 'live' | 'download';

export interface ProjectLink {
  type: ProjectLinkType;
  url: string;
}

// Shared by pro experiences, internships, side projects and education
export interface ExperienceBase {
  id: string; // stable, used as page anchor
  icon?: string; // path under src/assets
  iconDarkSrc?: string; // alternate artwork for the dark theme
  iconFill?: boolean; // logo has its own background: fills the tile edge to edge
  iconDark?: 'invert' | 'plate'; // dark theme fix for logos too dark to read: invert a monochrome logo, or sit it on a light plate
  dateFrom: string; // ISO 'YYYY', 'YYYY-MM' or 'YYYY-MM-DD', orders the timeline
  dateTo?: string; // ISO; absent = ongoing
  skills: SkillId[];
}

export interface Project extends ExperienceBase {
  name: string;
  kind: ProjectKind;
  status: ProjectStatus;
  updatedAt: string; // ISO date, fallback when GitHub can't be reached
  summary: string;
  links: ProjectLink[];
}

export interface Experiences {
  pro: Experience[];
  stage: Experience[];
}

export interface Experience extends ExperienceBase {
  title: string;
  company: string;
  location: string;
  descriptions: string[];
}

export interface Education extends ExperienceBase {
  title: string;
  school: string;
  location: string;
  descriptions: string[];
}
