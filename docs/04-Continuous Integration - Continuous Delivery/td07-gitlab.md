import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# TD 07 - Gitlab CI/CD

GitLab CI/CD (Continuous Integration / Continuous Deployment) est un outil puissant qui permet d'automatiser le processus de développement logiciel, du test au déploiement. Il repose sur des **pipelines**, composés de **jobs** s'exécutant dans des **stages**.

Dans cette série d'exercices, vous apprendrez à configurer un pipeline GitLab CI/CD, à automatiser les tests et à déployer des applications de manière efficace. 


### Objectifs 

À l’issue de ce TD, vous serez capable déployer une application sur Alwaysdata en utilisant un pipeline GitLab CI/CD.

:::warning Pré-requis

1. Connaissance de base en Java, Python, Docker et des commandes shell.
1. Un environnement de travail prêt avec Java (JDK 17 minimum), Python 3.8+, Docker Engine et un IDE.
1. Notions de base sur Git, GitLab et SonarQube.
1. Bases sur les fichiers YAML

:::

## Installation

Pour utiliser GitLab CI/CD, vous devrez :

1. Lancer un conteneur exécutant les instructions transmises par 
GitLab, appelé GitLab Runner.
1. Générer un token permettant à ce GitLab Runner de communiquer 
avec le serveur GitLab.
1. Enregistrer ce GitLab Runner, s'exécutant sur votre machine 
hôte, auprès du serveur GitLab.

:::tip Définition de pipeline et de jobs dans GitLab CI/CD

Un **pipeline** est un processus automatisé qui exécute une série 
de **jobs** définis dans un fichier *.gitlab-ci.yml*.

Un **job** est une unité d’exécution définie dans le fichier 
*.gitlab-ci.yml*. Il correspond à une tâche spécifique à exécuter 
dans le pipeline, comme :

- Exécuter des tests
- Construire un projet
- Déployer une application

:::

### Installation du runner

Un **GitLab Runner** est un programme qui exécute les tâches 
définies dans un pipeline GitLab CI/CD. 
Il prend en charge l’exécution des **jobs** spécifiés dans un 
fichier `.gitlab-ci.yml`.

Les runners peuvent être partagés, c'est à dire gérés par le 
serveur GitLab ou spécifiques et installés sur une machine privée. 
Ils s’exécutent dans différents environnements (Docker, shell, …) 
et permettent d'automatiser le processus de développement. 


Afin d'éviter d’installer les dépendances sur votre machine hôte et de garantir un environnement identique à chaque exécution, vous allez installer un runner sur votre machine dans un environnements Docker en utilisant l'image gitlab-runner. 
La procédure d'installation décrite ci-dessous s'inspire de 
[la documentation sur gitlab-runner](https://docs.gitlab.com/runner/install/docker/).
N'hésitez pas à la consulter si vous souhaitez découvrir plus de possibilités d'installation.


Pour faciliter la communication entre les services Docker et 
GitLab Runner, vous allez utiliser un **socket** unix.

:::tip socket

Un socket est un point de communication utilisé pour échanger des 
données entre des processus. Il permet la communication entre 
applications, soit localement sur une même machine, soit à 
distance via un réseau.

En particulier `/var/run/docker.sock` est un socket UNIX utilisé pour communiquer 
avec le daemon Docker (*dockerd*) sans passer par une connexion 
réseau. Il permet aux processus locaux, comme un GitLab Runner ou 
un autre conteneur, de contrôler Docker sur la machine hôte.

:::

<Tabs groupId="operating-systems">
  <TabItem value="Linux/macOS" label="Linux/MacOS">

  Exécutez la commande ci-dessous pour démarrer le runner : 

  ```sh
  docker run -d \
    --name gitlab-runner \
    --restart always \
    -v /srv/gitlab-runner/config:/etc/gitlab-runner \
    -v /var/run/docker.sock:/var/run/docker.sock \
    gitlab/gitlab-runner:latest
  ```

  Le dossier`/srv` existe par défaut sur votre machine hôte et est
  destiné à héberger des données de services (serveurs web, 
  applications…).
  Sur certaines distributions minimalistes ou personnalisées, il 
  peut être absent, et il faut alors le créer manuellement. 
  Le dossier `/srv/gitlab-runner/config` est utilisé pour stocker 
  la **configuration persistante du GitLab Runner**. 

 </TabItem>
  <TabItem value="win" label="Windows">

  Sous Windows, Docker fonctionne via Docker Desktop, qui crée une 
  machine virtuelle Linux pour exécuter les conteneurs. 
  Cette séparation complique la communication entre GitLab Runner 
  et Docker, notamment si Docker s'exécute en dehors de WSL 
  (Windows Subsystem for Linux). 
  Par contre si vous activez WSL 2, vous pouvez simplement 
  utiliser le socket unix `/var/run/docker.sock`, comme sous Linux.

  Si ce n'est déjà fait, commencez par installer Ubuntu via WSL
  via la commande ci-dessous : 

  ```sh
  wsl  --install Ubuntu
  ```

  Afin de garantir que toute nouvelle distribution installée 
  utilisera WSL 2, exécutez la commande suivante : 

  ```sh
  wsl --set-default-version 2 wsl --set-version Ubuntu
  ```

  Dans Docker Desktop, 
  [changez la configuration de Docker pour utiliser WSL](https://docs.docker.com/desktop/settings-and-maintenance/settings/).


  Ensuite créez un dossier qui servira de volume pour conserver la 
  configuration du runner grâce à la commande ci-dessous, 
  `chemin_absolu_vers_la_configuration` est à remplacer par le dossier de votre choix :

  ```sh
  mkdir chemin_absolu_vers_la_configuration/gitlab-runner/config
  ```

  Finalement utilisez la commande suivante pour démarrer le 
  runner : 
 
  ```sh
  docker run -d ^
    --name gitlab-runner ^
    --restart always ^
    -v chemin_absolu_vers_la_configuration\gitlab-runner\config:/etc/gitlab-runner ^
    -v /var/run/docker.sock:/var/run/docker.sock ^
    gitlab/gitlab-runner:latest
  ```

  Le caractère ^ (accent circonflexe) est utilisé
  pour continuer une commande sur plusieurs lignes.

  </TabItem>
</Tabs>

### Création du token pour un projet

Un GitLab Runner doit être enregistré auprès d’un projet GitLab 
pour exécuter ses pipelines. 
Pour cela, il a besoin d’un token d’enregistrement, qui sert à 
authentifier le runner et à l’associer au projet.
Afin de créer ce token  : 

- Créez un projet [sur GitLab](https://git.esi-bru.be).
- Dans le menu du projet *Settings > CI/CD*, ouvrez la section *Runners*.
- Créez le runner via le bouton *New project runner*.
- Cochez la case *Run untagged jobs*.
- Copiez le runner authentication token avant qu'il ne disparaisse.
- **Exportez** la valeur du token dans la variable **RUNNER_TOKEN**.

:::tip Pourquoi cochez Run untagged jobs ?

Les runners GitLab peuvent être associés à des tags pour mieux 
organiser l'exécution des jobs.
Un job sans tags sera exécuté **uniquement** par un runner qui 
n’exige pas de tags.

:::

### Enregistrement d'un runner

Pour enregistrer le runner de votre machine hôte, il faut exécuter
la commande `register` du conteneur `gitlab-runner` : 

<Tabs groupId="operating-systems">
  <TabItem value="Linux/macOS" label="Linux/MacOS">

```sh
docker run --rm \
  -v /srv/gitlab-runner/config:/etc/gitlab-runner \
  gitlab/gitlab-runner register \
    --non-interactive \
    --url "https://git.esi-bru.be" \
    --token "$RUNNER_TOKEN" \
    --executor "docker" \
    --docker-image alpine:latest \
    --description "docker-runner"
```

 </TabItem>
  <TabItem value="win" label="Windows">

```sh
docker run --rm ^
  -v chemin_absolu_vers_la_configuration\gitlab-runner\config:/etc/gitlab-runner ^
  gitlab/gitlab-runner register ^
    --non-interactive ^
    --url "https://git.esi-bru.be" ^
    --token "$RUNNER_TOKEN" 
    --executor "docker" ^
    --docker-image alpine:latest ^
    --description "docker-runner"
```

  </TabItem>
</Tabs>

:::note Exercice A : Interpréter la commande docker run

Associez les descriptions ci-dessous aux différents paramètres de 
la commande précédente (`--non-interactive`, `--url "https://git.esi-bru.be"`, ... ) : 

- Fournit une description pour le runner, qui permet de l'identifier dans l'interface GitLab.
- Spécifie l'URL de votre instance GitLab. 
- Utilise le token d'enregistrement contenu dans la variable d'environnement $RUNNER_TOKEN.
- Indique que l'enregistrement du runner doit se faire sans interaction utilisateur, ce qui est **essentiel pour inclure la commande dans un script**.
- Spécifie l'image Docker à utiliser pour exécuter les jobs.
- Définit l'exécuteur, c'est à dire l'environnement d'exécution utilisé par le runner.

:::

**Pour valider le succès de l'enregistrement**, consultez la liste des runners de votre projet sur le serveur GitLab via le menu 
*Settings > CI/CD*.

## Premier script

### Hello World

Maintenant que le runner est configuré, créez 
**à la racine de votre projet** le fichier `.gitlab-ci.yml` 
suivant : 

```yaml title=".gitlab-ci.yml" showLineNumbers
my_first_job:
  script:
    - echo "Hello World!"
```

Ce fichier définit un pipeline GitLab CI/CD avec un seul job nommé 
**my_first_job**.

| Élément          | Description |
|-----------------|-------------|
| `my_first_job:`  | Nom du job, qui apparaîtra dans l'interface GitLab CI/CD. |
| `script:`        | Indique la ou les commandes à exécuter dans le job. |
| `- echo "Hello World!"` | Commande exécutée dans l'environnement du runner. Elle affiche simplement `Hello World!` dans la console. |


Déposez ce fichier sur le dépôt, via les étapes `git add .`,
`git commit -m "Premier pipeline"` et `git push`. 

Lorsqu'un commit est poussé dans le dépôt, GitLab CI/CD détecte le 
fichier `.gitlab-ci.yml`. Il crée alors un pipeline et exécute le 
job `my_first_job`. Le runner associé exécute le script qui 
affiche le message dans les logs. Le job se termine avec le statut 
*Success*, sauf en cas d'erreur.

Pour vérifier l'exécution du job, consultez sur la page de votre 
projet sur le serveur GitLab, le menu **Build > Jobs**.
Cliquez ensuite sur le nom du job, ressemblant à 
`#7562: my_first_job`,  afin de lire les logs de l'exécution. 
Cherchez dans ces logs le résultat de l'instruction 
`echo "Hello World!"`.

### Variables du projet

Vous pouvez déclarer une variable dans le fichier `.gitlab-ci.yml`
via le mot clé `variables` :

```yaml title=".gitlab-ci.yml" showLineNumbers
variables:
  FIRST_VARIABLE: "Test"

deploy_job:
  script:
    - echo "Hello World!"
    - echo "Contenu de la variable FIRST_VARIABLE $FIRST_VARIABLE"    
```

Vous pouvez également définir une variable via l’interface GitLab.
Dans le menu **Settings > CI/CD/ Variables**, il faut cliquer sur 
*Add Variable* et remplir les champs :

- Type : Variable d’environnement ou fichier.
- Environments : Appliquer à tous les environnements ou un spécifique. Les environnements peuvent être définis via le mot clé
`environment` dans le script.
- Options :
  - Protected : Utilisable uniquement sur [les branches protégées](https://git.esi-bru.be/help/user/project/protected_branches.md).
  - Masked : Cachée dans les logs CI/CD.
- Key : nom de la variable, par exemple MY_VARIABLE
- Value : Valeur de la variable.

Lorsqu’une variable est de type *Fichier*, sa valeur est stockée 
dans un fichier temporaire sur le runner pendant l’exécution du 
job. Cette option est utile pour stocker des certificats ou des 
clés privées

Le champ *Masked* permet de cacher la valeur de la variable 
lorsqu’elle apparaît dans les logs des jobs ou dans l’interface. 
**Cette option est particulièrement utile pour protéger des informations sensibles** (comme des mots de passe, des clés API ou 
des tokens).

:::note Exercice B : Créer une variable

Créez la variable MY_VARIABLE avec la valeur 42
via l’interface GitLab. Vérifiez la création de la
variable via une mise à jour du fichier *gitlab-ci.yml*.

```yaml title=".gitlab-ci.yml" showLineNumbers
my_first_job:
  script:
    - echo "Hello World!"
    - echo "La valeur de MY_VARIABLE est '$MY_VARIABLE'"
```

:::

:::tip mise à jour du pipeline

Pour mettre à jour le fichier *gitlab-ci.yml* directement
via l'interface GitLab, ouvrez le menu **Build > Pipeline editor**
de votre projet. Une fois vos modifications rédigées, appuyez
sur le bouton **Commit changes**.

:::

### Condition

Pour ajouter une condition sur une variable vous pouvez
utiliser le bloc conditionnel de votre shell.
Par exemple, le script peut ressembler à : 

```yaml title=".gitlab-ci.yml" showLineNumbers
my_first_job:
  script:
    - echo "Hello World!"
    - |
      if [ "$MY_VARIABLE" -eq 42 ]; then
        echo "La variable MY_VARIABLE vaut 42 comme attendu"
      else
        echo "Attention la variable MY_VARIABLE n'a pas la valeur prévue $MY_VARIABLE"
      fi    
```

:::tip Block Style Indicator

En YAML le *Block Style Indicator* est un mécanisme qui permet de 
spécifier un bloc de texte multiligne de manière plus lisible et 
structurée. L'indicateur **|** est utilisé pour indiquer que vous 
avez un texte multiligne. Les retours à la ligne et les 
indentations seront préservés dans le fichier YAML.

:::

### Variables prédéfinies

Plusieurs variables sont prédéfinies pour le runner.
On trouve par exemple CI_COMMIT_AUTHOR contenant l'auteur du commit
ou encore CI_COMMIT_BRANCH contenant la branche sur laquelle le commit a été effectué.
Vous pouvez consulter la [liste des variables prédéfinies](https://docs.gitlab.com/ci/variables/predefined_variables/).

:::note Exercice C : Utiliser des variables prédéfinies

Modifiez votre pipeline pour afficher les informations suivantes :
- Url du Projet
- Auteur du commit
- Branche de commit

Vérifiez le résultat de l'exécution de votre pipeline.

:::


### Execution failed

Dans cette section vous allez créer un pipeline qui va se
terminer en échec afin d'expérimenter comment GitLab vous informe 
d'une erreur.

:::note Exercice D : Déterminer le statut d'un job

Modifiez votre pipeline en demandant au job d'afficher la
version de maven utilisable dans le runner.

```yaml title=".gitlab-ci.yml" showLineNumbers
my_first_job:
  script:
    - mvn --version
```

Maven n'étant pas installé dans l'image de votre runner, vérifiez 
que le statut de votre job est **failed** via le menu **Build > Jobs**

Cherchez dans les logs la cause de l'erreur.

:::

### Before et after script

Si vous souhaitez exécuter une action avant ou après l'exécution 
des instructions contenues dans la partie script d'un job, vous 
pouvez ajouter les sections `before_script` et `after_script` comme
dans l'exemple suivant : 

```yaml title=".gitlab-ci.yml" showLineNumbers
my_first_job:
  before_script:
    - echo "Installation des dépendances..."
    - apk update
    - apk add curl
    - echo "Dépendances installées. Début du job..."
  script:
    - echo "Exécution du job"
  after_script:
    - echo "Nettoyage des fichiers temporaires (si nécessaire)..."
    - echo "Fin du job."
```

:::note Exercice D : Installer Maven

Afin de corriger le pipeline précédent, il faut installer maven
dans votre runner. Modifiez ce pipeline pour installer maven via
la directive `before_script`.

:::

### Default et image

Dans un fichier .gitlab-ci.yml, la directive `image:` est utilisée 
pour spécifier l'image Docker que GitLab CI/CD doit utiliser pour 
**exécuter le job**. 
Cette image définit l'environnement dans lequel les commandes du 
job seront exécutées. Cela permet de personnaliser l'environnement 
d'exécution et de s'assurer que les outils ou dépendances 
nécessaires sont disponibles.

Par exemple vous pouvez utiliser une image spécifique
pour un job nécessitant maven.

```yaml title=".gitlab-ci.yml" showLineNumbers
my_first_job:
  image: maven:3.9.9-eclipse-temurin-23-alpine
  script:
    - mvn --version
```

## Définition d'un pipeline

### Stages et dépendances

Dans un fichier `.gitlab-ci.yml`, la directive `stages` permet de 
définir les différentes étapes du pipeline. L'exécution de ces 
étapes est séquentielle, 
**tous les jobs d'un stage doivent être terminés avec succès** 
avant de passer au stage suivant.

Dans l'exemple ci-dessous, le pipeline est structuré en 3 étapes : 
`build`, `test`, et `deploy`. `build_job` s’exécute en premier, 
une fois terminé, `test_job` démarre et une fois les tests 
réussis, `deploy_job` démarre.

```yaml title=".gitlab-ci.yml" showLineNumbers
// highlight-next-line
stages:
  - build
  - test
  - deploy

build_job:
// highlight-next-line
  stage: build
  script:
    - echo "Compilation du projet..."

test_job:
// highlight-next-line
  stage: test
  script:
    - echo "Exécution des tests..."

deploy_job:
// highlight-next-line
  stage: deploy
  script:
    - echo "Déploiement en production..."
```

Plusieurs jobs peuvent être associés à un stage.
Par exemple dans le cadre d'une application divisée en
une partie frontend et backend, on peut imaginer le pipeline suivant : 

```yaml title=".gitlab-ci.yml" showLineNumbers
// highlight-next-line
stages:
  - build
  - deploy

# Deux jobs dans le stage "build"
compile_frontend:
// highlight-next-line
  stage: build
  script:
    - echo "Compilation du frontend..."

compile_backend:
// highlight-next-line
  stage: build
  script:
    - echo "Compilation du backend..."

# Un seul job dans le stage "deploy"
deploy_app:
// highlight-next-line
  stage: deploy
  script:
    - echo "Déploiement de l'application..."
```

:::tip Optimisation

Tous les jobs appartenant au même stage s'exécutent en parallèle 
si plusieurs runners sont disponibles.

:::

:::note Exercice F : Structurer un pipeline

Écrivez un pipeline pour l'application *demo-no-db* qui.

- Définit deux stages : *test* et *build*.
- Crée deux jobs distincts (*job-test* et *job-build*)
- S'exécute dans un environnement Maven basé sur l'image `maven:3.9.9-eclipse-temurin-23-alpine`.
- Utilise `mvn test` pour exécuter les tests dans *job-test*.
- Utilise `mvn package -DskipTests` pour compiler le projet sans exécuter les tests dans *job-build*.

:::

### Echange de fichiers entre jobs

Dans GitLab CI/CD, un **artifact** est un fichier ou un ensemble de fichiers générés 
lors de l'exécution d'un job dans un pipeline. 
Ces fichiers peuvent être sauvegardés et partagés **entre différents jobs du pipeline**.

Par exemple si vous souhaitez que le résultat de la compilation
par maven soit conservé pour le job de test, il suffit de modifier
le job de compilation comme ci-dessous :

```yaml title=".gitlab-ci.yml" showLineNumbers
build:
  stage: build
  image: maven:3.9.9-eclipse-temurin-23-alpine
  script:
    - echo "Compilation du projet..."
    - mvn compile
  artifacts:
    paths:
      - target/  # Conserver le dossier target
    expire_in: 1h  # L'artifact est supprimé après 1 heure
```

### Ajout d'une cache

La directive cache dans un fichier `.gitlab-ci.yml` permet de 
mémoriser certains fichiers ou répertoires sur le runner entre les 
différentes exécutions d'un pipeline. 
Cela évite de réinstaller ou reconstruire des dépendances à chaque 
job, réduisant ainsi le temps d’exécution du pipeline.

Par exemple Maven télécharge les dépendances d'un projet depuis un 
repository distant et les stocke localement dans le répertoire 
`~/.m2/repository`. 
Sans cache, chaque job Maven dans un pipeline re-téléchargera 
toutes les dépendances, ce qui est lent et consomme de la bande 
passante. Le pipeline ci-dessous montre comment utiliser ce cache
dans le cadre d'un job maven.

```yaml title=".gitlab-ci.yml" showLineNumbers
my_first_job:
  image: maven:3.9.9-eclipse-temurin-23-alpine
  cache:
    paths:
      - .m2/repository/
  script:
      - mvn test -Dmaven.repo.local=$CI_PROJECT_DIR/.m2/repository
```

:::note Exercice G : Optimiser les installations

Créez un pipeline GitLab CI/CD qui exécute le script Python 
suivant :

```python
import requests

response = requests.get("https://git.esi-bru.be/api/v4/broadcast_messages")
if response.status_code == 200:
    print("Requête réussie :", response.json())
else:
    print("Erreur :", response.status_code)
```

Le script nécessite un environnement *Python 3.8* et 
l'installation de la bibliothèque *requests* via la commande 
`pip install requests`.

1. Configurez le pipeline pour installer *requests* dans un 
environnement Docker avec l'image *python:3.8*.
1. Utilisez la directive `cache` pour stocker les dépendances 
installées dans le répertoire `~/.cache/pip`.
1. Vérifiez que le cache fonctionne en exécutant plusieurs fois le 
pipeline, en vous assurant que les dépendances ne sont pas 
téléchargées à chaque exécution.

:::

### Exécution conditionnée

#### Controller un job avec when 

Placée dans un job la directive `when` permet de contrôler quand ce
job doit être exécuté. 

Dans l'exemple ci-dessous, l'utilisation de `when: on_failure` 
signifie que le job ne sera exécuté que si l'un des jobs 
précédents échoue. 
Cela peut être particulièrement utile pour des actions telles que 
l'envoi de notifications en cas d'échec ou des processus de 
récupération, comme le rollback d'une base de données ou 
l'installation d'une version précédente de l'application si 
l'installation de la nouvelle version échoue.

```yaml title=".gitlab-ci.yml" showLineNumbers
stages:
  - build
  - test
  - notify

build-job:
  stage: build
  script:
    - echo "Compilation du projet..."
    - exit 1  # Simule un échec

test-job:
  stage: test
  script:
    - echo "Lancement des tests..."

notify-job:
  stage: notify
  script:
    - echo "Envoi de la notification d'échec..."
  when: on_failure  # Ce job s'exécute si un job précédent échoue
```

:::note Exercice H : Créer un job de récupération

Exécutez le pipeline ci-dessus et vérifiez que le job `notify-job`
est exécuté et que le job `test-job` ne démarre jamais via le menu *Build > Pipelines* de votre projet sur le serveur GitLab.

Modifiez le job `build-job:` et ajoutez la directive 
`allow_failure: true`. Quelle modification du comportement du
pipeline observez-vous ?

:::


Consultez les différentes valeurs possibles pour la directive `when` [dans la documentation](https://docs.gitlab.com/ci/yaml/#when).

:::tip valeur par défaut

Par défaut chaque job est associé aux directives *when: on_success*
et `allow_failure: false`. Ce qui explique que chaque job 
s'exécute si aucun job précédent n'est tombé en erreur.

:::


#### Controller un pipeline avec workflow

La directive `workflow` dans un fichier `.gitlab-ci.yml` permet de 
définir les conditions sous lesquelles un pipeline GitLab doit 
être exécuté. 
Elle sert à contrôler l'exécution du pipeline dans son ensemble, 
en fonction de conditions telles que des branches spécifiques, des 
événements de merge request, ou d'autres critères.

:::warning only/except

Les règles de contrôle d'exécution peuvent être définies
via les directives *only* et *except*. Mais ces directive sont
[signalées comme deprecated](https://docs.gitlab.com/ci/yaml/#only--except) et doivent être évitées.

:::


Dans l'exemple ci-dessous, le pipeline se déclenche seulement si 
le commit est sur la branche `main`. Cela permet de restreindre 
l'exécution des pipelines à des cas spécifiques, comme un 
déploiement sur la branche principale.

```yaml title=".gitlab-ci.yml" showLineNumbers
workflow:
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'

stages:
  - deploy

deploy-job:
  stage: deploy
  script:
    - echo "Déploiement de la version"
```

`rules:` permet de spécifier des règles basées sur des 
variables d'environnement (comme `$CI_COMMIT_BRANCH`, 
`$CI_COMMIT_TAG`,...). Chaque règle est précisée via l'utilisation
de `- if:`.

:::note Exercice H : Déployer une application sous condition

Un tag dans Git est une référence ou un marqueur attaché à un 
commit spécifique dans l'historique d'un projet. Contrairement à 
une branche, un tag est généralement utilisé pour marquer des 
points importants dans l'historique, comme des versions ou des 
releases. Les commandes suivantes permettent de créer un tag 
associé à la version 1.0 du projet.

```sh
git tag v1.0
git push origin v1.0
```

Créez un pipeline qui ne s'exécute que lorsqu'un tag correspondant
au format de version v1.0, v2.0, v3.0, etc., est ajouté au dépôt. 
Une expression régulière du type `^v\d+\.\d+$` peut être utilisée
pour reconnaître le format.

:::


### Analyse avec SonarQube

Une étape importante dans l'exécution d'un pipeline est l'analyse
du code déposé. Le GitLab Runner, chargé d'exécuter les demandes du script, 
crée **un nouveau conteneur** basé sur l’image spécifiée par la directive `image:`.

Pour permettre la communication entre le serveur SonarQube, créé lors du TD précédent, 
et ce conteneur temporaire, ils doivent être connectés au même réseau.
Vous aviez appelé ce réseau `sonar-network`.

La solution la plus simple, sans modifier manuellement le fichier de configuration 
situé dans le dossier `gitlab-runner/config`, consiste à :

- Retirer le GitLab Runner de la liste des runners de votre projet via l’interface web de [git.esi-bru.be](https://git.esi-bru.be).
- Arrêter le conteneur GitLab Runner avec la commande : `docker stop gitlab-runner`
- Supprimer le conteneur GitLab Runner avec : `docker rm gitlab-runner`
- Créer un nouveau conteneur GitLab Runner : 
<Tabs groupId="operating-systems">
  <TabItem value="Linux/macOS" label="Linux/MacOS">
  ```sh
  docker run -d \
    --name gitlab-runner \
    --restart always \
    -v /srv/gitlab-runner/config:/etc/gitlab-runner \
    -v /var/run/docker.sock:/var/run/docker.sock \
    gitlab/gitlab-runner:latest
  ```
 </TabItem>
  <TabItem value="win" label="Windows">
  N'oubliez pas chde remplacer dans la commande ci-dessous le *chemin_absolu_vers_la_configuration*

  ```sh
  docker run -d ^
    --name gitlab-runner ^
    --restart always ^
    -v chemin_absolu_vers_la_configuration\gitlab-runner\config:/etc/gitlab-runner ^
    -v /var/run/docker.sock:/var/run/docker.sock ^
    gitlab/gitlab-runner:latest
  ```
  </TabItem>
</Tabs>

- Enregistrer le runner en précisant le réseau auquel doivent être connectés tous les conteneurs utilisés, à l’aide de la commande

<Tabs groupId="operating-systems">
  <TabItem value="Linux/macOS" label="Linux/MacOS">
  ```sh
  docker run --rm \
    -v /srv/gitlab-runner/config:/etc/gitlab-runner \
    gitlab/gitlab-runner register \
      --non-interactive \
      --url "https://git.esi-bru.be" \
      // highlight-next-line
      --token "$RUNNER_TOKEN" \
      --executor "docker" \
      --docker-image alpine:latest \
      --description "docker-runner"
      // highlight-next-line
      --docker-network-mode "sonar-network"
  ```
 </TabItem>
  <TabItem value="win" label="Windows">
  N'oubliez pas chde remplacer dans la commande ci-dessous le *chemin_absolu_vers_la_configuration*

  ```sh
  docker run --rm ^
    -v chemin_absolu_vers_la_configuration\gitlab-runner\config:/etc/gitlab-runner ^
    gitlab/gitlab-runner register ^
      --non-interactive ^
      --url "https://git.esi-bru.be" ^
      // highlight-next-line
      --token "$RUNNER_TOKEN" 
      --executor "docker" ^
      --docker-image alpine:latest ^
      --description "docker-runner"
      // highlight-next-line
      --docker-network-mode "sonar-network"
  ```
  </TabItem>
</Tabs>

:::note Exercice I : Analyser la qualité du code

Créez un pipeline pour l'application *demo-no-db* qui lance
les tests de l'application et analyse le code via SonarQube.

Pour permettre au runner d'enregistrer les résultats de 
l'analyse de code à SonarQube, créez **la variable secrète** 
`SONAR_TOKEN` sur le serveur git contenant le token 
d'authentification au serveur SonarQube.

Le stage de compilation a utiliser est : 

```yaml title=".gitlab-ci.yml" showLineNumbers
build:
  stage: build
  image: maven:3.9.9-eclipse-temurin-23-alpine
  script:
    - echo "Compilation du projet..."
    - mvn compile
  artifacts:
    paths:
      - target/  # Sauvegarde les fichiers compilés
    expire_in: 1h
```

Le stage de test peut se résumer à :

```yaml title=".gitlab-ci.yml" showLineNumbers
test:
  stage: test
  image: maven:3.9.9-eclipse-temurin-23-alpine
  script:
    - echo "Exécution des tests avec JaCoCo..."
    - mvn test jacoco:report
  artifacts:
    paths:
      - target/site/jacoco/  # Sauvegarde le rapport JaCoCo
    expire_in: 1h
```

Le stage d'analyse peut s'écrire comme :

```yaml title=".gitlab-ci.yml" showLineNumbers
sonarqube:
  stage: sonarqube
  image: 
    name: sonarsource/sonar-scanner-cli:latest
  script: 
    - echo "Exécution de l'analyse via SonarQube"
    - sonar-scanner -Dsonar.host.url=http://sonarqube:9000 -Dsonar.login=$SONAR_TOKEN
```

Vérifiez le bon fonctionnement de votre pipeline en consultant
le résultat de l'analyse via [http://sonarqube:9000](http://sonarqube:9000).

:::

### Déploiement sur Alwaysdata

Lors des précédents TDs sur l’automatisation du déploiement sur 
AlwaysData, vous avez configuré une connexion SSH entre votre
machine hôte et AlwaysData en générant une clé SSH. 
La clé privée associée à cette connexion est stockée sur votre 
machine dans le fichier `~/.ssh/id_rsa`.

Pour automatiser le déploiement de l’application `demo-no-db` 
via un pipeline, le runner doit utiliser la commande 
`scp` pour transférer le fichier `.jar` généré après la 
compilation.

Afin d’établir une connexion sécurisée entre le runner et 
AlwaysData, vous devez ajouter votre clé privée SSH en tant que 
variable masquée dans GitLab CI/CD sous le nom `SSH_PRIVATE_KEY`.
Le pipeline pourra ensuite récupérer cette clé et l’utiliser grâce aux commandes suivantes :


```sh
echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa
```

Ces instructions permettront au runner de s’authentifier et 
d’effectuer le transfert du fichier sans intervention manuelle.

:::note Exercice J : Déployer sur AlwaysData

Créez un pipeline pour l’application *demo-no-db* qui :

- Compile l’application et génère le fichier **.jar**.
- Déploie automatiquement l’application sur AlwaysData.


Si le fichier **.jar** n’est pas disponible après la compilation, 
consultez [la documentation sur le mot-clé artifacts](https://docs.gitlab.com/ci/yaml/#artifacts).

Bonus : [La documentation d’AlwaysData](https://help.alwaysdata.com/en/api/)
indique qu’il est possible de redémarrer le serveur via une API.
Essayez d’intégrer cette fonctionnalité à votre pipeline pour 
déclencher automatiquement le redémarrage du serveur après le 
déploiement. 
 
:::


### Docker in Docker

Docker in Docker (DinD) désigne l'exécution de Docker à 
l'intérieur d'un conteneur Docker, permettant ainsi à un conteneur 
de lancer des commandes Docker et de gérer d'autres conteneurs.

Il est couramment utilisé dans les pipelines CI/CD lorsque des 
jobs doivent construire des images Docker directement au sein d'un 
conteneur.

Ce mécanisme est particulièrement utile pour vérifier qu'une image 
générée à partir de votre application est valide avant de 
l'envoyer vers un serveur cloud.

Voici un exemple de pipeline intégrant Docker in Docker :

```yaml title=".gitlab-ci.yml" showLineNumbers
docker_build:
  stage: docker_build
  image: docker:20.10.16  # Utilise l'image Docker pour construire l'image
  services:
    - docker:20.10.16-dind  # Active Docker-in-Docker
  script:
    - docker build -t $DOCKER_USERNAME/4dop1dr-image:$CI_COMMIT_REF_NAME .
  variables:
    DOCKER_TLS_CERTDIR: "/certs"  # Nécessaire pour Docker-in-Docker
```

Pour permettre à votre conteneur exécutant le job `docker_build` d'utiliser Docker (votre executor),
[la documentation mentionnne](https://docs.gitlab.com/ci/docker/using_docker_build/#use-the-docker-executor-with-docker-socket-binding)
qu'il faut enregistrer votre runner avec le volume `/var/run/docker.sock:/var/run/docker.sock`.

La solution la plus simple, sans modifier manuellement le fichier de configuration 
situé dans le dossier `gitlab-runner/config`, consiste à :

- Retirer le GitLab Runner de la liste des runners de votre projet via l’interface web de [git.esi-bru.be](https://git.esi-bru.be).
- Arrêter le conteneur GitLab Runner avec la commande : `docker stop gitlab-runner`
- Créer un nouveau conteneur GitLab Runner : 
- Supprimer le conteneur GitLab Runner avec : `docker rm gitlab-runner`
<Tabs groupId="operating-systems">
  <TabItem value="Linux/macOS" label="Linux/MacOS">
  ```sh
  docker run -d \
    --name gitlab-runner \
    --restart always \
    -v /srv/gitlab-runner/config:/etc/gitlab-runner \
    -v /var/run/docker.sock:/var/run/docker.sock \
    gitlab/gitlab-runner:latest
  ```
 </TabItem>
  <TabItem value="win" label="Windows">
  N'oubliez pas de remplacer dans la commande ci-dessous le *chemin_absolu_vers_la_configuration*

  ```sh
  docker run -d ^
    --name gitlab-runner ^
    --restart always ^
    -v chemin_absolu_vers_la_configuration\gitlab-runner\config:/etc/gitlab-runner ^
    -v /var/run/docker.sock:/var/run/docker.sock ^
    gitlab/gitlab-runner:latest
  ```
  </TabItem>
</Tabs>

- Enregistrer le runner en précisant le volume vers le socket Docker, à l’aide de la commande

<Tabs groupId="operating-systems">
  <TabItem value="Linux/macOS" label="Linux/MacOS">
  ```sh
  docker run --rm \
    -v /srv/gitlab-runner/config:/etc/gitlab-runner \
    gitlab/gitlab-runner register \
      --non-interactive \
      --url "https://git.esi-bru.be" \
      // highlight-next-line
      --token "$RUNNER_TOKEN" \
      --executor "docker" \
      --docker-image alpine:latest \
      --description "docker-runner"
      // highlight-next-line
      --docker-volumes /var/run/docker.sock:/var/run/docker.sock
  ```
 </TabItem>
  <TabItem value="win" label="Windows">
  N'oubliez pas chde remplacer dans la commande ci-dessous le *chemin_absolu_vers_la_configuration*

  ```sh
  docker run --rm ^
    -v chemin_absolu_vers_la_configuration\gitlab-runner\config:/etc/gitlab-runner ^
    gitlab/gitlab-runner register ^
      --non-interactive ^
      --url "https://git.esi-bru.be" ^
      // highlight-next-line
      --token "$RUNNER_TOKEN" 
      --executor "docker" ^
      --docker-image alpine:latest ^
      --description "docker-runner"
      // highlight-next-line
      --docker-volumes /var/run/docker.sock:/var/run/docker.sock
  ```
  </TabItem>
</Tabs>

L'utilisation de Docker in Docker sera implémentée lors des scénarios de synthèse qui récapitulent 
l’ensemble des étapes vues dans les TDs.
