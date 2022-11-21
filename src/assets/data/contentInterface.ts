export interface CVDataContent {
  language: string
  header: Header
  details: Details
  skills: Skill[]
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
  time: string
  level: string
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
