# Évolution du contenu des expériences

Comparaison entre le CV avant les entretiens de clarification (`0976c8c`) et la version actuelle (`a729dad`), dans `src/assets/data/content.ts`. Les changements décrits concernent les versions française et anglaise.

Ce document porte sur les faits, les responsabilités, les réalisations, les dates et les compétences associées. Il ne traite pas de la présentation des cartes ou de la longueur des textes. Il compare le contenu initial au contenu final, sans reprendre tous les ajouts des versions intermédiaires.

## Quanthome

### Ce qui était déjà présent

Le rôle de Technical Lead & Full Stack Engineer, les choix d’architecture, la coordination technique, l’autonomie jusqu’à la production et les réalisations suivantes étaient déjà documentés :

- Infrastructure Google Cloud, Cloud Run, Cloud SQL, IAM et réseau.
- Migration et modernisation des applications, CI/CD avec GitHub Actions.
- Applications TypeScript, Node.js et PostgreSQL, authentification partagée.
- Chat agentique immobilier, intégration de modèles d’IA et serveur MCP interne.
- Documentation et gestion des connaissances avec le RAG, outils CLI et qualité logicielle.

### Différences de fond

- React est désormais cité dans les réalisations full-stack ; il figurait déjà dans les compétences de cette expérience.
- Le pilotage des projets est explicitement rattaché au domaine de l’analyse de données immobilières.
- Certaines précisions ne sont plus explicites dans le texte final : infrastructure initialement inexistante et délégation des tâches. La création de l’infrastructure et la coordination des développements restent mentionnées.

Le périmètre reste globalement identique : aucune nouvelle fonction ni nouvelle livraison n’a été ajoutée. Le titre, la date de début et les compétences associées sont inchangés.

## Propulse Lab

### Avant

L’expérience mentionnait des outils de paiement et de réconciliation, la prévention de la fraude, une réduction significative des chargebacks, un raccourcisseur de liens avec A/B testing et des formations internes généralistes.

### Ajouts et précisions

- **Rôle et collaboration :** appartenance à l’équipe Transactions, travail en autonomie avec l’appui d’un développeur expérimenté et collaboration avec une référente fonctionnelle.
- **Abonnements :** gestion des abonnements explicitement ajoutée au périmètre des paiements et remboursements.
- **Réconciliation bancaire :** automatisation du rapprochement des paiements, remboursements, factures et abonnements au centime près. Le gain est précisé : moins de contrôles manuels pour les développeurs et l’équipe finance.
- **Chargebacks :** ajout des scripts d’analyse et de contestation, ainsi que des remboursements anticipés destinés à éviter certains chargebacks. La réduction significative, déjà présente dans le CV initial, est conservée après confirmation.
- **Antifraude :** clarification de la contribution : intégration des outils proposés par les PSP, plutôt que présentation d’un système de contrôle des commandes sans préciser son origine.
- **Migration :** ajout du passage de services PHP/Laravel vers Node.js et TypeScript sur AWS Lambda, et de l’adaptation des images PHP/Laravel sur AWS.
- **Prestataires de paiement :** Stripe est nommé. La participation au démarrage d’une solution multi-PSP est ajoutée, sans revendiquer la réalisation complète de ce projet.
- **Raccourcisseur de liens :** l’A/B testing est rattaché aux parcours et aux bons de commande.
- **Formations :** le sujet est précisé : SQL pour des collaborateurs non développeurs, afin de faciliter leur accès aux données métier.

Les dates et les compétences associées sont inchangées.

## MetaFactory

### Avant

Le CV décrivait l’optimisation d’une application C#/.NET, puis une API REST et une interface web en .NET, avec des bénéfices annoncés sur la sécurité, la maintenance et les interruptions de service.

### Ajouts et corrections

- **Contexte métier :** ajout du client Total, du trading et du shipping de produits pétroliers, avec gestion des prix, commandes, quantités et acheminements.
- **Développement applicatif :** précision des composants réalisés : sélecteurs pour des hiérarchies de produits en cascade dans une application métier complexe, avec Microsoft SQL.
- **Autonomie :** ajout de la progression dans les choix d’implémentation technique.
- **Correction majeure sur l’API :** remplacement de l’API et de l’interface web .NET par le travail réellement décrit : rétro-ingénierie d’une API C++, puis transposition de ses fonctionnalités vers Python.
- **Objectif de cette migration :** maintenance et évolutivité du code. Aucun gain de performance n’est revendiqué pour le passage vers Python.
- **Retrait des résultats non confirmés :** suppression de l’interface web et des affirmations d’amélioration de la sécurité et de réduction des interruptions de service qui lui étaient rattachées.

### Compétences associées

HTML/CSS, Agile et « Tests & qualité logicielle » ont été retirés de cette expérience. C#, .NET, SQL et Python sont conservés. Le retrait d’une association au CV ne constitue pas une conclusion générale sur la maîtrise de cette compétence.

Les dates sont inchangées.

## Monext

### Avant

L’intitulé « Ingénieur d’étude et développement & chef de projet » et la description pouvaient laisser comprendre qu’une migration du terminal de paiement vers Angular avait été réalisée pendant le stage.

### Ajouts et corrections

- **Rôle :** intitulé corrigé en « Assistant chef de projet informatique », cohérent avec le stage et la contribution décrite.
- **Périmètre réel :** analyse de l’existant, identification des besoins, cadrage et préparation de la modernisation du terminal de paiement virtuel Payline.
- **Angular et API REST :** présentés comme des pistes de migration étudiées, et non comme une migration complète réalisée par le stagiaire.
- **Gestion de projet :** ajout de la documentation fonctionnelle et technique, du suivi des dépendances et des échanges avec les équipes.
- **Contexte :** adaptation des priorités pendant le Covid ; réalisation de la migration planifiée après le stage.
- **Tests :** ajout d’une activité importante de mise en place et d’exécution de tests fonctionnels sur les services de paiement en ligne.
- **Développement :** contribution Angular maintenue, mais qualifiée de ponctuelle.
- **Date de début :** février 2020 au lieu de janvier 2020, conformément au rapport indiquant le 3 février. La fin reste juillet 2020.

### Compétences associées

Ajout d’Agile et de « Tests & qualité logicielle ». Retrait de Java, SQL et Spring. Angular, TypeScript et HTML/CSS sont conservés.

## Thales Alenia Space

### Avant

L’expérience décrivait simplement un plugin Java RCP pour enregistrer et visualiser des données expérimentales.

### Ajouts et précisions

- **Contexte :** identification de PLATIN et de son usage pour piloter des équipements de test au sol dans le spatial.
- **Stockage :** choix et intégration d’InfluxDB pour les mesures expérimentales.
- **Acquisition :** collecte des mesures, configuration des sources et de la fréquence d’acquisition.
- **Concurrence :** traitements concurrents pour préserver la réactivité de l’interface.
- **Utilisation :** interface graphique et commandes de script.
- **Visualisation :** intégration de tableaux de bord Grafana dans l’application et sur navigateur.
- **Organisation :** autonomie de développement, équipe internationale anglophone, suivi avec Jira, Git et Bitbucket.
- **Livraison :** précision que la mise en production est intervenue après le stage ; la contribution concernait le développement et l’intégration.
- **Lieu :** Ditzingen, dans la région de Stuttgart, au lieu de Stuttgart seul.
- **Date de fin :** janvier 2019 au lieu de février 2019, conformément à la fin du stage le 31 janvier.

SQL a été retiré des compétences associées ; Java est conservé. InfluxDB et Grafana sont documentés dans le texte, sans ajout de nouvelles entrées au registre des compétences.

## Cosmos Consulting

### Avant

Le CV mentionnait une application Java permettant de modifier des propriétés HTML, CSS et JavaScript d’un serveur de Business Intelligence, sans identifier le produit ni détailler le fonctionnement de l’outil.

### Ajouts et précisions

- **Projet :** identification de Kosmetic et du portail SAP BusinessObjects Fiori BI.
- **Destinataires :** outil destiné aux consultants pour personnaliser les installations des clients.
- **Fonctions :** configuration des couleurs, logos, textes d’accueil et thèmes.
- **Technologie :** interface Java/Swing et architecture MVC.
- **Automatisation :** modification ciblée des fichiers CSS, JavaScript et de configuration par expressions régulières, sauvegarde des fichiers, copie des ressources et redémarrage du serveur.
- **Responsabilités :** conception en autonomie, choix techniques et suivi avec le directeur technique.
- **Transmission :** versionnement Git, préparation d’une application portable avec Launch4j et rédaction d’un guide utilisateur.

TypeScript a été retiré des compétences associées ; Java et HTML/CSS sont conservés. La manipulation de fichiers JavaScript reste décrite dans le texte, sans être présentée comme du développement TypeScript.

Les dates sont inchangées.

## Origine des précisions

- Propulse Lab et MetaFactory : explications et corrections apportées pendant l’échange.
- Monext, Thales Alenia Space et Cosmos Consulting : rapports de stage fournis, complétés par les précisions orales sur le rôle et les livraisons.
- Quanthome : contenu déjà présent dans le CV, sans nouvel entretien de fond.

Les diplômes, les projets personnels et les autres rubriques du CV ne sont pas concernés par ces modifications. Les expériences présentes uniquement sur LinkedIn n’ont pas été ajoutées au site.
