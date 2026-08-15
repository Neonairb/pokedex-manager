# Pokédex Manager

A full-stack web application inspired by the Pokédex devices from the Pokémon games. It allows each Trainer to encounter Pokémon, register discoveries, browse a personal Pokédex, and receive contextual assistance during wild encounters.

The entire interface is presented inside a persistent Pokédex device. The frontend is built with Angular, the API uses NestJS, and each Trainer's data is stored in PostgreSQL.

## Features

- Trainer registration and login.
- JWT authentication and protected routes.
- Wild searches that return three random Pokémon.
- `UNKNOWN`, `SEEN`, and `SCANNED` discovery states.
- Automatic registration of unselected encounter Pokémon as seen.
- History of the five most recent scans.
- Complete National Pokédex with state filters.
- Detailed records for scanned Pokémon.
- Limited information for seen Pokémon.
- Pokémon identification from uploaded images.
- Gemini recommendations based on the encounter and Trainer progress.
- Responsive interface contained within a reusable Pokédex shell.
- Complete Docker Compose deployment.

## Technologies

### Backend

- Node.js 24
- TypeScript
- NestJS 11
- Prisma ORM 7
- PostgreSQL 17
- JWT
- `class-validator`

### Frontend

- Angular 22
- TypeScript 6
- Bootstrap 5
- RxJS
- Custom responsive CSS

### External services

- [PokéAPI](https://pokeapi.co/) for Pokémon data, descriptions, and sprites.
- [Google Gemini API](https://ai.google.dev/) for image identification and encounter recommendations.

### Infrastructure

- Docker
- Docker Compose
- Nginx

## Repository structure

```text
pokedex-manager/
├── backend/                       NestJS API
│   ├── prisma/
│   │   ├── migrations/            PostgreSQL migrations
│   │   └── schema.prisma          Database models
│   └── src/
│       ├── ai/                    Image scans and recommendations
│       ├── auth/                  Registration, login, JWT, and guard
│       ├── pokedex/               Progress, encounters, and history
│       ├── pokemon/               PokéAPI integration
│       └── prisma/                PostgreSQL access
├── frontend/                      Angular application
│   └── src/app/
│       ├── core/                  Models, services, guard, and interceptor
│       ├── layout/                Persistent Pokédex device shell
│       ├── pages/                 Login, registration, Home, and Pokédex
│       └── shared/                Reusable visual components
├── compose.yaml                   Complete stack orchestration
└── .env.example                   Docker environment template
```

## Quick start with Docker

Docker Compose is the recommended way to run the complete application. It starts PostgreSQL, applies database migrations, launches the API, and serves the frontend through Nginx.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine with the Compose plugin.
- A valid Google Gemini API key for the AI features.

### Configuration

From the repository root, create the environment file:

```bash
cp .env.example .env
```

Edit the root `.env` file:

```env
APP_PORT=8080
POSTGRES_PASSWORD=choose-a-database-password
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
AI_API_KEY=your-real-gemini-api-key
```

> [!IMPORTANT]
> Docker Compose reads the `.env` file at the repository root. The `backend/.env` file is used only when running NestJS directly during local development.

### Running the application

Build the images and start every service:

```bash
docker compose up --build
```

When the services are ready, open:

```text
http://localhost:8080
```

Stop the application without removing PostgreSQL data:

```bash
docker compose down
```

> [!WARNING]
> `docker compose down --volumes` also deletes the `postgres_data` volume and permanently removes all locally stored users, discoveries, and scan history.

## Docker services

| Service | Purpose | Access |
|---|---|---|
| `frontend` | Builds Angular and serves the application through Nginx | `http://localhost:8080` |
| `backend` | Runs the NestJS API and Prisma migrations | Internal Docker network |
| `database` | Stores application data in PostgreSQL | Internal Docker network |

Nginx forwards browser requests from `/api` to the backend. The Gemini key, JWT secret, and PostgreSQL credentials are never included in the Angular bundle.

The public port can be changed in `.env`:

```env
APP_PORT=8081
```

The application will then be available at `http://localhost:8081`.

## Environment variables

### Docker Compose

| Variable | Default | Description |
|---|---|---|
| `APP_PORT` | `8080` | Public application port |
| `POSTGRES_PASSWORD` | `pokedex` | Password for the internal PostgreSQL user |
| `JWT_SECRET` | Example value | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | `1d` | Authentication token lifetime |
| `AI_API_KEY` | No valid key | Google Gemini API key |

Replace `JWT_SECRET` and `AI_API_KEY` before using the application.

### Local backend development

To run NestJS without Docker, create `backend/.env` from `backend/.env.example`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE?schema=public"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="1d"
AI_API_KEY="your-gemini-api-key"
```

## Running locally without Docker

### Prerequisites

- Node.js 24
- npm
- PostgreSQL 17
- A Google Gemini API key

### Database

Create a PostgreSQL database and set `DATABASE_URL` in `backend/.env`. Then install dependencies, generate the Prisma client, and apply the migrations:

```bash
cd backend
npm ci
npx prisma generate
npx prisma migrate deploy
```

### Backend

From `backend/`:

```bash
npm run start:dev
```

The API will be available at:

```text
http://localhost:3000
```

### Frontend

In another terminal, from `frontend/`:

```bash
npm ci
npm start
```

Open:

```text
http://localhost:4200
```

The development configuration uses `http://localhost:3000` as the API URL. Production builds use `/api` through Nginx.

## Authentication

Registration requires a valid email address and a password of at least eight characters. After login, the API returns a JWT that the frontend stores and automatically attaches through an HTTP interceptor.

All Pokémon, Pokédex, and AI routes require:

```http
Authorization: Bearer <token>
```

The `/home` and `/pokedex` screens are also protected by an Angular route guard.

## Discovery states

Each Pokémon has an independent state for each Trainer.

| State | Meaning | Visible information |
|---|---|---|
| `UNKNOWN` | It has never appeared in an encounter | Hidden entry without a name or sprite |
| `SEEN` | It appeared but was not selected | Number, sprite, and the name `???` |
| `SCANNED` | It was selected or identified | Complete record and scan history |

During an encounter, the selected Pokémon becomes `SCANNED`. The other two become `SEEN`, except for Pokémon that were already scanned.

## Wild Search flow

1. The Trainer starts a search from the Home screen.
2. The API returns three Pokémon with unique `left`, `center`, and `right` positions.
3. The frontend renders every Pokémon in the position specified by the API.
4. The Trainer can scan one option or ask the Pokédex assistant for advice.
5. Scanning updates the discovery states and creates a history entry.
6. The screen displays the complete record for the selected Pokémon.

The recommendation receives the current encounter and the Trainer's progress. Gemini selects one position without revealing the Pokémon's name or National Pokédex number before it is scanned.

## AI features

### Image identification

The Trainer can upload a JPEG, PNG, or WebP image up to 10 MB.

- A high-confidence identification registers the Pokémon immediately.
- A lower-confidence identification asks for confirmation before registration.
- An image without a recognizable Pokémon does not modify the Pokédex.

### Encounter advice

The assistant analyzes:

- The three Pokémon in the encounter.
- Their positions on the screen.
- Their current discovery states.
- Types that are underrepresented in the Trainer's progress.
- The potential rarity of each option.

The response recommends exactly one position and is displayed as an in-universe Pokédex message.

## Database structure

PostgreSQL stores only Trainer-specific information. General species data is retrieved from PokéAPI.

### `User` table

| Field | Type | Description |
|---|---|---|
| `id` | `Int` | Primary identifier |
| `email` | `String` | Unique Trainer email |
| `passwordHash` | `String` | Hashed password |
| `createdAt` | `DateTime` | Registration date |
| `updatedAt` | `DateTime` | Last update date |

### `UserPokemon` table

| Field | Type | Description |
|---|---|---|
| `id` | `Int` | Primary identifier |
| `userId` | `Int` | Owning Trainer |
| `pokemonId` | `Int` | National Pokédex number |
| `status` | `SEEN` or `SCANNED` | Discovery state |
| `firstSeenAt` | `DateTime` | First recorded encounter |
| `scannedAt` | `DateTime?` | Most recent scan, when available |
| `updatedAt` | `DateTime` | Last update date |

The `userId + pokemonId` combination is unique.

### `ScanHistory` table

| Field | Type | Description |
|---|---|---|
| `id` | `Int` | Primary identifier |
| `userId` | `Int` | Owning Trainer |
| `pokemonId` | `Int` | Scanned Pokémon |
| `source` | `WILD_SEARCH` or `AI_IMAGE` | Registration source |
| `scannedAt` | `DateTime` | Scan date and time |

```text
User (1) ──────────< (N) UserPokemon
  │
  └───────────────< (N) ScanHistory
```

Deleting a user also deletes their discoveries and history through cascading relations.

## Main endpoints

When Docker is used, Nginx publishes endpoints with the `/api` prefix. When accessing the local backend directly on port `3000`, the routes do not use this prefix.

### Authentication

| Method | Public Docker route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Registers a Trainer |
| `POST` | `/api/auth/login` | Logs in and returns a JWT |
| `GET` | `/api/auth/me` | Returns the authenticated Trainer |

Registration example:

```json
{
  "email": "trainer@example.com",
  "password": "pokemon123"
}
```

### Pokémon

| Method | Public Docker route | Description |
|---|---|---|
| `GET` | `/api/pokemon/wild-search` | Generates a three-Pokémon encounter |
| `GET` | `/api/pokemon/{id}` | Returns information according to discovery state |

Example Wild Search response:

```json
[
  {
    "pokemonId": 25,
    "name": "pikachu",
    "sprite": "https://...",
    "status": null,
    "position": "left"
  }
]
```

The real response always contains three entries, one for each position.

### Pokédex

| Method | Public Docker route | Description |
|---|---|---|
| `GET` | `/api/pokedex` | Returns the Trainer's National Pokédex |
| `GET` | `/api/pokedex/history` | Returns the five most recent scans |
| `GET` | `/api/pokedex/progress` | Counts scanned Pokémon by type |
| `POST` | `/api/pokedex/encounter` | Registers an encounter result |
| `POST` | `/api/pokedex/scan/{pokemonId}` | Registers a Pokémon from image identification |

Example encounter registration:

```json
{
  "scannedPokemonId": 25,
  "seenPokemonIds": [1, 4]
}
```

### Artificial intelligence

| Method | Public Docker route | Description |
|---|---|---|
| `POST` | `/api/ai/scan-image` | Identifies a Pokémon in an image |
| `POST` | `/api/ai/wild-search-advice` | Recommends one encounter option |

`scan-image` uses `multipart/form-data` with a field named `image`.

`wild-search-advice` directly receives the same three-entry array returned by `wild-search` and responds with the recommendation message as plain text.

## Main rules

- Every encounter contains exactly three different Pokémon.
- The `left`, `center`, and `right` positions cannot be repeated.
- A scanned Pokémon never returns to `SEEN`.
- The selected Pokémon cannot also appear in `seenPokemonIds`.
- Every scan creates a separate history entry.
- A complete Pokémon record requires the `SCANNED` state.
- A `SEEN` Pokémon exposes only limited information.
- An unknown Pokémon cannot be retrieved directly.
- AI features require authentication and a valid Gemini key.
- Encounter advice must not reveal a Pokémon's name or number before scanning.

## Tests and builds

### Backend

```bash
cd backend
npm test
npm run build
```

### Frontend

```bash
cd frontend
npm test
npm run build
```

## Troubleshooting

### AI features appear unavailable

Confirm that the real key is in the root `.env` file:

```env
AI_API_KEY=your-real-gemini-api-key
```

Then recreate the services:

```bash
docker compose down
docker compose up --build
```

Inspect the backend logs without publishing the key:

```bash
docker compose logs -f backend
```

### Port 8080 is already in use

Change `APP_PORT` in `.env`, for example:

```env
APP_PORT=8081
```

### The Prisma schema changed

Create a migration during development:

```bash
cd backend
npx prisma migrate dev --name migration_name
```

When Docker starts, `prisma migrate deploy` automatically applies pending migrations.

### Reset the local database completely

```bash
docker compose down --volumes
docker compose up --build
```

This procedure permanently deletes the data stored in the local Docker volume.
