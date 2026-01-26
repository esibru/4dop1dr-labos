# TD 09 - Terraform

Dans ce TD, vous allez découvrir Terraform, un outil 
d’**Infrastructure as Code** (IaC) développé par HashiCorp. 
Terraform permet d’automatiser la création, la gestion et la mise à jour 
des infrastructures de manière **déclarative**. 
Grâce à lui, vous pouvez définir votre architecture sous forme de code 
et la déployer de manière **reproductible** et **cohérente**.

L’objectif de cet exercice est de vous familiariser avec les 
concepts de base de Terraform en mettant en place une infrastructure simple. 
Vous apprendrez à écrire un fichier de configuration, à initialiser un projet 
Terraform et à appliquer vos changements pour **provisionner** des ressources automatiquement.

### Objectifs 

À l’issue de ce TD, vous serez capable de créer une infrastructure sur Microsoft Azure
en utilisant un script Terraform.

:::warning Pré-requis

Connaissance de base des commandes shell, de Docker et du déploiement sur Microsoft Azure.

:::

## Installation

Pour installer Terraform vous pouvez suivre les étapes suivantes : 

1. Télécharger le binaire Terraform [en consultant la page officielle](https://developer.hashicorp.com/terraform/install)
1. Extraire et placer le binaire dans un dossier accessible
1. Ajouter ce dossier à la variable d’environnement `PATH` 

Vérifiez l'installation de Terraform en exécutant la commande `terraform version`

## Script et commandes

Un script Terraform est un fichier écrit en HCL 
([HashiCorp Configuration Language](https://developer.hashicorp.com/terraform/language/syntax/configuration)) 
qui décrit l’infrastructure qu’on souhaite créer, modifier ou supprimer de manière **déclarative**.
Un script Terraform est généralement nommés `main.tf` et est décomposé en **Blocs**.

:::info blocs

Un Bloc est une structure de configuration qui regroupe des arguments 
et des valeurs associées. 
Il est défini par un **type** et contient éventuellement des blocs imbriqués.

Un bloc suit *généralement* cette syntaxe :

```sh showLineNumbers
bloc_type "option, nom ou type" "nom_optionnel" {
  clé = valeur
  clé2 = valeur2

  bloc_imbriqué {
    clé = valeur
  }
}
```
:::

Le premier bloc que vous allez rencontrer est le bloc `terraform {}`.

```sh title="main.tf" showLineNumbers
terraform {
  required_version = ">= 1.11.0"
}
```

Ce bloc est utilisé pour spécifier des informations liées à l’environnement 
Terraform global. Dans l'exemple proposé il spécifie la version
minimale de Terraform pour exécuter ce script.

Vous pouvez consulter 
[la documentation du bloc terraform](https://developer.hashicorp.com/terraform/language/terraform)
pour connaitre les arguments autorisés.

En général un script Terraform est composé des types de blocs suivants : 

- `provider` : Définit la connexion à un service (Azure, Docker, AWS…).
- `variable` : Déclare une variable utilisée dans le script Terraform.
- `ressource` : Définit ce qui doit être créé (VM, conteneurs, bases de données,…).
- `output` : Affiche des informations utiles après l'exécution, comme les adresses IP des serveurs créés.

Si le script Terraform devient trop long, il peut être 
divisé en plusieurs fichiers (`variables.tf`, `outputs.tf`,…).
L'ensemble de ces scripts forment le projet Terraform.

### Bloc de type provider

Un **provider** dans Terraform est un plugin qui permet d’interagir avec une 
plateforme. Il agit comme un connecteur entre Terraform 
et l’infrastructure à gérer. La liste des providers est disponible sur le
[registre Terraform](https://registry.terraform.io/browse/providers).

Dans un premier temps, vous allez utiliser le **provider local** pour apprendre 
les commandes Terraform essentielles avant de passer à la gestion 
d'infrastructure dans le cloud. 
Comme son nom l'indique, ce provider permet de créer et de manipuler des ressources sur votre 
machine locale, ce qui est idéal pour se familiariser avec Terraform sans nécessiter 
de connexion à un cloud comme Azure.

Dans un nouveau dossier **créez** le fichier `main.tf` suivant : 

```sh title="main.tf" showLineNumbers
terraform {
  // highlight-next-line
  required_providers {
    local = {
      source = "hashicorp/local"
      version = "2.5.2"
    }
  // highlight-next-line  
  }
}

provider "local" {
  # Configuration options
}
```

Le bloc `terraform{}` est enrichi du sous bloc de type `required_providers`
Ce sous-bloc indique les providers 
nécessaires pour ce projet. [La configuration de ce bloc est
consultable en ligne](https://developer.hashicorp.com/terraform/language/providers/requirements). 
En résumé ce sous-bloc est composé des arguments : 

- `local` : indique le nom du provider.
- `source` : spécifie la source du provider, ici `hashicorp/local`, 
le provider du registre officiel de HashiCorp.
- `version` : spécifie la version du provider.

Vous constatez également qu'un nouveau bloc de type provider 
est ajouté : `provider "local" {}`.
Ce bloc permet de configurer le provider.
Dans ce premier exemple aucune configuration n'est requise.
Le code exemple pour utiliser ce provider provient directement de
l'onglet *USE PROVIDER* du 
[registre terraform](https://registry.terraform.io/providers/hashicorp/local/latest)

Afin de télécharger le provider, **exécutez** la commande suivante : 

```sh
terraform init
```

Vérifiez qu'un dossier `.terraform` est créé dans votre dossier
de travail. Ce dossier contient le provider local.

:::info dependency-lock

Le fichier *.terraform.lock.hcl* 
[depedency-lock](https://developer.hashicorp.com/terraform/language/files/dependency-lock#lock-file-location)
créé après l'exécution de la commande `terraform init` verrouille les versions précises 
des providers utilisés dans le projet Terraform. 
Ainsi, même si une nouvelle version d’un provider est publiée, Terraform 
utilisera toujours la même version que celle enregistrée dans ce fichier, 
garantissant la stabilité du projet.

Si vous souhaitez forcer une mise à jour la commande `terraform init -upgrade` devra être utilisée.

:::

### Bloc de type resource

Le bloc de type resource est utilisé pour définir une ressource,
c'est à dire un élément que Terraform va créer, modifier ou supprimer.

**Modifiez** le fichier `main.tf` pour intégrer la gestion d'une ressource
comme présenté ci-dessous.

```sh title="main.tf" showLineNumbers
terraform {
  required_providers {
    local = {
      source = "hashicorp/local"
      version = "2.5.2"
    }
  }
}

provider "local" {}

// highlight-start 
resource "local_file" "example" {
  content  = "Hello, Terraform!"
  filename = "${path.module}/example.txt"
}
// highlight-end
```

[La documentation de ce bloc](https://developer.hashicorp.com/terraform/language/resources/syntax)
précise qu'une ressource est définie via un type, `local_file` dans notre exemple.
Ensuite le nom `example` est associé à cette ressource afin de pouvoir
y faire référence dans le script.

Ce bloc est composé de deux arguments de configuration : 

- `content` : définit le contenu du fichier. 
- `filename` : définit le chemin du fichier créé. 
Ce chemin est spécifié par `path.module`, qui fait référence au 
répertoire où se trouve le fichier `.tf` actuel, suivi du nom du fichier `example.txt`. 

L'utilisation de cette ressource est expliquée dans 
[la documentation du provider local](https://registry.terraform.io/providers/hashicorp/local/latest/docs/resources/file).

Afin de connaître les actions que Terraform va entreprendre si vous
exécutez ce script, exécutez la commande : 

```sh
terraform plan
```

Le résultat de la commande doit vous indiquer les propriétés du
fichier `example.txt` qui va être créé.

```sh showLineNumbers
Terraform will perform the following actions:

  # local_file.example will be created
  + resource "local_file" "example" {
      + content              = "Hello, Terraform!"
      + content_base64sha256 = (known after apply)
      + content_base64sha512 = (known after apply)
      + content_md5          = (known after apply)
      + content_sha1         = (known after apply)
      + content_sha256       = (known after apply)
      + content_sha512       = (known after apply)
      + directory_permission = "0777"
      + file_permission      = "0777"
      + filename             = "./example.txt"
      + id                   = (known after apply)
    }

Plan: 1 to add, 0 to change, 0 to destroy.
```

Pour appliquer les modifications de l’infrastructure proposée,
utilisez la commande : 

```sh
terraform apply
```

:::info Do you want to perform these actions ?

Lors de l'exécution de la commande `apply`, Terraform vous demande à nouveau de vérifier
les changements qui vont être apportés. En effet il se peut que entre
l'exécution de la commande `plan` et `apply` des mises à jours ont modifié
l'état du système. Vous pouvez éviter cette dernière confirmation via
la commande `terraform apply --auto-approve`

:::

**Vérifiez** que le fichier `example.txt` est créé après l'exécution de la commande.

### État courant des ressources

Suite à la commande `terraform apply` un fichier JSON `terraform.tfstate` a été créé.
Ce fichier conserve un suivi précis de l'état actuel des ressources, c'est
grâce à lui que Terraform peut comparer l’état actuel avec la 
configuration déclarée dans le script pour déterminer ce qui doit être ajouté, modifié ou 
supprimé.

Si vous essayez à nouveau la commande `terraform apply`, vous devriez 
obtenir un résultat similaire à celui-ci : 

```sh showLineNumbers
local_file.example: Refreshing state... [id=42086c02e03bf671ddf621ed9922f52f2c7a605c]

No changes. Your infrastructure matches the configuration.

Terraform has compared your real infrastructure against your configuration and found no differences, so no changes are needed.

Apply complete! Resources: 0 added, 0 changed, 0 destroyed.
```
:::note Exercice A : Suppression de l'état

**Supprimez** le fichier `terraform.tfstate` et exécutez la commande `terraform apply`. Que se passe-t-il ?

:::

Pour obtenir la liste des ressources actuelles, exécutez la commande

```sh
terraform state list
```

Pour obtenir des détails sur une ressource particulière, la 
commande `terraform state show` peut vous aider.
Vous devez simplement spécifier le nom de votre ressource.
Par exemple le fichier a été créé via `resource "local_file" "example"`,
son nom est `local_file.example`. 

**Exécutez** la commande ci-dessous
pour obtenir les informations sur ce fichier.

```sh
terraform state show local_file.example
```

### Destruction des ressources

Si vous souhaitez supprimer toutes les ressources définies dans la 
configuration Terraform, utilisez la commande suivante : 

```sh
terraform destroy
```

:::warning destruction des ressources

- cette action est irréversible
- Terraform ne peut supprimer que ce qu’il gère, si des ressources ont été 
modifiées manuellement, Terraform pourrait ne pas les supprimer 
correctement.

:::

## Variables

### Déclarer une variable 

Les variables peuvent être définies dans le fichier `main.tf`.
Pour structurer son projet Terraform il est d'usage de les créer 
dans un fichier séparé.

La syntaxe de base pour **déclarer une variable** est la suivante : 

```sh showLineNumbers
variable "nom_de_la_variable" {
  type        = string
  description = "Description de la variable"
  default     = "valeur_par_défaut"
}
```

La liste des arguments du bloc `variable` et leurs valeurs est 
[consultable en ligne](https://developer.hashicorp.com/terraform/language/values/variables#declaring-an-input-variable).

:::note Exercice B : Secret

**Consultez** la documentation de Terraform pour déterminer 
quel argument faut-il ajouter au bloc de type variable  pour que sa valeur ne soit
jamais affichée dans le terminal ?

:::

Dans le dossier de votre projet Terraform, **créez** le fichier `variables.tf` 
avec le contenu suivant : 

```sh title="variables.tf" showLineNumbers
variable "file_content" {
  description = "Contenu du fichier"
  type        = string
  default     = "Hello, Terraform with variables!"
}

variable "file_name" {
  description = "Nom du fichier"
  type        = string
  default     = "my_file.txt"
}
```

Pour utiliser la variable dans le script `main.tf`, il suffit
d'y faire référence via le mot clé `var`. Par exemple `var.file_content`
fait référence à la variable `file_content`.

**Modifiez** le fichier `main.tf` comme ci-dessous.

```sh title="main.tf" showLineNumbers
terraform {
  required_providers {
    local = {
      source = "hashicorp/local"
      version = "2.5.2"
    }
  }
}

provider "local" {}

resource "local_file" "example" {
  content  = var.file_content
  filename = "${path.module}/${var.file_name}"
}
```

**Exécutez** le script pour créer le fichier et vérifiez le résultat.

:::tip valider un script

La commande `terraform validate` permet de vérifier la syntaxe et la cohérence des 
fichiers Terraform sans appliquer de modifications à l'infrastructure. Essayez cette
commande avant d'appliquer une mise à jour.

:::

### Assigner une valeur à une variable 

Seul la valeur par défaut d'une variable est utilisable pour l'instant.
Si vous souhaitez assigner une valeur à une variable, trois techniques s'offrent à vous : 
1. Créer un fichier `*.tfvars` avec les valeurs à assigner.
1. Passer les valeurs en arguments du script.
1. Exporter des variables d'environnements.

#### Fichier tfvars

**Créez** dans le repertoire de travail le fichier `terraform.tfvars`
ci-dessous.

```sh title="terraform.tfvars" showLineNumbers
file_content="contenu provenant du fichier tfvars"
file_name="nouveau_fichier.txt"
```

**Exécutez** le script pour créer le fichier et vérifiez le nom et le
contenu du fichier.

#### Paramètres de commande

Vous pouvez également passer des variables lors de l’exécution via
le paramètre `-var`.

:::note Exercice C : Passer un paramètre

**Exécutez** le script avec la commande ci-dessous pour créer le fichier 
et **vérifiez** le nom et le contenu du fichier. 

```sh
terraform apply -var="file_name=file-param.txt"
```

:::

### Variables d’environnement

Les variables d'environnements précédées du préfixe `TF_VAR` sont interprétées
par Terraform comme des variables de votre projet.

:::note Exercice D : Passer un paramètre

**Effacez** la valeur de la variable `file_content` du fichier `terraform.tfvars`.
**Exportez** ensuite la variable d'environnement `TF_VAR_file_content` avec la valeur
"contenu de la variable d’environnement".
**Exécutez** le script Terraform pour créer le fichier 
et **vérifiez** le nom et le contenu du fichier. 

:::

## Bloc de type output : affichage des résultats

En Terraform, le bloc de type output est utilisé pour afficher des valeurs 
après l'exécution de la commande `terraform apply`. Il permet d'extraire des informations 
importantes sur les ressources créées et de les rendre accessibles à l'utilisateur 
ou à d'autres scripts.

Ce bloc peut être défini dans le fichier `main.tf` mais 
pour structurer un projet Terraform il est d'usage de les créer 
dans un fichier séparé : `outputs.tf`.

**Créez** dans votre dossier de travail le fichier `outputs.tf` présenté ci-dessous.

```sh title="outputs.tf" showLineNumbers
output "file_path" {
  description = "Chemin du fichier créé"
  value       = local_file.example.filename
}
```

Lors de l'exécution de la commande `terraform apply`, les informations
suivantes seront affichées dans le terminal : 

```sh
Outputs:

file_path = "./my_file.txt"
```

:::tip Affichage des outputs

Vous pouvez afficher ce résultat par la suite via la commande suivante : 

```sh
terraform output file_path
```

Cette commande s’avère utile pour récupérer les adresses IP des serveurs créés.

:::

## Embranchements

Terraform permet d'utiliser des boucles et des conditions pour rendre 
les configurations plus dynamiques et flexibles. 

**Créez** le projet Terraform composé des fichiers
`variables.tf`, `main.tf` et `outputs.tf` ci-dessous.

```sh title="variables.tf" showLineNumbers
variable "file_count" {
  type    = number
  default = 3
}

variable "files_map" {
  type = map(string)
  default = {
    "fileA" = "Contenu du fichier A"
    "fileB" = "Contenu du fichier B"
    "fileC" = "Contenu du fichier C"
  }
}

variable "create_optional_file" {
  type    = bool
  default = false
}
```

```sh title="main.tf" showLineNumbers
terraform {
  required_providers {
    local = {
      source = "hashicorp/local"
      version = "2.5.2"
    }
  }
}

provider "local" {}

# Utilisation de count pour créer plusieurs fichiers
resource "local_file" "count_example" {
  count = var.file_count

  filename = "file_${count.index}.txt"
  content  = "Fichier numéro ${count.index}"
}

# Utilisation de for_each pour créer des fichiers avec des noms dynamiques
resource "local_file" "foreach_example" {
  for_each = var.files_map

  filename = "${each.key}.txt"
  content  = each.value
}

# Utilisation d’une condition pour créer un fichier optionnel
resource "local_file" "conditional_file" {
  count = var.create_optional_file ? 1 : 0

  filename = "optional_file.txt"
  content  = "Ce fichier est créé uniquement si create_optional_file est vrai"
}
```

```sh title="output.tf" showLineNumbers
# Outputs pour voir les fichiers créés
output "count_files" {
  value = [for f in local_file.count_example : f.filename]
}

output "foreach_files" {
  value = [for f in local_file.foreach_example : f.filename]
}

output "optional_file" {
  value = var.create_optional_file ? "optional_file.txt" : "Pas de fichier optionnel"
}
```

:::note Interpréter un script

Après avoir **exécuté** la commande `terraform apply`,
**expliquez** le fonctionnement des mots clés `count` et `for` et de l'opérateur `?`.
Consultez 
[la documentation sur les expressions terraform](https://developer.hashicorp.com/terraform/language/expressions) 
pour plus d'informations.

:::

## Provider Azure

Dans cette section, vous allez créer une infrastructure 
sur Microsoft Azure pour déployer l’application `demo-no-db` 
à partir de son image Docker. 
Commencez par préparer le code de l’application ainsi que 
le **Dockerfile** correspondant.

###  Client Azure

**Azure CLI**, pour Azure Command-Line Interface, est un outil en ligne de commande permettant 
de gérer et d'automatiser les ressources et services dans Microsoft Azure. 
Il permet d'interagir avec Azure en utilisant des commandes simples plutôt que 
de passer par le portail web d'Azure.

Installez Azure CLI en suivant 
[la documentation sur Microsoft Learn](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli).
**Vérifiez** l'installation via la commande `az version`.

### Authentification auprès du fournisseur

Plusieurs méthodes permettent de s’authentifier auprès d’Azure :

- **Azure CLI** (az login) : Authentification interactive via un compte utilisateur. 
Cette commande ouvre un navigateur pour valider la connexion.
- **Service Principal** : Représente une identité d’application dans Azure. 
Ce service utilise un client ID et un mot de passe (ou certificat). 
C’est la méthode recommandée pour les scénarios d’automatisation, 
comme avec Terraform ou GitLab CI.
- **Managed Identity** : Identité gérée automatiquement par Azure, 
associée à une ressource (ex. : VM, App Service). 
Elle est idéale lorsque l’exécution de Terraform se fait depuis Azure lui-même.

Dans le cadre de l’automatisation, l’approche recommandée est l’usage 
d’un Service Principal pour se connecter à Azure.

### Connexion via Azure CLI

Avant de créer un Service Principal, vous devez d’abord vous connecter 
à Azure en local à l’aide de la commande :

```sh
az login
```

Cette commande ouvre automatiquement une fenêtre de navigateur 
pour vous permettre de vous authentifier avec vos identifiants Azure.

Une fois connecté, votre terminal affichera les informations 
liées à votre compte et à votre abonnement, comme ci-dessous :

```sh
No     Subscription name    Subscription ID                       Tenant
-----  -------------------  ------------------------------------  ------------------------------------
[1] *  Azure for Students   ********-****-****-****-************  Haute Ecole Bruxelles Brabant (HE2B)
```

Notez bien votre **Subscription ID**, vous en aurez besoin dans 
les étapes suivantes pour attribuer les droits adéquats à votre Service Principal.

Si vous souhaitez afficher les informations associées à votre
compte, utilisez la commande :

```sh
az account show
```

### Création d'un Service principal

Suivez le tutoriel de 
[création du Service Principal disponible sur Microsoft Learn](https://learn.microsoft.com/en-us/azure/developer/terraform/authenticate-to-azure-with-service-principle?tabs=bash#create-a-service-principal).

:::warning export des variables ARM

Comme mentionné dans le tutoriel, n'oubliez pas d'exporter les variables
d'environnements permettant la connexion à Microsoft Azure 
via un Service principal. Le nom de ces variables est défini
par le provider Azure de Terraform.

```sh showLineNumbers
ARM_CLIENT_ID="your-client-id"
ARM_CLIENT_SECRET="your-client-secret"
ARM_SUBSCRIPTION_ID="your-subscription-id"
ARM_TENANT_ID="your-tenant-id"
```

:::

### Service principal devient propriétaire des ressources

La première étape consiste à accorder au Service Principal 
les autorisations nécessaires pour créer les ressources requises.

```sh
az role assignment create --assignee ${ARM_CLIENT_ID} --role "Owner" --scope /subscriptions/${ARM_SUBSCRIPTION_ID}
```

Le service principal a le rôle **Owner** sur l'ensemble de l'**abonnement**.
Il peut créer toutes les ressources nécessaires.

### Création du projet Terraform

Créez dans un nouveau dossier
les fichiers Terraform suivants : 

```sh
├── main.tf
├── outputs.tf
├── providers.tf
└── variables.tf
```

Commencez par compléter le fichier `providers.tf` 
contenant la configuration nécessaire
pour que Terraform se connecte à Microsoft Azure.

```sh title="providers.tf" showLineNumbers
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "4.26.0"
    }
  }
}

provider "azurerm" {
  features {}
}
```

Lors du déploiement d’une première application sur Azure, 
vous avez utilisé plusieurs types de ressources. 
Terraform permet d’automatiser la création de ces ressources.
La documentation officielle de ces ressources est disponible sur le 
[le registre terraform](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/resource_group).
Voici la configuration minimale requise pour chacune d’entre elles :

- **azurerm_resource_group** : Crée un groupe de ressources Azure pour 
regrouper et gérer les ressources liées entre elles.
```sh showLineNumbers
resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}
```
- **azurerm_user_assigned_identity** : Crée une identité managée 
pouvant être assignée à une ou plusieurs ressources pour l’authentification.
```sh
resource "azurerm_user_assigned_identity" "identity" {
  name                = var.identity_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
}
```
- **azurerm_container_registry** : Crée un registre de conteneurs Azure (ACR) 
pour stocker et gérer des images Docker.
```sh
resource "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}
```
- **azurerm_role_assignment** : Attribue un rôle spécifique (comme AcrPull) 
à une identité sur une ressource pour lui accorder des permissions précises.
```sh
resource "azurerm_role_assignment" "acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.identity.principal_id
}
```
- **azurerm_service_plan** : Définit un plan App Service qui spécifie 
les ressources (CPU/RAM/prix) utilisées par les applications web.
```sh
resource "azurerm_service_plan" "app_service_plan" {
  name                = var.service_plan_name
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "B1"
}
```
- **azurerm_linux_web_app** : Crée une application web Azure basée 
sur Linux, pouvant héberger une image Docker personnalisée.
```sh
resource "azurerm_linux_web_app" "app" {
  name                = var.web_app_name
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
  service_plan_id     = azurerm_service_plan.app_service_plan.id
}  
```

Vous allez utiliser ces configurations dans la suite de l'exercice.

#### Définition des variables

Ajoutez au fichier `variables.tf` les différentes variables
nécessaires au déploiement. Les valeurs par défaut et la description
doit vous permettre d'en comprendre le sens.

```sh title="variables.tf" showLineNumbers
variable "location" {
  description = "Azure region"
  type        = string
  default     = "West Europe"
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "rg-container-app"
}

variable "acr_name" {
  description = "Name of the Azure Container Registry"
  type        = string
  default     = "myacrregistry1234"
}

variable "identity_name" {
  description = "Name of the user-assigned managed identity"
  type        = string
  default     = "container-app-identity"
}

variable "service_plan_name" {
  description = "Name of the App Service plan"
  type        = string
  default     = "appserviceplan"
}

variable "web_app_name" {
  description = "Name of the Web App"
  type        = string
  default     = "my-container-app"
}
// highlight-start
variable "docker_image_name" {
  description = "Docker image name and tag"
  type        = string
  default     = "myapp:latest"
}

variable "web_app_port" {
  description = "Port on which the web app listens"
  type        = string
  default     = "8080"
}
// highlight-end
```

Vous pourrez adapter lors de l'exécution du script
les valeurs associées au nom de l'image et au numéro de port utiliser par
l'application.

#### Définition des ressources

Complétez le fichier `main.tf` avec les ressources à créer
dans le cloud. Prenez attention à la ressource définissant
l'application web, elle contient la configuration
spécifique de votre application.

```sh title="main.tf" showLineNumbers
resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_user_assigned_identity" "identity" {
  name                = var.identity_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
}

resource "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_role_assignment" "acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.identity.principal_id
}

resource "azurerm_service_plan" "app_service_plan" {
  name                = var.service_plan_name
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_web_app" "app" {
  name                = var.web_app_name
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
  service_plan_id     = azurerm_service_plan.app_service_plan.id
// highlight-start
  site_config {
    container_registry_use_managed_identity       = true
    container_registry_managed_identity_client_id = azurerm_user_assigned_identity.identity.client_id

    application_stack {
      docker_image_name   = var.docker_image_name
      docker_registry_url = "https://${azurerm_container_registry.acr.login_server}"
    }
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.identity.id]
  }

  app_settings = {
    WEBSITES_PORT = var.web_app_port
  }
  // highlight-end
}
```

Les détails des arguments utilisés sont consultables via
le [registre terraform](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/linux_web_app).

#### Définition des outputs

Afin d'obtenir les informations de connexion
à votre application, complétez le fichier `outputs.tf`
comme ci-dessous.

```sh title="outputs.tf" showLineNumbers
output "container_registry_login_server" {
  description = "Adresse du registre ACR"
  value       = azurerm_container_registry.acr.login_server
}

output "web_app_url" {
  description = "URL complète de l'application web"
  value       = "https://${azurerm_linux_web_app.app.default_hostname}/config"
}
```

#### Création de l'infrastructure

Les scripts Terraform en placent, vous pouvez créer
l'infrastructure via les commandes : 

- `terraform init`
- `terraform validate`
- `terraform apply`

Il vous reste une dernière étape, le déploiement de l'image
de `demo-no-db` sur le registre de conteneurs.

#### Déploiement de l'image sur le registre de conteneurs

Sur votre machine, placez-vous dans le dossier où se trouve le 
**Dockerfile** de l'application `demo-no-db`.
Les commandes ci-dessous vont déployer votre image sur le registre de conteneurs.

```sh
az acr login --name myacrregistry1234
docker build -t myacrregistry1234.azurecr.io/myapp:latest .
docker push myacrregistry1234.azurecr.io/myapp:latest
```

:::tip variables acr_name et docker_image_name

Si vous avez adapté le nom de votre registre de conteneurs
ou le nom de votre image, n'oubliez pas
de modifier la valeur *myacrregistry1234* ou la valeur *myapp*.

:::

Si tout est ordre vous devriez pouvoir consulter
l'application via l'url fournie par les outputs de Terraform.
En cas d'erreur consultez les logs de votre application.

## Intégration dans un Pipeline 

Pour intégrer la création de l’infrastructure dans le pipeline 
`gitlab-ci.yml`, il vous suffit de :

- adapter le fichier `.gitignore` 
[pour y inclure les fichiers liés à Terraform](https://github.com/github/gitignore/blob/main/Terraform.gitignore),
- ajouter le dossier contenant votre projet 
Terraform dans le dépôt,
- créer un nouveau job dans le pipeline qui exécute 
les commandes Terraform.

Cette étape sera réalisée lors des scénarios de synthèse qui récapitulent 
l’ensemble des étapes vues dans les TDs.