import { CVDataContent } from './contentInterface';
export const content: CVDataContent[] = [
  {
    language: 'french',
    header: {
      name: 'Paul',
      surname: 'Pera',
      title: 'Fullstack developper',
      address: 'Chemin de primerose 25, Lausanne 1007',
      phone: '+41 76 699 42 12',
      mail: 'paul.pera@viacesi.fr',
    },
    details: {
      birth: '24 décembre 1997',
      licenses: ['Permis de conduire', 'Permis bateau', 'Brevet de secourisme'],
    },
    skillCategories: [
      {
        name: 'Langages de programmation & script',
        skills: [
          {
            lang: 'Javascript/typescript',
            time: '3 années',
            level: 'projets professionnels & personnels: niveau avancé',
          },
          {
            lang: 'C#',
            time: '2 années',
            level: 'projets professionnels: bon niveau',
          },
          {
            lang: 'Java',
            time: '2 années',
            level: 'projets professionnels & personnels: bon niveau',
          },
          {
            lang: 'Python',
            time: '2 années',
            level: 'projets professionnels & personnels: niveau intermediaire',
          },
          {
            lang: 'PHP',
            time: '1 année',
            level: 'projets professionnels: bonnes bases',
          },
          {
            lang: 'HTML CSS',
            time: '2 années',
            level: 'projets professionnels & personnels: bon niveau',
          }
        ],
      },
      {
        name: 'Frameworks',
        skills: [
          {
            lang: 'NodeJS',
            time: '2 années',
            level: 'projets professionnels & personnels: niveau avancé'
          },
          {
            lang: '.net',
            time: '1.5 année',
            level: 'projets professionnels: intermediaire'
          },
          {
            lang: 'spring',
            time: '0.5 année',
            level: 'projets personnels: débutant'
          },
          {
            lang: 'VueJS',
            time: '1.5 année',
            level: 'projets professionnels: niveau intermediaire',
          },
          {
            lang: 'AngularJS',
            time: '1 année',
            level: 'projets professionnels & personnels: bonnes bases',
          },
          {
            lang: 'ReactJS',
            time: '0.5 année',
            level: 'projets personnels: bases',
          },
          {
            lang: 'Laravel',
            time: '0.5 année',
            level: 'projets professionnels: débutant'
          },
        ],
      },
      {
        name: 'DevOps',
        skills: [
          {
            lang: 'SeedCI',
            level: 'projets professionnels: bon niveau',
            time: '1.5 année',
          },
          {
            lang: 'CircleCI',
            level: 'projets professionnels: bon niveau',
            time: '1.5 année',
          },
          {
            lang: 'github actions',
            level: 'projets professionnels: bon niveau',
            time: '1.5 année',
          },
          {
            lang: 'Terraform (IaC)',
            level: 'projets professionnels: bon niveau',
            time: '1.5 année',
          },
          {
            lang: 'Netlify',
            level: 'projets personnels: bases',
            time: '0.5 année',
          },
        ],
      },
      {
        name: 'Environements & méthodes',
        skills: [
          {
            lang: 'Méthodes agile',
            time: '5 années',
            level: 'projets professionnels & personnels: quotidien',
          },
          {
            lang: 'AWS',
            time: '1.5 année',
            level: 'projets professionnels: quotidien',
          },
          {
            lang: 'Google Firebase',
            time: '0.5 année',
            level: 'projets personnels: quotidien',
          },
        ]
      }
    ],
    softskills: [
      "Esprit d'équipe",
      'Flexibilité et adaptation',
      'Autonomie',
      "Recherche d'améliorations",
      'Curiosité',
      'Anglais professionnel',
    ],
    passions: [
      { name: 'Handball', type: 'sport' },
      { name: 'Ski', type: 'sport' },
      { name: 'Randonnée', type: 'sport' },
      { name: 'Skateboard', type: 'sport' },
      { name: 'Escalade', type: 'sport' },
      { name: 'Espace', type: 'other' },
      { name: 'Science', type: 'other' },
      { name: 'Nouvelles technologies', type: 'other' },
      { name: 'Montage photo/vidéo', type: 'other' },
      { name: 'Drones', type: 'other' },
    ],
    profile:
      'Développeur fullstack jeune et motivé avec 2 ans d\'experience professionnelle. Plusieurs projets logiciels terminés qui ont permis l\'optimisation et une meilleures efficacité d\'applications pour differentes entreprises dans la tech. A la recherche d\'une entreprise innovante pour pouvoir progresser ensemble et utiliser mes connaissances en développement et dans l\'informatique.',
    experiences: {
      pro: [
        {
          title: 'Ingénieur d\'étude et développement - fullstack & devops',
          company: 'Propulse lab',
          location: 'Lausanne, Suisse',
          dfrom: 'Janvier 2023',
          to: 'Aujourd\'hui',
          descriptions: [
            "Plusieurs projets pour mener et maintenir l'applicatif de l'expertise transac au sein de propulse lab et développer les outils et les possibilités autour des sujets principaux : autorisations bancaires, paiements, remboursements, intégrations de prestataires de paiements, minimisation des chargebacks et automatisation de la réconciliation bancaire.",
            "Sujets de la création et mise a disposition de la data sur l'ensemble des sujets de l'expertise transac",
            "Création d'un outil de création de liens de redirections raccourci parametrables sur plusieurs criteres pour faciliter la mise en place des AB tests",
            "Création d'un outil pour renforcer les verifications des commandes et éviter des potentielles fraudes lors du paiement des commandes",
          ],
        },
        {
          title: 'Ingénieur d\'étude et développement',
          company: 'Metafactory',
          location: 'Paris, France',
          dfrom: 'Septembre 2020',
          to: 'Mai 2022',
          descriptions: [
            'Plusieurs projet en C# et Microsoft SQL pour un logiciel de trading & shipping, permettant a l\'utilisateur final une navigation optimisée et plus rapide et de nouvelles fonctionnalités et interractions',
            'Création d\'une interface web avec une API REST et le framework .net afin de dissocier une application de trading de ses serveurs dans le but de faciliter la maintenance et améliorer la sécurité',
          ],
        },
      ],
      stage: [
        {
          title: 'Ingénieur d\'étude et développement & chef de projet',
          company: 'Monext',
          location: 'Aix en Provence, France',
          dfrom: 'Janvier 2020',
          to: 'Juillet 2020',
          descriptions: [
            'Migration d\'une app de terminal de paiement électronique virtuel en Angular pour la correspondance des normes de sécurité PCI-DSS, en réhabilitant et en modernisant l\'interface utilisateur.',
          ],
        },
        {
          title: 'Ingénieur d\'étude et développement',
          company: 'Thales Alenia Space',
          location: 'Stuttgart, Allemagne',
          dfrom: 'Septembre 2018',
          to: 'Fevrier 2019',
          descriptions: [
            'Création et intégration d\'un plugin dans un programme Java  RCP permettant a l\'utilisateur d\'enregistrer et visualiser ses données experimentales grâce a une interface simple',
          ],
        },
        {
          title: 'Ingénieur d\'étude et développement',
          company: 'Cosmos Consulting',
          location: 'Aix en Provence, France',
          dfrom: 'Janvier 2018',
          to: 'Avril 2018',
          descriptions: [
            'Creation d\'un logiciel java pour la modification de propriété HTML, CSS et JS d\'un serveur de Business Intelligence, permettant a l\'utilisateur de customiser facilement l\'interface',
          ],
        },
      ],
    },
    educations: [
      {
        title: 'Diplôme d\'ingénieur en informatique',
        school: 'CESI',
        location: 'Aix en Provence, France',
        dfrom: '2017',
        to: '2020',
        descriptions: ['Développement logiciel & data-science'],
      },
      {
        title: 'DUT technicien supérieur',
        school: 'IUT Savoie Mont-Blanc',
        location: 'Annecy, France',
        dfrom: '2015',
        to: '2017',
        descriptions: ['Mesure physique, option énergies renouvelables'],
      },
    ],
  },
  {
    language: 'english',
    header: {
      name: 'Paul',
      surname: 'Pera',
      title: 'Fullstack developper',
      address: 'Chemin de primerose 25, Lausanne 1007',
      phone: '+41 76 699 42 12',
      mail: 'paul.pera@viacesi.fr',
    },
    details: {
      birth: '24th december 1997',
      licenses: ['Driving license', 'Boat license', 'Secourism degree'],
    },
    skillCategories: [
      {
        name: 'Programming & scripting languages',
        skills: [
          {
            lang: 'HTML CSS',
            time: '3 years',
            level: 'professional & personal projects: daily work',
          },
          {
            lang: 'VueJS',
            level: 'professional: daily work',
            time: '1.5 year',
          },
          {
            lang: 'Typescript',
            level: 'professional & personal projects: daily work',
            time: '2 years',
          },
          {
            lang: 'Python',
            level: 'professional projects: autonomous',
            time: '2 years',
          },
          {
            lang: 'C#',
            time: '2 years',
            level: 'professional projects: autonomous',
          },
          {
            lang: 'Java',
            time: '2 years',
            level: 'professional & personal projects: good level',
          },
          {
            lang: 'JavaScript',
            time: '1.5 année',
            level: 'professional & personal projects: good knowledge',
          },
          {
            lang: 'Angular',
            time: '1 year',
            level: 'professional & personal projects: good knowledge',
          },
          {
            lang: 'ReactJS',
            time: '0.5 year',
            level: 'personal projects: basics',
          }
        ],
      },
      {
        name: 'DevOps',
        skills: [
          {
            lang: 'CI (circleCI, SeedCI, github actions)',
            level: 'professional projects: daily work',
            time: '1.5 year',
          },
          {
            lang: 'IaC terraform',
            level: 'professional projects: daily work',
            time: '1.5 year',
          },
        ],
      },
      {
        name: 'Environements and methods',
        skills: [
          {
            lang: 'Agile',
            time: '3.5 year',
            level: 'professional & personal projects: daily work',
          },
          {
            lang: 'AWS',
            level: 'professional projects: daily work',
            time: '1.5 year',
          },
        ]
      }
    ],
    softskills: [
      'Team spirit',
      'Flexibility and adaption',
      'Autonomy',
      'English: professional',
    ],
    passions: [
      { name: 'Handball', type: 'sport' },
      { name: 'Skiing', type: 'sport' },
      { name: 'Hiking', type: 'sport' },
      { name: 'Skateboarding', type: 'sport' },
      { name: 'Climbing', type: 'sport' },
      { name: 'Space', type: 'other' },
      { name: 'Science', type: 'other' },
      { name: 'New technologies', type: 'other' },
      { name: 'Picture/movie editing', type: 'other' },
      { name: 'Drones', type: 'other' },
    ],
    profile:
      'Young and motivated full stack developer with 2 years of professional experience. Many software projects achieved that lead to optimisation and augmentation of the efficiency of the applications for various technology companies. Seeking an innovating company to apply my coding knowledge and progress together. ',
    experiences: {
      pro: [
        {
          title: 'Study and development engineer',
          company: 'Metafactory',
          location: 'Paris, France',
          dfrom: 'September 2020',
          to: 'May 2022',
          descriptions: [
            'Many projects using C# and a Microsoft SQL database for a trading and shipping software, allowing final user to navigate quicker and create new interactions in existing apps',
            'Creation of a web interface using a REST API and .net framework to dissociate a trading application from its servers in order to facilitate its maintenance and increase its security',
          ],
        },
      ],
      stage: [
        {
          title:
            'Study and development engineer & project manager (internship)',
          company: 'Monext',
          location: 'Aix en Provence, France',
          dfrom: 'January 2020',
          to: 'July 2020',
          descriptions: [
            'Migration of a virtual electronic payment terminal application using Angular for security standards in the payment industry, rehabilitating and modernizing the user interface',
          ],
        },
        {
          title: 'Study and development engineer (internship)',
          company: 'Thales Alenia Space',
          location: 'Stuttgart, Germany',
          dfrom: 'September 2018',
          to: 'February 2019',
          descriptions: [
            'Creation and integration of a plugin in a RCP Java program allowing users to visualize all the experiment data in a single page',
          ],
        },
        {
          title: 'Study and development engineer (internship)',
          company: 'Cosmos Consulting',
          location: 'Aix en Provence, France',
          dfrom: 'January 2018',
          to: 'April 2018',
          descriptions: [
            'Creating a java program interface for the modification of the HTML, CSS and JS properties of a server in BI, allowing a user to make  seamless customizations',
          ],
        },
      ],
    },
    educations: [
      {
        title: 'IT Engineering diploma',
        school: 'CESI',
        location: 'Aix en Provence, France',
        dfrom: '2017',
        to: '2020',
        descriptions: ['Software development & Data Science'],
      },
      {
        title: '2-years university degree',
        school: 'IUT Savoie Mont-Blanc',
        location: 'Annecy, France',
        dfrom: '2015',
        to: '2017',
        descriptions: ['Applied physics, renewable energy option'],
      },
    ],
  },
];
