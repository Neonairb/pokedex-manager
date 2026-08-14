import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PokemonService } from '../pokemon/pokemon.service';
import { EncounterDto } from './dto/encounter.dto';
import { ScanPokemonDto } from './dto/scan-pokemon.dto';

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
}