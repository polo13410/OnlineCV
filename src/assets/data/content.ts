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
        name: 'Frameworks & Langages',
        skills: [
          {
            lang: 'NodeJS (JS, TS)',
            time: '5 années',
            level: 'projets professionnels & personnels: avancé',
          },
          {
            lang: 'VueJS, React',
            time: '3 années',
            level: 'projets professionnels & personnels: avancé',
          },
          {
            lang: 'POO C#, Java',
            time: '3 années',
            level: 'projets professionnels & personnels: avancé',
          },
          {
            lang: 'Python',
            time: '3 années',
            level: 'projets professionnels: bon niveau',
          },
          {
            lang: 'PHP',
            time: '1 année',
            level: 'projets professionnels: bases',
          },
        ],
      },
      {
        name: 'DevOps & Cloud',
        skills: [
          {
            lang: 'DevOps',
            time: '3 années',
            level: 'projets professionnels & personnels: avancé'
          },
          {
            lang: 'Cloud AWS, Google',
            time: '4 années',
            level: 'projets professionnels & personnels: avancé',
          },
        ],
      },
      {
        name: 'Méthodes',
        skills: [
          {
            lang: 'Agile',
            time: '5 années',
            level: 'projets professionnels & personnels: quotidien',
          },
        ]
      }
    ],
    softskills: [
      "Esprit d'équipe",
      'Flexibilité et adaptation',
      'Autonomie',
      'Anglais: professionnel',
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
            'Optimisation d\'une application en C# .net, accélérant la navigation utilisateur et réduisant les temps de réponse de l\'interface.',
            'Développement d\'une API REST et d\'une interface web en .NET, dissociant le front-end des serveurs, ce qui a amélioré la sécurité, facilité la maintenance et réduit les interruptions de service.',
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
            'Plusieurs projets en C# et Microsoft SQL pour un logiciel de trading & shipping, permettant à l\'utilisateur final une navigation optimisée et plus rapide et de nouvelles fonctionnalités et interactions.',
            'Création d\'une interface web avec une API REST et le framework .NET afin de dissocier une application de trading de ses serveurs dans le but de faciliter la maintenance et améliorer la sécurité.',
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
        name: 'Frameworks & Languages',
        skills: [
          {
            lang: 'NodeJS (JS, TS)',
            time: '5 years',
            level: 'professional & personal projects: advanced',
          },
          {
            lang: 'VueJS, React',
            time: '3 years',
            level: 'professional & personal projects: advanced',
          },
          {
            lang: 'OOP C#, Java',
            time: '3 years',
            level: 'professional & personal projects: advanced',
          },
          {
            lang: 'Python',
            time: '3 years',
            level: 'professional projects: good level',
          },
          {
            lang: 'PHP',
            time: '1 year',
            level: 'professional projects: basics',
          },
        ],
      },
      {
        name: 'DevOps & Cloud',
        skills: [
          {
            lang: 'DevOps',
            time: '3 years',
            level: 'professional & personal projects: advanced',
          },
          {
            lang: 'Cloud (AWS, Google)',
            time: '4 years',
            level: 'professional & personal projects: advanced',
          },
        ],
      },
      {
        name: 'Methods',
        skills: [
          {
            lang: 'Agile',
            time: '5 years',
            level: 'professional & personal projects: daily practice',
          },
        ],
      },
    ],
    softskills: [
      'Team spirit',
      'Flexibility and adaptability',
      'Autonomy',
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
            'Development of a real estate back-office for data entry and processing, as well as a full-stack AI conversational agent for real estate data analysis based on proprietary datasets.',
            'Stack: React, Node.js, PostgreSQL, Docker, authentication, usage tracking, subscription and payment management.',
            'AI: prompt engineering, MCP patterns, RAG, agent-based systems, contextualized financial analyses.',
          ],
        },
        {
          title: 'Full-stack Developer, DevOps, Solution Architect',
          company: 'Propulselab',
          location: 'Lausanne, Switzerland',
          dfrom: 'January 2023',
          to: 'October 2024',
          descriptions: [
            'Optimization of a C# .NET application, improving user navigation speed and reducing UI response times.',
            'Development of a REST API and a web interface in .NET, decoupling the front-end from servers, improving security, maintainability and reducing service interruptions.',
            'Design of payment-related tools (PSPs, refunds, reconciliations, fraud prevention), increasing financial flow reliability and significantly reducing chargebacks.',
            'Development of a configurable link shortener with analytics, improving A/B testing efficiency and marketing data usage.',
            'Creation of an order control system, reducing fraud attempts and securing the purchasing flow.',
            'Internal training sessions on software development fundamentals, enabling non-technical team members to upskill.',
          ],
        },
        {
          title: 'Software Engineer',
          company: 'Metafactory',
          location: 'Paris, France',
          dfrom: 'September 2020',
          to: 'May 2022',
          descriptions: [
            'Multiple C# and Microsoft SQL projects for a trading & shipping software, providing faster navigation, new features and improved user interactions.',
            'Creation of a web interface with a REST API using the .NET framework to decouple a trading application from its servers, improving maintainability and security.',
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
        title: 'Master’s Degree in Computer Engineering',
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
