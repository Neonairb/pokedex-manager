import { GoogleGenAI, Type } from '@google/genai';
import {
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PokedexService } from '../pokedex/pokedex.service';
import { PokemonService } from '../pokemon/pokemon.service';
import {
  PokemonIdentification,
  PokemonImageScanResult,
  UploadedImage,
} from './interfaces/pokemon-identification.interface';

export const AI_CLIENT = Symbol('AI_CLIENT');

const identificationInstructions = `You are the Pokémon identification component of a Pokédex application.

Your task is to analyze an image and determine whether a recognizable official Pokémon is present.

Follow these rules:

1. Identify only official Pokémon species.
2. Return the canonical English species name in lowercase.
3. Do not invent Pokémon names.
4. If multiple Pokémon appear, identify the most visually prominent Pokémon.
5. If the image is unclear, heavily obstructed, or does not contain a recognizable Pokémon, report that no Pokémon was identified.
6. Do not classify humans, real animals, objects, logos, or characters from other franchises as Pokémon.
7. Base your answer primarily on visual evidence from the provided image.
8. Do not provide descriptions, trivia, explanations, or additional text.

Your response must follow the provided structured output schema.`;

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_CLIENT) private readonly ai: GoogleGenAI,
    private readonly pokemonService: PokemonService,
    private readonly pokedexService: PokedexService,
  ) {}

  async scanPokemonImage(
    userId: number,
    image: UploadedImage,
  ): Promise<PokemonImageScanResult> {
    const identification = await this.identifyPokemon(image);

    if (!identification.identified || !identification.pokemonName) {
      throw new NotFoundException(
        'No recognizable Pokémon was identified in the image',
      );
    }

    const pokemonId = await this.pokemonService.getPokemonIdByName(
      identification.pokemonName,
    );

    if (identification.confidence <= 0.5) {
      const suspectedPokemon =
        await this.pokemonService.getPokemonSummary(pokemonId);

      return {
        requiresConfirmation: true,
        pokemonId: suspectedPokemon.pokemonId,
        name: suspectedPokemon.name,
        sprite: suspectedPokemon.sprite,
      };
    }

    await this.pokedexService.scanPokemon(userId, pokemonId);
    const pokemon = await this.pokemonService.getPokemonById(pokemonId);

    return {
      ...pokemon,
      status: 'SCANNED',
      requiresConfirmation: false,
    };
  }

  private async identifyPokemon(
    image: UploadedImage,
  ): Promise<PokemonIdentification> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            inlineData: {
              mimeType: image.mimetype,
              data: image.buffer.toString('base64'),
            },
          },
          { text: 'Identify the Pokémon in this image.' },
        ],
        config: {
          systemInstruction: identificationInstructions,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              identified: {
                type: Type.BOOLEAN,
              },
              pokemonName: {
                type: Type.STRING,
                nullable: true,
              },
              confidence: {
                type: Type.NUMBER,
                minimum: 0,
                maximum: 1,
              },
            },
            required: ['identified', 'pokemonName', 'confidence'],
          },
          temperature: 0,
        },
      });

      if (!response.text) {
        throw new Error('Gemini returned an empty response');
      }

      return this.parseIdentification(response.text);
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      throw new ServiceUnavailableException(
        'Unable to identify the Pokémon in the image',
      );
    }
  }

  private parseIdentification(response: string): PokemonIdentification {
    const parsed: unknown = JSON.parse(response);

    if (!this.isPokemonIdentification(parsed)) {
      throw new ServiceUnavailableException(
        'The AI returned an invalid Pokémon identification',
      );
    }

    return {
      ...parsed,
      pokemonName: parsed.pokemonName?.trim().toLowerCase() ?? null,
    };
  }

  private isPokemonIdentification(
    value: unknown,
  ): value is PokemonIdentification {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const result = value as Record<string, unknown>;

    return (
      typeof result.identified === 'boolean' &&
      (typeof result.pokemonName === 'string' ||
        result.pokemonName === null) &&
      typeof result.confidence === 'number' &&
      Number.isFinite(result.confidence) &&
      result.confidence >= 0 &&
      result.confidence <= 1
    );
  }
}
