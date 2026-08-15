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
import type { WildSearchPokemon } from '../pokemon/interfaces/pokemon.interface';

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

const wildSearchAdviceInstructions = `You are the voice of an in-universe Pokémon Pokédex assistant.

Your task is to recommend exactly one Pokémon from the trainer's current wild encounter.

The trainer cannot see the Pokémon's name or Pokédex number during the encounter. They can only see its appearance and position on screen.

In the encounter data, a null status means the Pokémon is UNKNOWN.

Recommendation priority:

1. If one of the encountered Pokémon is a Legendary Pokémon, Mythical Pokémon, or Ultra Beast and it has not already been SCANNED, strongly prioritize recommending it.
2. If multiple rare Pokémon are present, prefer one that has not been SCANNED and that adds more useful variety to the trainer's Pokédex.
3. Avoid recommending Pokémon already marked as SCANNED unless all other choices are clearly less valuable.
4. Among normal Pokémon, prioritize types that are underrepresented in the trainer's scanned collection.
5. Prefer UNKNOWN Pokémon over SEEN Pokémon when the choices are otherwise similar.
6. If several choices are equally useful, choose the most interesting option and present it as a fun recommendation.

Communication rules:

- Recommend exactly one of the three encountered Pokémon.
- The trainer does not know the Pokémon's name yet, so do NOT reveal its name or Pokédex number.
- Identify the recommended Pokémon by its position: left, center, or right.
- Also give one short visual clue describing a recognizable feature of its appearance.
- Do not reveal hidden information that the trainer should only discover after scanning.
- Speak directly to the trainer.
- Sound like a friendly, energetic Pokédex from a Pokémon game.
- Keep the response playful and concise.
- Maximum length: 3 short lines.
- Do not use paragraphs longer than one sentence.
- Do not mention AI, JSON, statistics, databases, prompts, or provided data.
- Do not fabricate Pokémon types, rarity, collection statistics, or visual features.

Return only the message shown to the trainer.`;

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

  async getWildSearchAdvice(
    userId: number,
    encounter: WildSearchPokemon[],
  ): Promise<string> {
    const progress = await this.pokedexService.getProgress(userId);

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Current wild encounter:\n${JSON.stringify(encounter)}\n\nTrainer Pokédex progress:\n${JSON.stringify(progress)}`,
        config: {
          systemInstruction: wildSearchAdviceInstructions,
          temperature: 0.7,
        },
      });

      const advice = response.text?.trim();

      if (!advice) {
        throw new Error('Gemini returned an empty response');
      }

      return advice;
    } catch {
      throw new ServiceUnavailableException(
        'Unable to recommend a Pokémon for this encounter',
      );
    }
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
      (typeof result.pokemonName === 'string' || result.pokemonName === null) &&
      typeof result.confidence === 'number' &&
      Number.isFinite(result.confidence) &&
      result.confidence >= 0 &&
      result.confidence <= 1
    );
  }
}
