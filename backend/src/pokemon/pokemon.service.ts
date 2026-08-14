import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  PokemonDetail,
  PokemonSummary,
} from './interfaces/pokemon.interface';

@Injectable()
export class PokemonService {
  constructor(private readonly httpService: HttpService) {}

  private readonly maxPokemonId = 1025;

  async getPokemonById(id: number): Promise<PokemonDetail> {
    try {
      const [pokemonResponse, speciesResponse] = await Promise.all([
        firstValueFrom(
          this.httpService.get(`/pokemon/${id}`),
        ),
        firstValueFrom(
          this.httpService.get(`/pokemon-species/${id}`),
        ),
      ]);

      const pokemon = pokemonResponse.data;
      const species = speciesResponse.data;

      const englishDescription =
        species.flavor_text_entries.find(
          (entry: any) => entry.language.name === 'en',
        );

      return {
        pokemonId: pokemon.id,
        name: pokemon.name,
        sprite:
          pokemon.sprites.other?.['official-artwork']
            ?.front_default ??
          pokemon.sprites.front_default ??
          null,

        description:
          englishDescription?.flavor_text
            ?.replace(/\f/g, ' ')
            .replace(/\n/g, ' ') ?? null,

        types: pokemon.types.map(
          (type: any) => type.type.name,
        ),

        height: pokemon.height,
        weight: pokemon.weight,

        status: null,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new NotFoundException(
          `Pokemon with id ${id} was not found`,
        );
      }

      throw new ServiceUnavailableException(
        'Unable to retrieve Pokémon data',
      );
    }
  }

  async getWildSearch(): Promise<PokemonSummary[]> {
    const ids = this.getRandomUniqueIds(3);

    const pokemon = await Promise.all(
      ids.map((id) => this.getPokemonById(id)),
    );

    return pokemon.map((item) => ({
      pokemonId: item.pokemonId,
      name: item.name,
      sprite: item.sprite,
      status: null,
    }));
  }

  private getRandomUniqueIds(amount: number): number[] {
    const ids = new Set<number>();

    while (ids.size < amount) {
      const id =
        Math.floor(Math.random() * this.maxPokemonId) + 1;

      ids.add(id);
    }

    return [...ids];
  }
}