import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# TD 01 - Livrer une application

Ce TD est consacré au déploiement d’une application Spring Boot sur un serveur distant. 
Pour ce faire vous devrez empaqueter une application et utiliser 
des variables d'environnements.

### Objectifs 

À l’issue de ce TD, vous serez capable :

1. D'empaqueter (package) une application Java sous forme de fichier JAR exécutable.
1. Créer un compte AlwaysData et de configurer un environnement d’hébergement.
1. Générer une clé SSH pour sécuriser les échanges avec AlwaysData.
1. Déployer une application Spring Boot sur AlwaysData.

:::warning Pré-requis

1. Connaissance de base en Spring Boot et des commandes shell.
1. Un environnement de travail prêt avec Git, Java (JDK 17 minimum) et un IDE (VS Codium).

:::

## Analyse de l'application à déployer

Commencez par récupérer l'application Spring-Boot à déployer via 
la commande 

```
git clone https://git.esi-bru.be/4dop1dr-ressources/demo-no-db.git
```

Cette application est composée du contrôleur suivant : 

```java title="be.esi.devops.demo.rest.ServiceRestController" showLineNumbers
@RestController
public class ServiceRestController {

    @Autowired
    private Environment environment;

    @GetMapping("/config")
    public Map<String, String> getEnvironmentDetails() {
        Map<String, String> envDetails = new HashMap<>();

        // Récupération des propriétés système
        String javaVersion = System.getProperty("java.version");
        String osName = System.getProperty("os.name");
        String userName = System.getProperty("user.name");

        // Ajouter les propriétés systèmes
        envDetails.put("Java Version", javaVersion);
        envDetails.put("Operating System", osName);
        envDetails.put("User Name", userName);

        // Récupération des propriétés de configuration Spring Boot
        // depuis application.properties
        String appName = environment.getProperty("spring.application.name");
        String port = environment.getProperty("server.port");

        // Ajouter les propriétés dans la réponse
        envDetails.put("Application Name", appName);
        envDetails.put("Port Number", port);

        return envDetails;
    }
}
```

Ce contrôleur expose un service REST qui retourne des détails sur 
la configuration de l'environnement dans lequel l'application
 s'exécute. 

Le contrôleur récupère en premier les **propriétés systèmes** `java.version`, `os.name` et `user.name`.

:::info Java system property

Les propriétés systèmes ou **Java system property** sont 
initialisées lors du démarrage du JDK et dépendent de la 
configuration de l'environnement ("de la machine") de travail. 
La liste des propriétés initialisées est disponible dans la 
javadoc de la méthode `System.getProperty()`. [Consultez cette liste via ce lien et vérifiez si il est possible de récupérer le dossier de travail courant.](https://devdocs.io/openjdk~21/java.base/java/lang/system#getProperties())

:::

Ensuite le contrôleur via la classe 
`org.springframework.core.env.Environment` récupère les valeurs 
des **propriétés de configuration Spring Boot**, c'est à dire les
 variables du fichier `application.properties`.

```java title="application.properties"
spring.application.name=demo pour devops
server.port=8080
```

La première variable est un `String` représentant le nom associé à 
l'application. La seconde variable est le numéro de port associé à 
l'application.

### Exécution de l'application

Afin de vérifier que votre environnement de travail est 
opérationnel, essayez de démarrer l'application via l'outil 
`maven` embarqué avec l'application.

Dans le dossier racine de l'application, vérifiez la présence des 
scripts `.mvnw` prévu pour des environnements Linux/macOS et 
`.mvnw.cmd` destiné à des environnements  Windows. 
Essayez d'exécuter le script correspondant à votre environnement 
via la commande : 

<Tabs groupId="operating-systems">
  <TabItem value="Linux/macOS" label="Linux/macOS">
  ```
    ./mvnw --version
    ```
  </TabItem>
  <TabItem value="win" label="Windows">
  ```
  ./mvnw.cmd --version
  ```
  </TabItem>
</Tabs>

:::info Droits d'exécution

Sur un environnement Linux/macOs pensez à vérifier les droits 
d'exécution du script via la commande `ls -lrtd *`. 

:::

Vous devez obtenir un résultat proche de 

```
Apache Maven 3.9.9
Maven home: /home/g12345/.m2/wrapper/dists/apache-maven-3.9.9/3477a4f1
Java version: 23.0.1, vendor: Oracle Corporation, runtime: /home/g12345/.jdks/openjdk-23.0.1
Default locale: fr_FR, platform encoding: UTF-8
OS name: "linux", version: "6.8.0-51-generic", arch: "amd64", family: "unix"
```

Dans le cas contraire, résolvez l'erreur suite à l'exécution du 
script avant de continuer. Si le script a les droits d’exécution, 
une erreur classique est l'absence  de la variable d'environnement 
système `JAVA_HOME` voir l'absence du chemin vers le JDK dans le 
`PATH` de votre machine.
[Vous trouverez la marche à suivre sur ce wiki pour définir ces variables d'environnements systèmes.](https://www.wikihow.com/Set-Java-Home)

:::warning Variables d'environnement système

Une variable d'environnement système est définie au niveau du 
système d'exploitation et est accessible par tous les processus.
JAVA_HOME et PATH sont des variables d'environnement système.

On définit ces variables dans un terminal via une instruction 
`export MY_VAR=value`

:::

Vous pouvez désormais démarrer l'application avec la commande

<Tabs groupId="operating-systems">
  <TabItem value="Linux/macOS" label="Linux/macOS">
  ```
    ./mvnw spring-boot:run
    ```
  </TabItem>
  <TabItem value="win" label="Windows">
  ```
  ./mvnw.cmd spring-boot:run
  ```
  </TabItem>
</Tabs>

### Consommer le service REST

Pour consulter le résultat de la consommation du service rest, 
vous pouvez utiliser votre browser préféré, mais il est préférable 
d'apprendre à effectuer toutes vos actions via le terminal. 
L'objectif de cette démarche est d'apprendre un des piliers des 
pratiques DevOps, réussir à **automatiser** toutes les actions 
entreprises pour déployer une application. 

:::note Exercice

Utilisez la commande `wget` ou la commande `curl` pour consommer 
le service `localhost:8080/config`. N'hésitez pas à tester les 
différentes options de ces commandes. Le résultat de la commande 
doit ressembler à 

```JSON
{"User Name":"g12345","Java Version":"23.0.1","Operating System":"Linux","Application Name":"demo pour devops","Port Number":"8080"}
```

Un format plus agréable est possible en redirigeant le contenu 
JSON dans `python3 -m json.tool` par exemple.

```JSON
{
    "User Name": "g12345",
    "Java Version": "23.0.1",
    "Operating System": "Linux",
    "Application Name": "demo pour devops",
    "Port Number": "8080"
}
```

:::

## Empaqueter l'application

L'empaquetage (package) en développement logiciel consiste à regrouper tous 
les fichiers nécessaires au fonctionnement d'une application dans 
un seul fichier exécutable ou déployable. Pour les applications 
Java, cela se traduit souvent par la création d’un fichier JAR 
(Java ARchive). 
Dans un projet Spring Boot, l'empaquetage produit généralement un 
fichier JAR autonome, contenant le code de l’application, toutes ses dépendances 
et un serveur embarqué Tomcat.

:::info Tomcat

Un serveur Tomcat est un conteneur de servlets open-source développé 
par la fondation Apache. Il est conçu pour exécuter des applications 
web basées sur les technologies Java.
Lors de l'exécution d'une application Spring Boot, le serveur Tomcat 
embarqué démarre automatiquement et prend en charge les requêtes HTTP. 
Cela simplifie énormément le déploiement, car il n'y a pas besoin de 
configurer un serveur externe.

:::

Ce fichier JAR exécutable peut ensuite être lancé directement ou 
déployé sur un serveur, simplifiant le processus de distribution 
et d’exécution de l’application.

Pour réaliser l'empaquetage de l'application, exécutez la commande : 

<Tabs groupId="operating-systems">
  <TabItem value="Linux/macOS" label="Linux/macOS">
  ```
    ./mvnw package
    ```
  </TabItem>
  <TabItem value="win" label="Windows">
  ```
  ./mvnw.cmd package
  ```
  </TabItem>
</Tabs>

Vérifiez la présence du fichier `demo-1.0.0.jar` dans le dossier 
`target/` et validez l'étape d'empaquetage en démarrant 
l'application via la commande

```
java -jar demo-1.0.0.jar
```

Consultez le résultat de la consommation du service rest via la 
commande `wget` ou `curl` puis arrêtez votre serveur.

:::note Exercice

Dans un **même terminal** : 

1. Définissez la variable d'environnement 
système via `export SERVER_PORT=8081`.
1. Démarrez le serveur avec `java -jar demo-1.0.0.jar`.

Prenez note de l'url à laquelle répond votre application : 
`localhost:8080/config` ou `localhost:8081/config` ?

Arrêtez votre serveur et dans le **même terminal**, 
lancez la commande ajoutant 
une _Java System Property_

```
java -jar -Dserver.port=8082 demo-1.0.0.jar 
```

À quelle url répond votre application ?

Finalement lancez la commande qui ajoute en plus une propriété de 
configuration Spring Boot

```
java -jar -Dserver.port=8082 demo-1.0.0.jar --server.port=8083
```

Déduisez l'ordre de priorité entre les différentes variables
(variable d'environnement système, Java System Property et 
propriété de configuration Spring Boot).

:::

Comprendre la différence entre la portée de ces variables et leurs 
priorités est utile lorsqu'il faudra, dans le prochain TD, faire 
correspondre un numéro de port défini sur un serveur en ligne avec 
celui de notre application. 


## Préparer l’infrastructure

AlwaysData est une plateforme qui permet d'héberger des sites web, des applications et des bases de données en ligne. 
Elle prend en charge de nombreuses technologies telles que PHP, Python, Node.js, Ruby et Java. Elle est compatible avec des systèmes de bases de données comme MySQL, PostgreSQL, SQLite et MongoDB. 
De plus, elle offre un accès SSH pour une gestion avancée.
Pour déployer une application Spring Boot sur cette plateforme,
[commencez par vous inscrire sur Alwaysdata en utilisant votre adresse mail étudiant.](https://www.alwaysdata.com/fr/inscription/)

### Installer le JDK

Une fois connecté, la page d’accueil affiche les **Sites** associés à votre compte. 
Un premier site est créé et à la forme *g12345.alwaysdata.net*. 

:::warning

Par défaut la machine qui héberge votre site ne dispose pas d'une version du JDK installée.
[Consultez la documentation de Alwaysdata avant de passer à la suite afin de comprendre les étapes suivantes.](https://help.alwaysdata.com/en/languages/java/configuration/)

:::

Appuyez sur le bouton permettant de modifier le site &#9881;&#65039;
- Changez le *Type* en *User program*.
- Ajoutez dans le champs *Command* `java -jar demo-1.0.0.jar --server.address=:: --server.port=$PORT`.
- Dans le champs *Working directory* ajoutez `www`, qui est le dossier de travail
prévu pour votre application. 

### Activer SSH

:::info
SSH (Secure Shell) est un protocole réseau sécurisé qui permet d'établir une connexion à distance entre deux machines, généralement un ordinateur local et un serveur. Il offre une communication chiffrée pour garantir la confidentialité et la sécurité des échanges.
:::

Pour pouvoir déposer le fichier JAR de l'application, il faut définir le protocole de communication entre la machine de développement et la machine hébergée chez Alwaydata. Les deux machines vont communiquer via SSH.

1. Sur la page de votre compte, sélectionnez le menu `Remote access > SSH` dans le menu de navigation. 
Cette page liste les utilisateurs SSH associés à votre compte. Un utilisateur par défaut a été créé lors de la création de votre compte mais cet utilisateur n'est pas utilisable. 
1. Cliquez sur le bouton pour modifier cet utilisateur &#9881;&#65039; et cochez la case `Enable password-based login `. Cette option va vous permettre de vous connecter à la machine réservée pour vous sur Alwaysdata en utilisant le mot de passe de votre compte.
1. **Vérifiez** que l'activation SSH fonctionne en ouvrant sur votre machine de travail un terminal et en exécutant la commande `ssh g12345@ssh-g12345.alwaysdata.net`
1. Confirmez cette première connexion en répond `yes` à la question `Are you sure you want to continue connecting (yes/no/[fingerprint])?`
1. Entrez votre mot de passe quand il vous est demandé. 
1. Si la connexion est un succès, le prompt de votre terminal a changé pour `g12345@ssh2:~$` et vous pouvez consulter le contenu de la machine associée à votre compte via `ls -lrtd *`.
1. Vous devez voir deux dossier `admin` et `www`. Le dossier `www` est vide et va bientôt accueillir votre fichier JAR.
1. Entrez la commande `exit` pour vous déconnecter.

### Créer une clé SSH

Une pratique courante consiste à configurer une clé SSH.
Cette clé permet de se connecter automatiquement aux serveurs sans nécessiter de mot de passe à chaque connexion, offrant ainsi une solution pratique pour les utilisateurs réguliers.
De plus, les clés SSH sont indispensables pour automatiser des tâches avec des scripts ou des outils comme Git, garantissant une connexion sécurisée sans intervention humaine.

:::note Exercice

Créez une clé SSH sur votre machine en suivant [la marche à suivre via ce lien.](https://help.alwaysdata.com/en/remote-access/ssh/use-keys/)

**Vérifiez** la connexion via `ssh g12345@ssh-g12345.alwaysdata.net`
Si la connexion échoue, utilisez l'option `-v` (verbose) de la commande `ssh` pour obtenir des informations détaillées.
:::


## Déployer l'application

L’infrastructure en place, le déploiement se résume à copier l'application empaquetée dans le dossier d’accueil sur la machine hébergée en ligne en utilisant le protocole SSH. 

:::note Exercice

Utilisez la commande `scp` pour copier le fichier JAR dans le dossier `www`  et déployer l'application. 

Après le déploiement tester le résultat via la commande `wget` ou `curl` via l'url `http://g12345.alwaysdata.net/`

:::

