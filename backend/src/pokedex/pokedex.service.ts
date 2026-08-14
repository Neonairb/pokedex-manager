import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PokemonService } from '../pokemon/pokemon.service';
import { EncounterDto } from './dto/encounter.dto';

@Injectable()
export class PokedexService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pokemonService: PokemonService,
  ) {}

  private async markAsSeen(
    userId: number,
    pokemonId: number,
  ) {
    const existing =
      await this.prisma.userPokemon.findUnique({
        where: {
          userId_pokemonId: {
            userId,
            pokemonId,
          },
        },
      });

    if (existing?.status === 'SCANNED') {
      return existing;
    }

    return this.prisma.userPokemon.upsert({
      where: {
        userId_pokemonId: {
          userId,
          pokemonId,
        },
      },

      create: {
        userId,
        pokemonId,
        status: 'SEEN',
      },

      update: {
        status: 'SEEN',
      },
    });
  }

  private async markAsScanned(
    userId: number,
    pokemonId: number,
  ) {
    const scannedAt = new Date();

    return this.prisma.userPokemon.upsert({
      where: {
        userId_pokemonId: {
          userId,
          pokemonId,
        },
      },

      create: {
        userId,
        pokemonId,
        status: 'SCANNED',
        scannedAt,
      },

      update: {
        status: 'SCANNED',
        scannedAt,
      },
    });
  }

  async registerEncounter(
    userId: number,
    dto: EncounterDto,
  ) {
    if (dto.seenPokemonIds.includes(dto.scannedPokemonId)) {
      throw new BadRequestException(
        'Scanned Pokémon cannot also be marked as seen',
      );
    }

    await Promise.all(
      dto.seenPokemonIds.map((pokemonId) =>
        this.markAsSeen(userId, pokemonId),
      ),
    );

    await this.markAsScanned(
      userId,
      dto.scannedPokemonId,
    );

    await this.prisma.scanHistory.create({
      data: {
        userId,
        pokemonId: dto.scannedPokemonId,
        source: 'WILD_SEARCH',
      },
    });

    return {
      scannedPokemonId: dto.scannedPokemonId,
      seenPokemonIds: dto.seenPokemonIds,
    };
  }

  async scanPokemon(
    userId: number,
    pokemonId: number,
  ) {
    if (pokemonId <= 1) {
      throw new BadRequestException('pokemonId must be greater than 0');
    }

    await this.markAsScanned(
      userId,
      pokemonId,
    );

    await this.prisma.scanHistory.create({
      data: {
        userId,
        pokemonId: pokemonId,
        source: 'AI_IMAGE',
      },
    });

    return {
      pokemonId: pokemonId,
      status: 'SCANNED',
    };
  }

  async getHistory(userId: number) {
    const history =
      await this.prisma.scanHistory.findMany({
        where: {
          userId,
        },

        orderBy: {
          scannedAt: 'desc',
        },

        take: 5,
      });

    return Promise.all(
      history.map(async (scan) => {
        const pokemon =
          await this.pokemonService.getPokemonById(
            scan.pokemonId,
          );

        return {
          pokemonId: pokemon.pokemonId,
          name: pokemon.name,
          sprite: pokemon.sprite,
          scannedAt: scan.scannedAt,
          source: scan.source,
        };
      }),
    );
  }

  async getPokemonStatus(
    userId: number,
    pokemonId: number,
  ) {
    const userPokemon =
      await this.prisma.userPokemon.findUnique({
        where: {
          userId_pokemonId: {
            userId,
            pokemonId,
          },
        },

        select: {
          status: true,
        },
      });

    return userPokemon?.status ?? null;
  }

  async getPokedex(userId: number) {
    const [pokemonIds, userPokemon] =
      await Promise.all([
        this.pokemonService.getPokemonSpeciesIds(),

        this.prisma.userPokemon.findMany({
          where: {
            userId,
          },

          select: {
            pokemonId: true,
            status: true,
          },
        }),
      ]);

    const knownPokemon = await Promise.all(
      userPokemon.map(async (entry) => {
        const pokemon =
          await this.pokemonService.getPokemonSummary(
            entry.pokemonId,
          );

        return {
          pokemonId: entry.pokemonId,
          name: pokemon.name,
          sprite: pokemon.sprite,
          status: entry.status,
        };
      }),
    );

    const knownPokemonMap = new Map(
      knownPokemon.map((pokemon) => [
        pokemon.pokemonId,
        pokemon,
      ]),
    );

    return pokemonIds.map((pokemonId) => {
      const known =
        knownPokemonMap.get(pokemonId);

      if (known) {
        return known;
      }

      return {
        pokemonId,
        name: null,
        sprite: null,
        status: null,
      };
    });
  }
}