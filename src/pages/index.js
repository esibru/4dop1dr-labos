import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        {/* <p className="hero__subtitle">{siteConfig.tagline}</p> */}
        <div>
          <a
            className="button button--secondary button--lg"
            href="/devops/docs/Premier déploiement/td01-variables-environnements"
          >
            Commencer les travaux dirigés
          </a>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Introduction`}
      description="Laboratoires DEVOPS">
      <HomepageHeader />
      <main>
        {/* <HomepageFeatures /> */}
        <div className="text--left padding-horiz--md">
          <h2>Introduction aux pratiques DevOps</h2>
          <p>
            Bienvenue dans cette série de travaux dirigés (TD) dédiés à l'apprentissage des pratiques et des outils fondamentaux du DevOps.
            L'objectif de cette suite de travaux dirigés est de vous fournir une compréhension pratique des concepts clés du DevOps
            tout en vous guidant à travers des scénarios concrets. Vous apprendrez à concevoir, automatiser et optimiser des processus
            pour améliorer le développement et le déploiement d'applications.
          </p>

          <h3>Objectifs</h3>
          <p>
            Au fil des séances, vous serez amenés à :
          </p>
          <ul>
            <li>Comprendre les défis et les bonnes pratiques liés au déploiement d'applications.</li>
            <li>Maîtriser les outils essentiels du DevOps tels que Docker, GitLab CI/CD et Terraform.</li>
            <li>Explorer les interactions entre ces outils dans des scénarios réalistes.</li>
          </ul>

          <h3>Programme des travaux dirigés</h3>
          <ol>
            <li>
              <strong>Déploiement sur Alwaysdata</strong><br />
              Découvrez les points critiques d'un déploiement initial : configuration des environnements, gestion des dépendances et publication d'une application sur une plateforme d'hébergement.
            </li>
            <li>
              <strong>Introduction à Docker</strong><br />
              Apprenez à conteneuriser une application avec Docker afin de simplifier la configuration des environnements et la publication d'une application.
            </li>
            <li>
              <strong>Analyse de la qualité de code avec SonarQube</strong><br />
              Découvrez comment évaluer votre code grâce à SonarQube afin de détecter automatiquement les problèmes de qualité de code et d'autoriser uniquement les publications correctes.
            </li>
            <li>
              <strong>Créer un pipeline avec GitLab CI/CD </strong><br />
              Apprenez à automatiser le cycle de livraison en utilisant GitLab CI/CD qui mettra en interaction les outils étudiés (Docker, SonarQube, etc.).
            </li>
            <li>
              <strong>Déploiement sur Microsoft Azure</strong><br />
              Explorez les concepts de déploiement cloud sur Microsoft Azure. Vous apprendrez à configurer un environnement de production pour garantir un déploiement fiable.
            </li>
            <li>
              <strong>Infrastructure as Code (IaC) avec Terraform</strong><br />
              Découvrez comment gérer et provisionner vos infrastructures à l'aide de Terraform.
            </li>
            <li>
              <strong>Monitoring</strong><br />
              Apprenez à surveiller vos systèmes pour garantir leur performance et leur disponibilité.
            </li>
            <li>
              <strong>Scénarios pratiques : Interactions entre outils DevOps</strong><br />
              Terminez cette série de travaux dirigés avec des scénarios réalistes qui vous mettront dans des situations nécessitant l'utilisation coordonnée de plusieurs outils.
              Ces exercices vous prépareront à gérer des environnements DevOps dans le monde réel.
            </li>
          </ol>

          <p>
            Nous vous invitons à explorer, expérimenter et poser des questions pour tirer le meilleur parti de ces travaux dirigés.
          </p>
        </div>
      </main>
    </Layout>
  );
}
