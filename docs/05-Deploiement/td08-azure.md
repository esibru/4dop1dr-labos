# TD 08 - Déploiement sur Microsoft Azure

Dans cet exercice, vous allez découvrir Microsoft Azure en suivant un tutoriel 
pratique pour déployer une application web conteneurisée. 
Vous apprendrez à utiliser Azure Container Registry (ACR) et Azure App Service 
pour gérer et exécuter votre application dans le cloud, tout en explorant les concepts 
clés du déploiement de conteneurs sur Azure.

### Objectifs 

À l’issue de ce TD, vous serez capable déployer une application web sur Microsoft Azure.

:::warning Pré-requis

1. Connaissance de base en Python, Docker, Git et des commandes shell.

:::

## Abonnement Azure 

Microsoft Azure est une plateforme de cloud computing proposée par Microsoft.
Elle permet aux entreprises et aux développeurs de créer, déployer et gérer 
des applications et des infrastructures à grande échelle.

Microsoft propose une offre spéciale pour les étudiants, appelée 
[Azure for Students](https://azure.microsoft.com/fr-fr/free/students), 
qui fournit un crédit gratuit ainsi que l'accès à différents services Azure sans frais 
pendant 12 mois. Cette offre ne nécessite pas de carte bancaire, mais une vérification 
du statut étudiant avec une adresse e-mail académique. 

Pour accéder à l'offre Azure for Students, rendez-vous sur le site officiel
[Azure for Students](https://azure.microsoft.com/fr-fr/free/students)
et cliquez sur "Démarrer gratuitement".

## Différentes solutions de déploiements

Microsoft Learn est une plateforme d'apprentissage en ligne proposée par Microsoft. 
Elle offre des tutoriels pour aider les développeurs à acquérir des compétences 
sur les technologies Microsoft, comme Azure. 

Afin de vous familiariser avec les solutions de déploiement de Microsoft Azure,
consultez sur cette plateforme le lien 
[https://learn.microsoft.com/fr-fr/training/modules/java-target-destinations/1-introduction](https://learn.microsoft.com/fr-fr/training/modules/java-target-destinations/1-introduction)


:::info Platform ou Infrastructure as a Service 

Retenez l'existence de deux modèles de cloud computing : 

1. Platform as a Service (**PaaS**) qui fournit 
une plateforme pour créer, tester, déployer et gérer des applications 
sans avoir à gérer l’infrastructure sous-jacente. 

1. Infrastructure as a Service (**IaaS**) qui fournit 
des ressources informatiques virtualisées permettant de louer des 
serveurs, du stockage, des réseaux et d'autres infrastructures informatiques 
au lieu d'acheter et de gérer du matériel physique. 

:::

## Déploiement d'une application conteneurisée

Afin de réaliser le déploiement d'une application conteneurisée, 
vous allez utilisez deux services Microsoft : 

1. **Azure Container Registry** (ACR) qui permet de stocker, 
gérer et distribuer des images de conteneurs Docker, comme vous pourriez
le faire via un compte Docker Hub. 

1. **Azure App Service** qui permet d’héberger des applications web, 
des API et des conteneurs.


Ce déploiement vous conduira à suivre les étapes suivantes :

1. **Créer une identité managée** : Créez une identité gérée par l'utilisateur 
pour authentifier l'accès aux ressources sans stocker de secrets.
1. **Créer un registre de conteneurs** : Configurez Azure Container Registry 
(ACR) pour stocker vos images Docker.
1. **Pousser l’image vers ACR** : Construisez et envoyez l’image de votre 
application vers ACR.
1. **Autoriser l’identité managée** : Accordez à l’identité managée l’accès 
à ACR pour récupérer les images.
1. **Créer l’application web** : Déployez une application Azure App Service 
pour exécuter le conteneur.
1. **Configurer l’application** : Définissez les variables d’environnement 
et autres paramètres.
1. **Accéder à l’application** : Ouvrez l’URL de l’application pour vérifier 
son bon fonctionnement.
1. **Consulter les logs** : Analysez les journaux de diagnostic pour détecter 
d’éventuels problèmes.
1. **Modifier et redéployer** : Apportez des changements au code, reconstruisez 
l’image et redéployez.
1. **Se connecter au conteneur via SSH** : Accédez au conteneur en ligne de 
commande pour le débogage.
1. **Nettoyer les ressources** : Supprimez les ressources Azure pour éviter 
des coûts inutiles.

:::warning Options du tutoriel

Dans le tutoriel proposé ci-dessous, prenez attention à sélectionner
l'option **Linux container** au début de la page.

Dans la suite du tutoriel il vous est proposé d'effectuer le déploiement
via Azure CLI ou **Azure Portal**, choisissez **Azure Portal**.
Aucune installation n'est nécessaire pour effectuer le tutoriel
via ce portail. L'objectif est de se familiariser avec les concepts Azure.
L'automatisation de la création de l'infrastructure via des outils en ligne de 
commande comme Terraform sera introduite dans les exercices suivants.

:::

Suivez la partie **Linux container** du tutoriel en utilisant **Azure Portal** : 
[https://learn.microsoft.com/en-us/azure/app-service/tutorial-custom-container](https://learn.microsoft.com/en-us/azure/app-service/tutorial-custom-container) afin de réaliser votre premier déploiement.

## Adaptation aux applications Spring-Boot

Si vous souhaitez automatiser le déploiement de l'application `demo-no-db`, vous devez 
construire l'infrastructure du tutoriel en utilisant l'image docker crée lors des 
exercices précédents.

Pour automatisez le déploiement il suffit dans le pipeline `gitlab-ci.yml` de déployer
l'image de `demo-no-db` sur le registre de conteneurs créé.

Si vous souhaitez déployer l’application `demo` associée à une base de donnée, vous devez
préciser lors de la création de votre Azure App Service l'existence de la base de données
et adaptez les variables d'environnements.

Vous réaliserez ces scénarios à la fin du semestre.