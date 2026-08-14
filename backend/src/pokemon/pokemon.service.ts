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
}