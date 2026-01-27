import { CVDataContent } from './contentInterface';
export const content: CVDataContent[] = [
  {
    language: 'french',
    header: {
      name: 'Paul',
      surname: 'Pera',
      title: 'Développeur fullstack',
      address: 'Chemin des épinettes 36, 1007 Lausanne, CH',
      phone: '+41 76 699 42 12',
      mail: 'paul.pera@viacesi.fr',
    },
    details: {
      birth: '27 ans',
      licenses: ['Permis de conduire', 'Permis bateau', 'Brevet de secourisme'],
    },
    skillCategories: [
      {
        name: 'Langages de programmation & scripting',
        skills: [
          {
            lang: 'TypeScript (& JavaScript)',
            time: '6 années',
            level: 'projets professionnels & personnels : niveau avancé',
          },
          {
            lang: 'C#',
            time: '3 années',
            level: 'projets professionnels : bon niveau',
          },
          {
            lang: 'Java',
            time: '3 années',
            level: 'projets professionnels & personnels : bon niveau',
          },
          {
            lang: 'Python',
            time: '4 années',
            level: 'projets professionnels & personnels : niveau intermédiaire',
          },
          {
            lang: 'PHP',
            time: '1 année',
            level: 'projets professionnels : bonnes bases',
          },
          {
            lang: 'HTML / CSS',
            time: '5 années',
            level: 'projets professionnels & personnels : bon niveau',
          },
        ],
      },
      {
        name: 'Frameworks & librairies',
        skills: [
          {
            lang: 'Node.js',
            time: '5 années',
            level: 'projets professionnels & personnels : niveau avancé',
          },
          {
            lang: '.NET',
            time: '2 années',
            level: 'projets professionnels : niveau intermédiaire',
          },
          {
            lang: 'Spring',
            time: '1 année',
            level: 'projets personnels : débutant',
          },
          {
            lang: 'Vue.js',
            time: '3 années',
            level: 'projets professionnels : niveau intermédiaire',
          },
          {
            lang: 'Angular',
            time: '1 année',
            level: 'projets professionnels & personnels : bonnes bases',
          },
          {
            lang: 'React',
            time: '3 années',
            level: 'projets professionnels & personnels : niveau intermédiaire',
          },
          {
            lang: 'Laravel',
            time: '1 année',
            level: 'projets professionnels : débutant',
          },
        ],
      },
      {
        name: 'DevOps & Cloud',
        skills: [
          {
            lang: 'CI/CD (GitHub Actions, CircleCI, SeedCI)',
            time: '4 années',
            level: 'projets professionnels : bon niveau',
          },
          {
            lang: 'Terraform (IaC)',
            time: '2 années',
            level: 'projets professionnels : bon niveau',
          },
          {
            lang: 'Docker',
            time: '2 années',
            level: 'projets professionnels & personnels : niveau intermédiaire',
          },
          {
            lang: 'AWS',
            time: '3 années',
            level: 'projets professionnels : niveau avancé',
          },
          {
            lang: 'Google Cloud / Firebase',
            time: '1 année',
            level: 'projets personnels : bases',
          },
          {
            lang: 'Netlify',
            time: '1 année',
            level: 'projets personnels : bases',
          },
        ],
      },
      {
        name: 'Méthodes & pratiques',
        skills: [
          {
            lang: 'Méthodes Agile',
            time: '5 années',
            level: 'projets professionnels & personnels : pratique quotidienne',
          },
          {
            lang: 'Tests & qualité logicielle',
            time: '4 années',
            level: 'tests unitaires, intégration, contrôle qualité',
          },
          {
            lang: 'Architecture applicative',
            time: '4 années',
            level: 'applications modulaires, scalables et maintenables',
          },
        ],
      },
    ],
    softskills: [
      'Esprit d\'équipe',
      'Communication claire et collaborative',
      'Autonomie',
      'Flexibilité et capacité d\'adaptation',
      'Recherche continue d\'amélioration',
      'Curiosité technique et fonctionnelle',
      'Sens des responsabilités',
      'Anglais : niveau professionnel',
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
      'Ingénieur full-stack orienté produit, je conçois, développe et déploie des applications web modernes et scalables, avec une forte expertise en React, Node.js, PostgreSQL, Docker et architectures cloud (AWS, serverless). Je travaille beaucoup sur l\'intégration avancée de l\'IA (agents, MCP, RAG), avec une approche pragmatique : code propre, systèmes maintenables et valeur métier concrète.',
    experiences: {
      pro: [
        {
          title: 'Fullstack dev, devops, solution architect',
          company: 'Quanthome',
          location: 'Lausanne, Suisse',
          dfrom: 'Octobre 2024',
          to: 'Aujourd\'hui',
          descriptions: [
            'Développement d\'un back-office immobilier pour la saisie et le traitement de données, et d\'un agent conversationnel IA fullstack pour l\'analyse immobilière des données propriétaires.',
            'Stack : React, Node.js, PostgreSQL, Docker, authentification, suivi d\'usage, gestion des abonnements/paiements.',
            'IA : prompt engineering, MCP patterns, RAG, systèmes agentiques, analyses contextualisées pour la finance.',
          ],
        },
        {
          title: 'Fullstack dev, devops, solution architect',
          company: 'Propulselab',
          location: 'Lausanne, Suisse',
          dfrom: 'Janvier 2023',
          to: 'Octobre 2024',
          descriptions: [
            'Conception d\'outils autour des paiements (PSP, remboursements, réconciliations, lutte contre la fraude), permettant une meilleure fiabilité des flux financiers et une réduction significative des chargebacks.',
            'Développement d\'un link shortener paramétrable avec statistiques, améliorant l\'efficacité des A/B tests et l\'exploitation des données marketing.',
            'Création d\'un système de contrôle des commandes, réduisant les tentatives de fraude et sécurisant le parcours d\'achat.',
            'Formations internes aux bases du développement, facilitant la montée en compétences des collaborateurs non techniques.',
          ],
        },
        {
          title: 'Ingénieur d\'étude et développement',
          company: 'Metafactory',
          location: 'Paris, France',
          dfrom: 'Septembre 2020',
          to: 'Mai 2022',
          descriptions: [
            "Optimisation d\'une application en C# .net, accélérant la navigation utilisateur et réduisant les temps de réponse de l\'interface.",
            "Développement d\'une API REST et d\'une interface web en .NET, dissociant le front-end des serveurs, ce qui a amélioré la sécurité, facilité la maintenance et réduit les interruptions de service."
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
      title: 'Full-stack Developer',
      address: 'Chemin des épinettes 36, 1007 Lausanne, Switzerland',
      phone: '+41 76 699 42 12',
      mail: 'paul.pera@viacesi.fr',
    },
    details: {
      birth: '27 years old',
      licenses: [
        'Driving license',
        'Boat license',
        'First aid certificate',
      ],
    },
    skillCategories: [
      {
        name: 'Programming & Scripting Languages',
        skills: [
          {
            lang: 'TypeScript (& JavaScript)',
            time: '6 years',
            level: 'professional & personal projects: advanced level',
          },
          {
            lang: 'C#',
            time: '3 years',
            level: 'professional projects: good level',
          },
          {
            lang: 'Java',
            time: '3 years',
            level: 'professional & personal projects: good level',
          },
          {
            lang: 'Python',
            time: '4 years',
            level: 'professional & personal projects: intermediate level',
          },
          {
            lang: 'PHP',
            time: '1 year',
            level: 'professional projects: solid foundations',
          },
          {
            lang: 'HTML / CSS',
            time: '5 years',
            level: 'professional & personal projects: good level',
          },
        ],
      },
      {
        name: 'Frameworks & Libraries',
        skills: [
          {
            lang: 'Node.js',
            time: '5 years',
            level: 'professional & personal projects: advanced level',
          },
          {
            lang: '.NET',
            time: '2 years',
            level: 'professional projects: intermediate level',
          },
          {
            lang: 'Spring',
            time: '1 year',
            level: 'personal projects: beginner',
          },
          {
            lang: 'Vue.js',
            time: '3 years',
            level: 'professional projects: intermediate level',
          },
          {
            lang: 'Angular',
            time: '1 year',
            level: 'professional & personal projects: solid foundations',
          },
          {
            lang: 'React',
            time: '3 years',
            level: 'professional & personal projects: intermediate level',
          },
          {
            lang: 'Laravel',
            time: '1 year',
            level: 'professional projects: beginner',
          },
        ],
      },
      {
        name: 'DevOps & Cloud',
        skills: [
          {
            lang: 'CI/CD (GitHub Actions, CircleCI, SeedCI)',
            time: '4 years',
            level: 'professional projects: good level',
          },
          {
            lang: 'Terraform (IaC)',
            time: '2 years',
            level: 'professional projects: good level',
          },
          {
            lang: 'Docker',
            time: '2 years',
            level: 'professional & personal projects: intermediate level',
          },
          {
            lang: 'AWS',
            time: '3 years',
            level: 'professional projects: advanced level',
          },
          {
            lang: 'Google Cloud / Firebase',
            time: '1 year',
            level: 'personal projects: basic level',
          },
          {
            lang: 'Netlify',
            time: '1 year',
            level: 'personal projects: basic level',
          },
        ],
      },
      {
        name: 'Methods & Practices',
        skills: [
          {
            lang: 'Agile methodologies',
            time: '5 years',
            level: 'professional & personal projects: daily practice',
          },
          {
            lang: 'Testing & Software Quality',
            time: '4 years',
            level: 'unit testing, integration testing, quality control',
          },
          {
            lang: 'Application Architecture',
            time: '4 years',
            level: 'modular, scalable and maintainable applications',
          },
        ],
      },
    ],
    softskills: [
      'Team spirit',
      'Clear and collaborative communication',
      'Autonomy',
      'Flexibility and adaptability',
      'Continuous improvement mindset',
      'Technical and functional curiosity',
      'Sense of responsibility',
      'English: professional proficiency',
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
      { name: 'Photo/Video editing', type: 'other' },
      { name: 'Drones', type: 'other' },
    ],
    profile:
      'Product-oriented full-stack engineer, I design, develop and deploy modern, scalable web applications, with strong expertise in React, Node.js, PostgreSQL, Docker and cloud architectures (AWS, serverless). I work extensively on advanced AI integration (agents, MCP, RAG), with a pragmatic approach: clean code, maintainable systems and concrete business value.',
    experiences: {
      pro: [
        {
          title: 'Full-stack Developer, DevOps, Solution Architect',
          company: 'Quanthome',
          location: 'Lausanne, Switzerland',
          dfrom: 'October 2024',
          to: 'Present',
          descriptions: [
            'Development of a real estate back office for data entry and processing, and a fullstack AI conversational agent for real estate analysis of owner data.',
            'Stack: React, Node.js, PostgreSQL, Docker, authentication, usage tracking, subscription/payment management.',
            'AI: prompt engineering, MCP patterns, RAG, agentic systems, contextualized analyses for finance.',
          ],
        },
        {
          title: 'Full-stack Developer, DevOps, Solution Architect',
          company: 'Propulselab',
          location: 'Lausanne, Switzerland',
          dfrom: 'January 2023',
          to: 'October 2024',
          descriptions: [
            'Design of tools around payments (PSP, refunds, reconciliations, fraud prevention), enabling better reliability of financial flows and a significant reduction in chargebacks.',
            'Development of a configurable link shortener with statistics, improving the efficiency of A/B tests and the exploitation of marketing data.',
            'Creation of an order control system, reducing fraud attempts and securing the purchasing process.',
            'Internal training in the basics of development, facilitating the upskilling of non-technical staff.',
          ],
        },
        {
          title: 'Software Engineer',
          company: 'Metafactory',
          location: 'Paris, France',
          dfrom: 'September 2020',
          to: 'May 2022',
          descriptions: [
            'Optimization of a C# .net application, accelerating user navigation and reducing interface response times.',
            'Development of a REST API and a web interface in .NET, separating the front-end from the servers, which improved security, facilitated maintenance and reduced service interruptions.',
          ],
        },
      ],
      stage: [
        {
          title: 'Software Engineer & Project Manager',
          company: 'Monext',
          location: 'Aix-en-Provence, France',
          dfrom: 'January 2020',
          to: 'July 2020',
          descriptions: [
            'Migration of a virtual electronic payment terminal application to Angular to meet PCI-DSS security standards, modernizing and redesigning the user interface.',
          ],
        },
        {
          title: 'Software Engineer',
          company: 'Thales Alenia Space',
          location: 'Stuttgart, Germany',
          dfrom: 'September 2018',
          to: 'February 2019',
          descriptions: [
            'Creation and integration of a plugin in a Java RCP application allowing users to record and visualize experimental data through a simple interface.',
          ],
        },
        {
          title: 'Software Engineer',
          company: 'Cosmos Consulting',
          location: 'Aix-en-Provence, France',
          dfrom: 'January 2018',
          to: 'April 2018',
          descriptions: [
            'Development of a Java application to modify HTML, CSS and JS properties of a Business Intelligence server, enabling easy interface customization.',
          ],
        },
      ],
    },
    educations: [
      {
        title: 'Master\'s Degree in Computer Engineering',
        school: 'CESI',
        location: 'Aix-en-Provence, France',
        dfrom: '2017',
        to: '2020',
        descriptions: ['Software development & data science'],
      },
      {
        title: 'Associate Degree (DUT)',
        school: 'IUT Savoie Mont-Blanc',
        location: 'Annecy, France',
        dfrom: '2015',
        to: '2017',
        descriptions: [
          'Physical measurements, renewable energy specialization',
        ],
      },
    ],
  }
];
