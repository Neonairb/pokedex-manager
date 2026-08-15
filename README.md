# PokéDex Manager

Web application for managing a personal Pokémon collection.

This project was developed as a full-stack application using Angular for the frontend and NestJS for the backend.

## Technologies

### Backend

- Node.js
- TypeScript
- NestJS
- Prisma ORM
- PostgreSQL

### Frontend

- Angular
- TypeScript
- Bootstrap

### External APIs

- [PokéAPI](https://pokeapi.co/)

## Run with Docker

The complete application—including Angular, NestJS, and PostgreSQL—starts with Docker Compose.

1. Create the local environment file:

   ```bash
   cp .env.example .env
   ```

2. Add your Gemini API key and replace the example secrets in `.env`.

3. Build and start the application:

   ```bash
   docker compose up --build
   ```

Open [http://localhost:8080](http://localhost:8080). Database migrations run automatically when the backend starts, and PostgreSQL data is retained in the `postgres_data` volume.

To stop the application:

```bash
docker compose down
```

Use `docker compose down --volumes` only when you also want to permanently remove the local database data.
