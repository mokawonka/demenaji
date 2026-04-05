# <img src="app/assets/images/logo.png" alt="Demenaji Logo" width="200">

**Déménaji** est une plateforme immobilière algérienne connectant propriétaires, agents immobiliers et futurs locataires ou acquéreurs — le tout en un seul endroit.

---

## Fonctionnalités

- **Propriétaires** — publiez et gérez vos annonces de location ou de vente
- **Agents immobiliers** — gérez votre portefeuille de biens et vos clients
- **Chercheurs de logement** — parcourez le tout sur une carte les annonces par ville, wilaya, type de bien et budget.

---

## Prérequis

Assurez-vous d'avoir installé sur votre machine :

- Ruby `>= 3.2`
- Rails `8.1`
- PostgreSQL `>= 14`

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/mokawonka/demenaji.git
cd demenaji
```

### 2. Installer les dépendances Ruby

```bash
bundle install
```

### 3. Installer les dépendances JavaScript

```bash
yarn install
```

### 4. Configurer les variables d'environnement

Copiez le fichier d'exemple et renseignez vos valeurs :

```bash
cp .env.example .env
```

### 5. Créer et migrer la base de données

```bash
rails db:create db:migrate
```

### 6. Optionnel: Création d'une base de données de test

```bash
rails db:seed
```

### 7. Lancer le serveur

```bash
rails server
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## Stack technique

| Composant | Technologie |
|---|---|
| Backend | Ruby on Rails 8.1 |
| Base de données | PostgreSQL |
| Frontend | Hotwire (Stimulus) |
| Styles | CSS / Tailwind |
| Authentification | Devise |

---

## Contribution

Les contributions sont les bienvenues. Ouvrez une *issue* ou soumettez une *pull request*.

---

## Licence

Ce projet est sous licence MIT.