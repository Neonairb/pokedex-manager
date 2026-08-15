import { GoogleGenAI } from '@google/genai';
import { Test, TestingModule } from '@nestjs/testing';
import { PokedexService } from '../pokedex/pokedex.service';
import { PokemonService } from '../pokemon/pokemon.service';
import { AI_CLIENT, AiService } from './ai.service';

describe('AiService', () => {
  let service: AiService;
  const generateContent = jest.fn();
  const pokemonService = {
    getPokemonIdByName: jest.fn(),
    getPokemonSummary: jest.fn(),
    getPokemonById: jest.fn(),
  };
  const pokedexService = {
    scanPokemon: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: AI_CLIENT,
          useValue: {
            models: {
              generateContent,
            },
          } as unknown as GoogleGenAI,
        },
        {
          provide: PokemonService,
          useValue: pokemonService,
        },
        {
          provide: PokedexService,
          useValue: pokedexService,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('resolves and scans a confidently identified Pokémon', async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        identified: true,
        pokemonName: 'Pikachu',
        confidence: 0.97,
      }),
    });
    pokemonService.getPokemonIdByName.mockResolvedValue(25);
    pokemonService.getPokemonById.mockResolvedValue({
      pokemonId: 25,
      name: 'pikachu',
      sprite: 'pikachu.png',
      description: 'A mouse Pokémon.',
      types: ['electric'],
      height: 4,
      weight: 60,
      status: null,
    });
    pokedexService.scanPokemon.mockResolvedValue({
      pokemonId: 25,
      status: 'SCANNED',
    });

    await expect(
      service.scanPokemonImage(7, {
        buffer: Buffer.from('image'),
        mimetype: 'image/png',
      }),
    ).resolves.toEqual({
      pokemonId: 25,
      name: 'pikachu',
      sprite: 'pikachu.png',
      description: 'A mouse Pokémon.',
      types: ['electric'],
      height: 4,
      weight: 60,
      status: 'SCANNED',
      requiresConfirmation: false,
    });

    expect(pokemonService.getPokemonIdByName).toHaveBeenCalledWith(
      'pikachu',
    );
    expect(pokedexService.scanPokemon).toHaveBeenCalledWith(7, 25);
    expect(pokemonService.getPokemonById).toHaveBeenCalledWith(25);
  });

  it('returns an unscanned suspect when confidence is 50% or lower', async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        identified: true,
        pokemonName: 'eevee',
        confidence: 0.42,
      }),
    });
    pokemonService.getPokemonIdByName.mockResolvedValue(133);
    pokemonService.getPokemonSummary.mockResolvedValue({
      pokemonId: 133,
      name: 'eevee',
      sprite: 'eevee.png',
      status: null,
    });

    await expect(
      service.scanPokemonImage(7, {
        buffer: Buffer.from('image'),
        mimetype: 'image/jpeg',
      }),
    ).resolves.toEqual({
      requiresConfirmation: true,
      pokemonId: 133,
      name: 'eevee',
      sprite: 'eevee.png',
    });

    expect(pokedexService.scanPokemon).not.toHaveBeenCalled();
    expect(pokemonService.getPokemonById).not.toHaveBeenCalled();
  });

  it('returns not found when no Pokémon is recognized', async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        identified: false,
        pokemonName: null,
        confidence: 0,
      }),
    });

    await expect(
      service.scanPokemonImage(7, {
        buffer: Buffer.from('image'),
        mimetype: 'image/webp',
      }),
    ).rejects.toMatchObject({
      status: 404,
      message: 'No recognizable Pokémon was identified in the image',
    });

    expect(pokemonService.getPokemonIdByName).not.toHaveBeenCalled();
    expect(pokedexService.scanPokemon).not.toHaveBeenCalled();
  });
});
